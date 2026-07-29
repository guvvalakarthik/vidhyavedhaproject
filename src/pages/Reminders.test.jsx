import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Reminders from "./Reminders.jsx";
import api from "../services/api.js";
vi.mock("../services/api.js", () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }));
const reminder = { reminderId: "RMD-12AB34CD", sourceType: "custom", sourceId: "", title: "Finish checklist", dueAt: "2026-08-01T09:00:00Z", nextRunAt: "2026-08-01T09:00:00Z", cadence: "weekly", status: "active" };
describe("reminder agent", () => {
  beforeEach(() => { vi.clearAllMocks(); api.get.mockResolvedValue({ data: { reminders: [] } }); api.post.mockResolvedValue({ data: { message: "Reminder agent enabled with in-app notifications only.", reminder } }); api.patch.mockResolvedValue({ data: { message: "Reminder paused.", reminder: { ...reminder, status: "paused" } } }); });
  it("requires opt-in and creates an in-app reminder", async () => {
    render(<Reminders />); await waitFor(() => expect(api.get).toHaveBeenCalled());
    fireEvent.change(screen.getByLabelText(/reminder title/i), { target: { value: reminder.title } });
    fireEvent.change(screen.getByLabelText(/first reminder/i), { target: { value: "2026-08-01T14:30" } });
    fireEvent.change(screen.getByLabelText(/repeat/i), { target: { value: "weekly" } });
    fireEvent.click(screen.getByLabelText(/enable this in-app/i));
    fireEvent.click(screen.getByText("Enable reminder"));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/reminders", expect.objectContaining({ consent: true, cadence: "weekly" })));
    expect(await screen.findByText(reminder.title)).toBeInTheDocument();
  });
});
