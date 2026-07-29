import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Utilities from "./Utilities.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
vi.mock("../../services/api.js", () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }));
vi.mock("../../context/AuthContext.jsx", () => ({ useAuth: vi.fn() }));
const guide = { guideCode: "telecom-complaint", category: "telecom", title: "Mobile or broadband complaint escalation", authority: "Provider complaint centre", officialUrl: "https://www.trai.gov.in/faqcategory/complaint", summary: "Complain to the provider and retain the docket.", boundary: "Never share OTPs or payment credentials.", tasks: [{ taskId: "provider-complaint", title: "Contact the provider complaint centre", description: "Use official support." }] };
const issue = { issueId: "UTL-12AB34CD", guideCode: guide.guideCode, guideTitle: guide.title, authority: guide.authority, officialUrl: guide.officialUrl, providerLabel: "My provider", referenceLabel: "Docket 42", issueDate: "2026-07-20", status: "tracking", tasks: guide.tasks.map((task) => ({ ...task, status: "not-started" })) };
const configure = (issues = []) => {
  api.get.mockImplementation((url) => url.endsWith("/guides") ? Promise.resolve({ data: { guides: [guide] } }) : Promise.resolve({ data: { issues } }));
  api.post.mockResolvedValue({ data: { issue } });
  api.patch.mockImplementation((url, payload) => Promise.resolve({ data: { issue: url.includes("/tasks/") ? { ...issue, tasks: [{ ...issue.tasks[0], status: "completed" }] } : { ...issue, status: payload.status } } }));
};
const renderPage = () => render(<MemoryRouter><Utilities /></MemoryRouter>);

describe("Utilities complaint guidance", () => {
  beforeEach(() => { vi.clearAllMocks(); configure(); });
  it("uses an official route without bill-payment or credential forms", async () => {
    useAuth.mockReturnValue({ user: null }); renderPage();
    expect(await screen.findByRole("heading", { name: guide.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /official guidance/i })).toHaveAttribute("href", guide.officialUrl);
    expect(screen.queryByLabelText(/consumer number|account number|payment mode|otp/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/submit request/i)).not.toBeInTheDocument();
  });
  it("creates a tracker with minimal labels", async () => {
    useAuth.mockReturnValue({ user: { name: "Maya" } }); renderPage(); await screen.findByRole("heading", { name: guide.title });
    fireEvent.change(screen.getByLabelText(/provider label/i), { target: { value: "My provider" } });
    fireEvent.change(screen.getByLabelText(/complaint reference/i), { target: { value: "Docket 42" } });
    fireEvent.change(screen.getByLabelText(/issue date/i), { target: { value: "2026-07-20" } });
    fireEvent.click(screen.getByRole("button", { name: /create issue tracker/i }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/utilities/issues", { guideCode: guide.guideCode, providerLabel: "My provider", referenceLabel: "Docket 42", issueDate: "2026-07-20" }));
    expect(JSON.stringify(api.post.mock.calls[0][1])).not.toMatch(/accountNumber|consumerNumber|payment|otp/i);
  });
  it("updates progress and resolves the issue", async () => {
    useAuth.mockReturnValue({ user: { name: "Maya" } }); configure([issue]); renderPage();
    fireEvent.click(await screen.findByRole("button", { name: /my issue trackers/i }));
    fireEvent.click(screen.getByLabelText(/contact the provider complaint centre/i));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/utilities/issues/UTL-12AB34CD/tasks/provider-complaint", { completed: true }));
    fireEvent.click(screen.getByRole("button", { name: /mark resolved/i }));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/utilities/issues/UTL-12AB34CD/status", { status: "resolved" }));
  });
});
