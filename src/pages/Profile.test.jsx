import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import Profile from "./Profile.jsx";

vi.mock("../context/AuthContext.jsx", () => ({ useAuth: vi.fn() }));
vi.mock("../services/api.js", () => ({ default: { get: vi.fn() } }));

const updateProfile = vi.fn();
const user = {
  id: "user-1",
  name: "Asha Rao",
  email: "asha@example.com",
  role: "citizen",
  createdAt: "2026-01-02T00:00:00.000Z",
};

describe("profile page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateProfile.mockResolvedValue({ user });
    useAuth.mockReturnValue({ user, updateProfile });
    api.get.mockResolvedValue({
      data: [{
        applicationId: "GOV-12345678",
        category: "government",
        serviceType: "Certificate guidance",
        status: "approved",
        createdAt: "2026-06-01T00:00:00.000Z",
      }],
    });
  });

  it("updates profile details and shows owner application history", async () => {
    render(<MemoryRouter><Profile /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Asha Devi" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith({ name: "Asha Devi" }));

    fireEvent.click(screen.getByRole("tab", { name: /application history/i }));
    expect(await screen.findByText("GOV-12345678")).toBeInTheDocument();
    expect(screen.getByText("Certificate guidance")).toBeInTheDocument();
  });

  it("requires matching eight-character passwords before calling the API", async () => {
    render(<MemoryRouter><Profile /></MemoryRouter>);
    fireEvent.click(screen.getByRole("tab", { name: /^password$/i }));
    fireEvent.change(screen.getByLabelText(/^current password$/i), { target: { value: "current-password" } });
    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: "new-password-123" } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: "different-password" } });
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/do not match/i);
    expect(updateProfile).not.toHaveBeenCalled();
  });
});
