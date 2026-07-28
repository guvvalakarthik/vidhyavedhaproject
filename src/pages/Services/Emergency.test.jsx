import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Emergency from "./Emergency.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

vi.mock("../../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));
vi.mock("../../context/AuthContext.jsx", () => ({ useAuth: vi.fn() }));

const services = [
  { code: "towing", name: "Towing and recovery", summary: "Request recovery when your vehicle cannot be driven safely." },
  { code: "flat-tyre", name: "Flat tyre assistance", summary: "Get help fitting a spare." },
];
const requestRecord = {
  requestId: "EMR-12AB34CD",
  serviceCode: "towing",
  serviceName: "Towing and recovery",
  contactPhone: "9876543210",
  vehicleType: "car",
  vehicleDescription: "Blue hatchback",
  location: { description: "Northbound near Central Station" },
  safetyStatus: "safe",
  notes: "",
  priority: "standard",
  status: "requested",
  assignment: null,
  createdAt: "2030-01-02T05:00:00.000Z",
};

const configureApi = ({ mine = [], queue = [] } = {}) => {
  api.get.mockImplementation((url) => {
    if (url === "/emergency/services") return Promise.resolve({ data: { services } });
    if (url === "/emergency/requests/mine") return Promise.resolve({ data: { requests: mine } });
    if (url === "/emergency/dispatch/queue") return Promise.resolve({ data: { requests: queue } });
    return Promise.reject(new Error(`Unexpected GET ${url}`));
  });
};

const renderPage = () => render(<MemoryRouter><Emergency /></MemoryRouter>);

const reachReview = async () => {
  fireEvent.click(screen.getByRole("button", { name: /no — roadside assistance/i }));
  fireEvent.click(screen.getByRole("button", { name: /continue to assistance type/i }));
  fireEvent.click(await screen.findByRole("button", { name: /towing and recovery/i }));
  fireEvent.click(screen.getByRole("button", { name: /continue to location/i }));
  fireEvent.change(screen.getByLabelText(/exact location or landmark/i), { target: { value: "Northbound near Central Station" } });
  fireEvent.click(screen.getByRole("button", { name: /continue to details/i }));
};

describe("Emergency roadside dispatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureApi();
    api.post.mockResolvedValue({ data: { request: requestRecord } });
    api.patch.mockResolvedValue({ data: { request: requestRecord } });
  });

  it("diverts immediate danger away from the roadside workflow", () => {
    useAuth.mockReturnValue({ user: null });
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /yes — urgent danger/i }));

    expect(screen.getByText(/contact your local emergency service immediately/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /official emergency service information/i })).toHaveAttribute("href", "https://112.gov.in/");
    expect(screen.queryByRole("button", { name: /continue to assistance type/i })).not.toBeInTheDocument();
  });

  it("lets a visitor prepare a request before asking them to sign in", async () => {
    useAuth.mockReturnValue({ user: null });
    renderPage();
    await reachReview();

    expect(screen.getByRole("heading", { name: /review and send/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in to continue/i })).toHaveAttribute("href", "/login");
    expect(api.post).not.toHaveBeenCalled();
  });

  it("sends a minimal, structured request and shows its reference", async () => {
    useAuth.mockReturnValue({ user: { name: "Anjali", role: "citizen" } });
    renderPage();
    await reachReview();
    fireEvent.change(screen.getByLabelText(/contact number/i), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText(/vehicle description/i), { target: { value: "Blue hatchback" } });
    fireEvent.click(screen.getByRole("button", { name: /send to dispatch/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/emergency/requests", {
      serviceCode: "towing",
      contactPhone: "9876543210",
      vehicleType: "car",
      vehicleDescription: "Blue hatchback",
      location: { description: "Northbound near Central Station" },
      safetyStatus: "safe",
      notes: "",
    }));
    expect(await screen.findByText("EMR-12AB34CD")).toBeInTheDocument();
  });

  it("shows assignment and requires confirmation before citizen cancellation", async () => {
    useAuth.mockReturnValue({ user: { name: "Anjali", role: "citizen" } });
    const assigned = { ...requestRecord, status: "assigned", assignment: { unitName: "Recovery unit 4", unitPhone: "9876500000", etaMinutes: 25 } };
    configureApi({ mine: [assigned] });
    api.patch.mockResolvedValue({ data: { request: { ...assigned, status: "cancelled" } } });
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: /track requests/i }));

    expect(await screen.findByText(/recovery unit 4/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^cancel request$/i }));
    expect(screen.getByText(/cancel this roadside request/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /yes, cancel/i }));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/emergency/requests/EMR-12AB34CD/cancel"));
  });

  it("gives dispatchers an assignment queue and advances only the next status", async () => {
    useAuth.mockReturnValue({ user: { name: "Maya", role: "dispatcher" } });
    configureApi({ queue: [requestRecord] });
    api.patch.mockResolvedValue({ data: { request: { ...requestRecord, status: "assigned", assignment: { unitName: "Recovery unit 4", unitPhone: "9876500000", etaMinutes: 20 } } } });
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: /dispatch queue/i }));
    fireEvent.click(await screen.findByRole("button", { name: /assign response unit/i }));
    fireEvent.change(screen.getByLabelText(/response unit/i), { target: { value: "Recovery unit 4" } });
    fireEvent.change(screen.getByLabelText(/unit contact/i), { target: { value: "9876500000" } });
    fireEvent.change(screen.getByLabelText(/eta in minutes/i), { target: { value: "20" } });
    fireEvent.click(screen.getByRole("button", { name: /confirm assignment/i }));

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/emergency/dispatch/EMR-12AB34CD/assign", {
      unitName: "Recovery unit 4",
      unitPhone: "9876500000",
      etaMinutes: "20",
    }));
    expect(await screen.findByRole("button", { name: /mark on the way/i })).toBeInTheDocument();
  });
});