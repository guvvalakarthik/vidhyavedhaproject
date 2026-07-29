import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Farming from "./Farming.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

vi.mock("../../services/api.js", () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }));
vi.mock("../../context/AuthContext.jsx", () => ({ useAuth: vi.fn() }));

const pathway = {
  pathwayCode: "soil-health-card",
  title: "Soil testing and Soil Health Card",
  category: "soil",
  authority: "Department of Agriculture and Farmers Welfare",
  officialUrl: "https://soilhealth.dac.gov.in/",
  summary: "Find the official soil testing route.",
  boundary: "A recognised laboratory and agricultural authority own the result and recommendation.",
  tasks: [
    { taskId: "identify-plot-crop", title: "Identify the plot and intended crop", description: "Keep the plot and crop clear." },
    { taskId: "find-testing-route", title: "Find the recognised testing route", description: "Use official guidance." },
  ],
};
const plan = {
  planId: "FRM-12AB34CD",
  pathwayCode: pathway.pathwayCode,
  pathwayTitle: pathway.title,
  authority: pathway.authority,
  officialUrl: pathway.officialUrl,
  crop: "Paddy",
  district: "Kottayam",
  season: "kharif",
  status: "active",
  tasks: pathway.tasks.map((task) => ({ ...task, status: "not-started", completedAt: null })),
};

const configureApi = (plans = []) => {
  api.get.mockImplementation((url) => {
    if (url === "/farming/pathways") return Promise.resolve({ data: { pathways: [pathway] } });
    if (url === "/farming/plans/mine") return Promise.resolve({ data: { plans } });
    return Promise.reject(new Error(`Unexpected GET ${url}`));
  });
  api.post.mockResolvedValue({ data: { plan } });
  api.patch.mockImplementation((url) => {
    if (url.includes("/tasks/")) return Promise.resolve({ data: { plan: { ...plan, tasks: [{ ...plan.tasks[0], status: "completed" }, plan.tasks[1]] } } });
    return Promise.resolve({ data: { plan: { ...plan, status: "archived" } } });
  });
};
const renderPage = () => render(<MemoryRouter><Farming /></MemoryRouter>);

describe("Farming official pathways", () => {
  beforeEach(() => { vi.clearAllMocks(); configureApi(); });

  it("replaces application forms with an official handoff and safe checklist", async () => {
    useAuth.mockReturnValue({ user: null });
    renderPage();
    expect(await screen.findByRole("heading", { name: pathway.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open official department/i })).toHaveAttribute("href", pathway.officialUrl);
    expect(screen.getByText(/recognised laboratory.*own the result/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/farmer id/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/aadhaar/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/bank account/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/submit request/i)).not.toBeInTheDocument();
  });

  it("saves only minimal planning context for a signed-in farmer", async () => {
    useAuth.mockReturnValue({ user: { name: "Anjali" } });
    renderPage();
    await screen.findByRole("heading", { name: pathway.title });
    fireEvent.change(screen.getByLabelText(/crop label/i), { target: { value: "Paddy" } });
    fireEvent.change(screen.getByLabelText(/district label/i), { target: { value: "Kottayam" } });
    fireEvent.change(screen.getByLabelText(/^season$/i), { target: { value: "kharif" } });
    fireEvent.click(screen.getByRole("button", { name: /save farming action plan/i }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/farming/plans", {
      pathwayCode: pathway.pathwayCode,
      crop: "Paddy",
      district: "Kottayam",
      season: "kharif",
    }));
    expect(JSON.stringify(api.post.mock.calls[0][1])).not.toMatch(/aadhaar|bank|landRecord|farmerId/i);
    expect(await screen.findByRole('status')).toHaveTextContent('FRM-12AB34CD');
  });

  it("tracks task completion and confirms archival", async () => {
    useAuth.mockReturnValue({ user: { name: "Anjali" } });
    configureApi([plan]);
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: /my farming plans/i }));
    fireEvent.click(await screen.findByLabelText(/identify the plot and intended crop/i));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/farming/plans/FRM-12AB34CD/tasks/identify-plot-crop", { completed: true }));
    fireEvent.click(screen.getByRole("button", { name: /^archive$/i }));
    expect(screen.getByText(/archive this plan/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /yes, archive/i }));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/farming/plans/FRM-12AB34CD/archive"));
  });
});
