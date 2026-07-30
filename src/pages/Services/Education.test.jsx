import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Education from "./Education.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

vi.mock("../../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));
vi.mock("../../context/AuthContext.jsx", () => ({ useAuth: vi.fn() }));

const scholarship = {
  pathwayCode: "scholarships",
  title: "Find and apply for scholarships",
  category: "Funding",
  authority: "National Scholarships Portal",
  officialUrl: "https://scholarships.gov.in/",
  officialAction: "Open National Scholarships Portal",
  summary: "Check eligible government scholarship schemes and prepare evidence.",
  learnerStages: ["school", "higher-secondary", "undergraduate", "postgraduate"],
  goalCodes: ["funding"],
  boundary: "Vidhya Vedha helps you prepare. Submission and verification remain official.",
  requirements: ["Current institution and course details", "Scheme-specific evidence"],
  tasks: [
    { taskId: "read-current-guidance", title: "Read current applicant guidance", description: "Check the active cycle.", officialUrl: "https://scholarships.gov.in/" },
    { taskId: "submit-official-application", title: "Submit on the official portal", description: "Keep the official reference.", officialUrl: "https://scholarships.gov.in/" },
  ],
};
const career = {
  pathwayCode: "career-guidance",
  title: "Explore careers and counselling",
  category: "Career planning",
  authority: "National Career Service",
  officialUrl: "https://www.ncs.gov.in/",
  officialAction: "Open National Career Service",
  summary: "Explore occupations and counselling.",
  learnerStages: ["school", "higher-secondary", "undergraduate", "postgraduate", "working"],
  goalCodes: ["career-guidance"],
  boundary: "Guidance cannot guarantee an outcome.",
  requirements: ["Your current education stage"],
  tasks: [
    { taskId: "map-interests", title: "Map interests", description: "Write down priorities." },
    { taskId: "explore-occupations", title: "Explore occupations", description: "Compare entry routes." },
  ],
};
const plan = {
  planId: "EDU-12AB34CD",
  pathwayCode: scholarship.pathwayCode,
  pathwayTitle: scholarship.title,
  authority: scholarship.authority,
  officialUrl: scholarship.officialUrl,
  learnerStage: "undergraduate",
  target: "Post-matric scholarship",
  targetCycle: "current-cycle",
  status: "active",
  createdAt: "2026-07-28T10:00:00.000Z",
  tasks: scholarship.tasks.map((task) => ({ ...task, status: "not-started", completedAt: null })),
};

const configureApi = (savedPlans = []) => {
  api.get.mockImplementation((url) => {
    if (url === "/education/pathways") return Promise.resolve({ data: { pathways: [scholarship, career] } });
    if (url === "/education/plans/mine") return Promise.resolve({ data: { plans: savedPlans } });
    return Promise.reject(new Error(`Unexpected GET ${url}`));
  });
  api.post.mockResolvedValue({ data: { plan } });
  api.patch.mockImplementation((url) => {
    if (url.includes("/tasks/")) return Promise.resolve({ data: { plan: { ...plan, tasks: [{ ...plan.tasks[0], status: "completed" }, plan.tasks[1]] } } });
    if (url.endsWith("/archive")) return Promise.resolve({ data: { plan: { ...plan, status: "archived", archivedAt: "2026-07-29T10:00:00.000Z" } } });
    return Promise.reject(new Error(`Unexpected PATCH ${url}`));
  });
};

const renderPage = () => render(<MemoryRouter><Education /></MemoryRouter>);

const chooseScholarship = async () => {
  await screen.findByRole("heading", { name: scholarship.title });
  fireEvent.change(screen.getByLabelText(/your current stage/i), { target: { value: "undergraduate" } });
  fireEvent.click(screen.getByRole("button", { name: /scholarship funding/i }));
};

describe("Education pathway planning", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureApi();
  });

  it("routes visitors to an official service without collecting education records", async () => {
    useAuth.mockReturnValue({ user: null });
    renderPage();
    await chooseScholarship();

    expect(screen.getAllByRole("link", { name: /open national scholarships portal/i })[0]).toHaveAttribute("href", scholarship.officialUrl);
    expect(screen.getByText(/submission and verification remain official/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/marks/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/roll number/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/aadhaar/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in to continue/i })).toHaveAttribute("href", "/login");
  });

  it("saves a minimal action plan for a signed-in learner", async () => {
    useAuth.mockReturnValue({ user: { name: "Anjali", role: "citizen" } });
    renderPage();
    await chooseScholarship();
    fireEvent.change(screen.getByLabelText(/specific exam, course or scheme/i), { target: { value: "Post-matric scholarship" } });
    fireEvent.click(screen.getByLabelText(/current application cycle/i));
    fireEvent.click(screen.getByRole("button", { name: /save this action plan/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/education/plans", {
      pathwayCode: "scholarships",
      learnerStage: "undergraduate",
      target: "Post-matric scholarship",
      targetCycle: "current-cycle",
    }));
    expect(await screen.findByText("EDU-12AB34CD")).toBeInTheDocument();
  });

  it("tracks checklist progress and requires confirmation before archiving", async () => {
    useAuth.mockReturnValue({ user: { name: "Anjali", role: "citizen" } });
    configureApi([plan]);
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: /my action plans/i }));

    fireEvent.click(await screen.findByLabelText(/read current applicant guidance/i));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith(
      "/education/plans/EDU-12AB34CD/tasks/read-current-guidance",
      { completed: true },
    ));

    fireEvent.click(screen.getByRole("button", { name: /^archive$/i }));
    expect(screen.getByText(/archive this plan/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /yes, archive/i }));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/education/plans/EDU-12AB34CD/archive"));
  });

  it("explains when the selected stage has no matching official route", async () => {
    useAuth.mockReturnValue({ user: null });
    renderPage();
    await screen.findByRole("heading", { name: scholarship.title });
    fireEvent.change(screen.getByLabelText(/your current stage/i), { target: { value: "international" } });
    fireEvent.click(screen.getByRole("button", { name: /scholarship funding/i }));

    expect(screen.getByRole("heading", { name: /no single official route matches/i })).toBeInTheDocument();
  });
});