import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Healthcare from "./Healthcare.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

vi.mock("../../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));
vi.mock("../../context/AuthContext.jsx", () => ({ useAuth: vi.fn() }));

const provider = {
  providerCode: "DR-ANANYA-RAO",
  name: "Dr Ananya Rao",
  specialty: "General medicine",
  qualifications: "MBBS, MD",
  experienceYears: 12,
  languages: ["English", "Telugu"],
  modes: ["in-person", "video"],
  location: { name: "Community Health Centre", city: "Hyderabad", address: "Main Road" },
  consultationMinutes: 30,
};
const slot = {
  date: "2030-01-02",
  start: "2030-01-02T04:30:00.000Z",
  end: "2030-01-02T05:00:00.000Z",
  status: "free",
};
const appointment = {
  confirmationCode: "APT-12AB34CD",
  providerCode: provider.providerCode,
  providerName: provider.name,
  specialty: provider.specialty,
  location: provider.location,
  mode: "in-person",
  startTime: slot.start,
  endTime: slot.end,
  status: "booked",
};

const configureApi = (appointments = []) => {
  api.get.mockImplementation((url) => {
    if (url === "/healthcare/providers") return Promise.resolve({ data: { providers: [provider] } });
    if (url === "/healthcare/appointments/mine") return Promise.resolve({ data: { appointments } });
    if (url.includes("/availability")) return Promise.resolve({ data: { slots: [slot] } });
    return Promise.reject(new Error(`Unexpected GET ${url}`));
  });
};

const renderPage = () => render(<MemoryRouter><Healthcare /></MemoryRouter>);

const chooseDoctorAndSlot = async () => {
  fireEvent.click(await screen.findByRole("button", { name: /dr ananya rao/i }));
  fireEvent.click(await screen.findByRole("button", { name: /10:00/i }));
};

describe("Healthcare scheduling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureApi();
    api.post.mockResolvedValue({ data: { appointment } });
    api.patch.mockResolvedValue({ data: { appointment } });
  });

  it("lets visitors choose a live slot before asking them to sign in", async () => {
    useAuth.mockReturnValue({ user: null });
    renderPage();
    await chooseDoctorAndSlot();

    expect(screen.getByRole("heading", { name: /review and confirm/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in to continue/i })).toHaveAttribute("href", "/login");
    expect(api.post).not.toHaveBeenCalled();
  });

  it("books the selected slot with only the necessary patient details", async () => {
    useAuth.mockReturnValue({ user: { name: "Anjali", role: "citizen" } });
    renderPage();
    await chooseDoctorAndSlot();

    fireEvent.change(screen.getByLabelText(/contact number/i), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText(/reason for appointment/i), { target: { value: "Persistent fever" } });
    fireEvent.click(screen.getByRole("button", { name: /^confirm appointment$/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/healthcare/appointments", {
      providerCode: provider.providerCode,
      startTime: slot.start,
      mode: "in-person",
      phone: "9876543210",
      reason: "Persistent fever",
    }));
    expect(await screen.findByText(/appointment confirmed/i)).toBeInTheDocument();
  });

  it("explains when online changes have closed for a near-term appointment", async () => {
    useAuth.mockReturnValue({ user: { name: "Anjali", role: "citizen" } });
    configureApi([{ ...appointment, startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() }]);
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: /manage appointments/i }));

    expect(await screen.findByText(/online changes close 2 hours/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^cancel$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /change time/i })).not.toBeInTheDocument();
  });

  it("requires explicit confirmation before cancelling an upcoming booking", async () => {
    useAuth.mockReturnValue({ user: { name: "Anjali", role: "citizen" } });
    configureApi([appointment]);
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: /manage appointments/i }));

    fireEvent.click(await screen.findByRole("button", { name: /^cancel$/i }));
    expect(screen.getByText(/cancel this appointment/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /yes, cancel/i }));

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith(`/healthcare/appointments/${appointment.confirmationCode}/cancel`));
  });
});