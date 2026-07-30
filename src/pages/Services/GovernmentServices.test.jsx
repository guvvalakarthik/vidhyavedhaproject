import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GovernmentServices from "./GovernmentServices.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

vi.mock("../../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));
vi.mock("../../context/AuthContext.jsx", () => ({ useAuth: vi.fn() }));

const passportService = {
  serviceCode: "passport",
  name: "Passport services",
  category: "Identity",
  authority: "Ministry of External Affairs — Passport Seva",
  summary: "Prepare for a fresh passport, reissue, document check and appointment.",
  officialUrl: "https://www.passportindia.gov.in/psp/",
  officialAction: "Open Passport Seva",
  access: ["Online application", "Passport Seva Kendra appointment"],
  timeNote: "Times vary.",
  feeNote: "Use the official fee calculator.",
  requirements: ["Proof of date of birth", "Current address and identity evidence"],
  steps: [
    { title: "Check the document advisor", description: "Confirm evidence." },
    { title: "Apply on Passport Seva", description: "Use the official application." },
  ],
};

const supportRequest = {
  requestId: "GOV-12345678",
  serviceCode: "passport",
  serviceName: "Passport services",
  supportMode: "digital-guidance",
  district: "Hyderabad",
  preferredLanguage: "Telugu",
  status: "pending",
  submittedAt: "2026-07-28T10:00:00.000Z",
};

const configureApi = (requests = []) => {
  api.get.mockImplementation((url) => {
    if (url === "/government/services") return Promise.resolve({ data: { services: [passportService] } });
    if (url === "/government/requests/mine") return Promise.resolve({ data: { requests } });
    return Promise.reject(new Error(`Unexpected GET ${url}`));
  });
  api.post.mockResolvedValue({ data: { request: supportRequest } });
  api.delete.mockResolvedValue({ data: { message: "Support request cancelled." } });
};

const renderPage = () => render(<MemoryRouter><GovernmentServices /></MemoryRouter>);

const openPassport = async () => {
  fireEvent.click(await screen.findByRole("button", { name: /passport services/i }));
};

const completeSupportQuestions = async () => {
  fireEvent.click(screen.getByRole("button", { name: /get assisted support/i }));
  fireEvent.click(screen.getByLabelText(/digital service guidance/i));
  fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));
  fireEvent.change(screen.getByLabelText(/district or city/i), { target: { value: "Hyderabad" } });
  fireEvent.change(screen.getByLabelText(/preferred language/i), { target: { value: "Telugu" } });
  fireEvent.change(screen.getByLabelText(/contact number/i), { target: { value: "9876543210" } });
  fireEvent.change(screen.getByLabelText(/what do you need help understanding/i), { target: { value: "Need help with document guidance" } });
  fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));
};

describe("Government service journeys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureApi();
  });

  it("routes visitors to the official authority without collecting identity numbers", async () => {
    useAuth.mockReturnValue({ user: null });
    renderPage();
    await openPassport();

    expect(screen.getAllByRole("link", { name: /open passport seva/i })[0]).toHaveAttribute("href", passportService.officialUrl);
    expect(screen.queryByLabelText(/passport number/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/aadhaar number/i)).not.toBeInTheDocument();

    await completeSupportQuestions();
    expect(screen.getByRole("heading", { name: /check your support request/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in to continue/i })).toHaveAttribute("href", "/login");
    expect(api.post).not.toHaveBeenCalled();
  });

  it("submits the reviewed minimum-data guidance request for a signed-in citizen", async () => {
    useAuth.mockReturnValue({ user: { name: "Anjali", role: "citizen" } });
    renderPage();
    await openPassport();
    await completeSupportQuestions();

    fireEvent.click(screen.getByLabelText(/i understand this is a guidance request/i));
    fireEvent.click(screen.getByRole("button", { name: /send support request/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/government/requests", {
      serviceCode: "passport",
      supportMode: "digital-guidance",
      district: "Hyderabad",
      preferredLanguage: "Telugu",
      phone: "9876543210",
      notes: "Need help with document guidance",
      consent: true,
    }));
    expect(await screen.findByText(/GOV-12345678/)).toBeInTheDocument();
  });

  it("requires explicit confirmation before cancelling a support request", async () => {
    useAuth.mockReturnValue({ user: { name: "Anjali", role: "citizen" } });
    configureApi([supportRequest]);
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: /my support requests/i }));

    fireEvent.click(await screen.findByRole("button", { name: /cancel request/i }));
    expect(screen.getByText(/cancel this guidance request/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /yes, cancel/i }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/government/requests/GOV-12345678"));
  });
});