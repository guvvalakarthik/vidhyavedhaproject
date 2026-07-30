import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

test("requires explicit approval before applying an agent action", async () => {
  const conversation = {
    conversationId: "507f1f77bcf86cd799439011",
    title: "Update my plan",
    service: "education",
    language: "English",
  };
  const pendingAction = {
    actionId: "ACT-12345678",
    planType: "education",
    planId: "EDU-12345678",
    taskId: "collect-documents",
    summary: 'Mark "Collect documents" as completed in Scholarship preparation.',
    status: "pending",
  };
  api.get.mockImplementation((url) => {
    if (url === "/ai/conversations") return Promise.resolve({ data: { conversations: [conversation] } });
    return Promise.resolve({ data: { conversation, messages: [], actions: [pendingAction] } });
  });
  api.post.mockResolvedValue({
    data: { action: { ...pendingAction, status: "confirmed", result: "Collect documents is now completed." } },
  });

  render(<Assistant />);
  expect(await screen.findByText(/mark "collect documents" as completed/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /approve exact change/i }));

  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/ai/actions/ACT-12345678/confirm", {}));
  expect(await screen.findByText(/is now completed/i)).toBeInTheDocument();
});

test("maps speech input and answer playback to the selected language", async () => {
  let recognition;
  class MockSpeechRecognition {
    constructor() {
      recognition = this;
      this.start = vi.fn();
      this.stop = vi.fn();
      this.abort = vi.fn();
    }
  }
  const speak = vi.fn();
  const cancel = vi.fn();
  class MockUtterance {
    constructor(text) {
      this.text = text;
    }
  }
  Object.defineProperty(window, "SpeechRecognition", { value: MockSpeechRecognition, configurable: true });
  Object.defineProperty(window, "SpeechSynthesisUtterance", { value: MockUtterance, configurable: true });
  Object.defineProperty(window, "speechSynthesis", { value: { speak, cancel }, configurable: true });

  render(<Assistant />);
  await waitFor(() => expect(api.get).toHaveBeenCalledWith("/ai/conversations"));
  fireEvent.change(screen.getByLabelText(/answer language/i), { target: { value: "Telugu" } });
  fireEvent.click(screen.getByRole("button", { name: /speak question/i }));

  expect(recognition.lang).toBe("te-IN");
  expect(recognition.start).toHaveBeenCalledOnce();
  act(() => recognition.onresult({ results: [[{ transcript: "passport renewal" }]] }));
  expect(screen.getByLabelText(/your question/i)).toHaveValue("passport renewal");

  fireEvent.click(screen.getByRole("button", { name: /listen to answer/i }));
  expect(cancel).toHaveBeenCalled();
  expect(speak).toHaveBeenCalledOnce();
  expect(speak.mock.calls[0][0].lang).toBe("te-IN");

  delete window.SpeechRecognition;
  delete window.SpeechSynthesisUtterance;
  delete window.speechSynthesis;
});
