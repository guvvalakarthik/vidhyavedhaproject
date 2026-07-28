import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Banking from "./Banking.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

vi.mock("../../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));
vi.mock("../../context/AuthContext.jsx", () => ({ useAuth: vi.fn() }));

const governmentCredit = {
  pathwayCode: "government-credit",
  title: "Explore credit-linked government schemes",
  category: "Government credit",
  authority: "JanSamarth, Department of Financial Services",
  officialUrl: "https://www.jansamarth.in/home",
  officialAction: "Open JanSamarth",
  summary: "Check government credit-linked schemes.",
  needCodes: ["business-credit"],
  boundary: "Vidhya Vedha does not decide eligibility, quote a rate or sanction credit.",
  preparationItems: ["Your purpose for borrowing", "Current official evidence", "The lender's KFS"],
  watchFor: ["A guaranteed approval", "Unofficial fees", "An offer without APR"],
  tasks: [
    { taskId: "define-credit-purpose", title: "Define the credit purpose", description: "Write down the purpose." },
    { taskId: "check-jansamarth-schemes", title: "Check schemes on JanSamarth", description: "Review current schemes.", officialUrl: "https://www.jansamarth.in/home" },
  ],
};

const bankingComplaint = {
  pathwayCode: "banking-complaint",
  title: "Escalate a banking or payment complaint",
  category: "Banking grievance",
  authority: "Reserve Bank of India Complaint Management System",
  officialUrl: "https://cms.rbi.org.in/",
  officialAction: "Open RBI CMS",
  summary: "Complain to the regulated entity first.",
  needCodes: ["banking-complaint"],
  boundary: "Vidhya Vedha does not submit complaints or hold account evidence.",
  preparationItems: ["Provider reference", "Dated timeline", "Official evidence"],
  watchFor: ["Fake recovery agents", "A non-RBI complaint site", "Deleted references"],
  tasks: [
    { taskId: "contact-regulated-entity", title: "Complain to the regulated entity first", description: "Use its official grievance channel." },
    { taskId: "file-or-track-rbi-cms", title: "File or track through RBI CMS", description: "Use the official portal.", officialUrl: "https://cms.rbi.org.in/" },
  ],
};

const plan = {
  planId: "FIN-12AB34CD",
  pathwayCode: governmentCredit.pathwayCode,
  pathwayTitle: governmentCredit.title,
  authority: governmentCredit.authority,
  officialUrl: governmentCredit.officialUrl,
  target: "Working capital research",
  planningHorizon: "within-three-months",
  status: "active",
  createdAt: "2026-07-28T10:00:00.000Z",
  tasks: governmentCredit.tasks.map((task) => ({ ...task, status: "not-started", completedAt: null })),
};

const configureApi = (savedPlans = []) => {
  api.get.mockImplementation((url) => {
    if (url === "/finance/pathways") return Promise.resolve({ data: { pathways: [governmentCredit, bankingComplaint] } });
    if (url === "/finance/plans/mine") return Promise.resolve({ data: { plans: savedPlans } });
    return Promise.reject(new Error(`Unexpected GET ${url}`));
  });
  api.post.mockResolvedValue({ data: { plan } });
  api.patch.mockImplementation((url) => {
    if (url.includes("/tasks/")) {
      return Promise.resolve({
        data: { plan: { ...plan, tasks: [{ ...plan.tasks[0], status: "completed" }, plan.tasks[1]] } },
      });
    }
    if (url.endsWith("/archive")) {
      return Promise.resolve({
        data: { plan: { ...plan, status: "archived", archivedAt: "2026-07-29T10:00:00.000Z" } },
      });
    }
    return Promise.reject(new Error(`Unexpected PATCH ${url}`));
  });
};

const renderPage = () => render(<MemoryRouter><Banking /></MemoryRouter>);

describe("financial guidance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureApi();
  });

  it("hands visitors to an official service without collecting application data", async () => {
    useAuth.mockReturnValue({ user: null });
    renderPage();

    expect(await screen.findByRole("heading", { name: governmentCredit.title })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /open jansamarth/i })).toHaveAttribute("href", governmentCredit.officialUrl);
    expect(screen.getByText(/does not decide eligibility, quote a rate or sanction credit/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/annual income/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/account number/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/credit score/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/nominee/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });

  it("shows the provider-first RBI complaint route", async () => {
    useAuth.mockReturnValue({ user: null });
    renderPage();
    await screen.findByRole("heading", { name: governmentCredit.title });

    fireEvent.click(screen.getByRole("button", { name: /banking complaint/i }));

    expect((await screen.findAllByRole("heading", { name: bankingComplaint.title })).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/complain to the regulated entity first/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("link", { name: /open rbi cms/i })).toHaveAttribute("href", bankingComplaint.officialUrl);
  });

  it("calculates loan cost locally and never calls the API for calculator values", async () => {
    useAuth.mockReturnValue({ user: null });
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: /loan cost calculator/i }));

    fireEvent.change(screen.getByLabelText(/illustrative loan amount/i), { target: { value: "100000" } });
    fireEvent.change(screen.getByLabelText(/annual interest rate/i), { target: { value: "12" } });
    fireEvent.change(screen.getByLabelText(/repayment term/i), { target: { value: "12" } });

    expect(screen.getByText(/₹8,885/)).toBeInTheDocument();
    expect(screen.getByText(/₹6,619/)).toBeInTheDocument();
    expect(screen.getByText(/not saved, transmitted or used to assess eligibility/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("saves only a minimal preparation plan for a signed-in user", async () => {
    useAuth.mockReturnValue({ user: { name: "Anjali", role: "citizen" } });
    renderPage();
    await screen.findByRole("heading", { name: governmentCredit.title });

    fireEvent.change(await screen.findByLabelText(/purpose label/i), { target: { value: "Working capital research" } });
    fireEvent.click(screen.getByLabelText(/within three months/i));
    fireEvent.click(screen.getByRole("button", { name: /save preparation plan/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/finance/plans", {
      pathwayCode: "government-credit",
      target: "Working capital research",
      planningHorizon: "within-three-months",
    }));
    const payload = JSON.stringify(api.post.mock.calls[0][1]);
    expect(payload).not.toMatch(/income|account|policy|creditScore|principal|rate/i);
    expect(await screen.findByText("FIN-12AB34CD")).toBeInTheDocument();
  });

  it("tracks owner checklist progress and confirms archival", async () => {
    useAuth.mockReturnValue({ user: { name: "Anjali", role: "citizen" } });
    configureApi([plan]);
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: /my preparation plans/i }));

    fireEvent.click(await screen.findByLabelText(/define the credit purpose/i));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith(
      "/finance/plans/FIN-12AB34CD/tasks/define-credit-purpose",
      { completed: true },
    ));

    fireEvent.click(screen.getByRole("button", { name: /^archive$/i }));
    expect(screen.getByText(/archive this plan/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /yes, archive/i }));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/finance/plans/FIN-12AB34CD/archive"));
  });
});
