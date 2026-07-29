import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import Assistant from "./Assistant.jsx";
import api from "../services/api.js";

vi.mock("../services/api.js", () => ({
  default: { post: vi.fn() },
}));

beforeEach(() => vi.clearAllMocks());

test("shows grounded answers and their official sources", async () => {
  api.post.mockResolvedValue({ data: {
    answer: "Use the official Passport Seva route.",
    mode: "grounded-fallback",
    citations: [{
      sourceId: "government:passport",
      title: "Passport services",
      authority: "Passport Seva",
      officialUrl: "https://www.passportindia.gov.in/psp/",
    }],
  } });

  render(<Assistant />);
  fireEvent.change(screen.getByLabelText(/your question/i), { target: { value: "How do I renew my passport?" } });
  fireEvent.click(screen.getByRole("button", { name: /ask vidhya/i }));

  await waitFor(() => expect(screen.getByText(/official passport seva route/i)).toBeInTheDocument());
  expect(screen.getByRole("link", { name: /passport services/i })).toHaveAttribute(
    "href",
    "https://www.passportindia.gov.in/psp/",
  );
  expect(api.post).toHaveBeenCalledWith("/ai/ask", expect.objectContaining({ service: "all", language: "English" }));
});
