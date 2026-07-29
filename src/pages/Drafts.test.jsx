import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Drafts from "./Drafts.jsx";
import api from "../services/api.js";

vi.mock("../services/api.js", () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }));
const template = { serviceCode: "utilities", serviceTitle: "Utility issue resolution", recipient: "Utility office", types: [{ draftType: "complaint", label: "Complaint", purpose: "Record a problem." }] };
const draft = { draftId: "DRF-12AB34CD", serviceCode: "utilities", serviceTitle: template.serviceTitle, draftType: "complaint", subject: "Repeated billing issue", content: { subject: "Repeated billing issue", salutation: "To Utility office,", paragraphs: ["I am writing to report the issue.", "Details supplied by me."], closing: "Sincerely," }, revision: 1, status: "draft", mode: "reviewed-template" };

describe("service draft workspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => url === "/drafts/templates" ? Promise.resolve({ data: { templates: [template] } }) : Promise.resolve({ data: { drafts: [] } }));
    api.post.mockResolvedValue({ data: { message: "Draft created. It has not been submitted.", draft } });
    api.patch.mockResolvedValue({ data: { message: "Draft locked for download. This does not submit it.", draft: { ...draft, status: "finalized" } } });
  });

  it("requires a privacy acknowledgement and previews a generated draft", async () => {
    render(<MemoryRouter><Drafts /></MemoryRouter>);
    await screen.findByText(template.serviceTitle);
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: draft.subject } });
    fireEvent.change(screen.getByLabelText(/facts in your own words/i), { target: { value: "My last two bills contain the same meter reading." } });
    fireEvent.change(screen.getByLabelText(/requested outcome/i), { target: { value: "Please inspect the meter and correct any confirmed error." } });
    fireEvent.click(screen.getByLabelText(/I will not enter passwords/i));
    fireEvent.click(screen.getByText("Generate preview"));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/drafts", expect.objectContaining({ privacyAcknowledged: true, subject: draft.subject })));
    expect(await screen.findByText("DRAFT — NOT SUBMITTED")).toBeInTheDocument();
    expect(screen.getByText("Details supplied by me.")).toBeInTheDocument();
  });

  it("labels reviewed-template mode and finalizes only after preview", async () => {
    api.get.mockImplementation((url) => url === "/drafts/templates" ? Promise.resolve({ data: { templates: [template] } }) : Promise.resolve({ data: { drafts: [draft] } }));
    render(<MemoryRouter><Drafts /></MemoryRouter>);
    expect(await screen.findByText(/reviewed-template mode/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Lock reviewed draft"));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/drafts/DRF-12AB34CD/finalize"));
    expect(await screen.findByText(/does not submit it/i)).toBeInTheDocument();
  });
});
