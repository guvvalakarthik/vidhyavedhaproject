import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import Assistant from "./Assistant.jsx";
import api from "../services/api.js";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockResolvedValue({ data: { conversations: [] } });
});

test("persists a new conversation and shows its official sources", async () => {
  const conversation = {
    conversationId: "507f1f77bcf86cd799439011",
    title: "How do I renew my passport?",
    service: "all",
    language: "English",
  };
  api.post
    .mockResolvedValueOnce({ data: { conversation, messages: [] } })
    .mockResolvedValueOnce({ data: {
      conversation,
      userMessage: { messageId: "u1", role: "user", content: "How do I renew my passport?", citations: [] },
      assistantMessage: {
        messageId: "a1",
        role: "assistant",
        content: "Use the official Passport Seva route.",
        mode: "grounded-fallback",
        citations: [{
          sourceId: "government:passport",
          title: "Passport services",
          authority: "Passport Seva",
          officialUrl: "https://www.passportindia.gov.in/psp/",
        }],
      },
    } });

  render(<Assistant />);
  await waitFor(() => expect(api.get).toHaveBeenCalledWith("/ai/conversations"));
  fireEvent.change(screen.getByLabelText(/your question/i), { target: { value: "How do I renew my passport?" } });
  fireEvent.click(screen.getByRole("button", { name: /ask vidhya/i }));

  await waitFor(() => expect(screen.getByText(/official passport seva route/i)).toBeInTheDocument());
  expect(screen.getByRole("link", { name: /passport services/i })).toHaveAttribute(
    "href",
    "https://www.passportindia.gov.in/psp/",
  );
  expect(api.post).toHaveBeenNthCalledWith(1, "/ai/conversations", { service: "all", language: "English" });
  expect(api.post).toHaveBeenNthCalledWith(
    2,
    "/ai/conversations/507f1f77bcf86cd799439011/messages",
    { message: "How do I renew my passport?" },
  );
});
