import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api from "../services/api.js";
import GoogleSignInButton from "./GoogleSignInButton.jsx";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn() },
}));

describe("Google sign-in button", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete window.google;
  });

  afterEach(() => {
    delete window.google;
  });

  it("keeps password sign-in available when the administrator has not configured Google", async () => {
    api.get.mockResolvedValue({ data: { enabled: false } });

    render(<GoogleSignInButton onCredential={vi.fn()} onSetupError={vi.fn()} />);

    expect(await screen.findByText(/needs administrator setup/i)).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/auth/google/config");
  });

  it("initializes the official button with the server-issued nonce", async () => {
    const initialize = vi.fn();
    const renderButton = vi.fn();
    window.google = { accounts: { id: { initialize, renderButton } } };
    api.get.mockResolvedValue({
      data: {
        enabled: true,
        clientId: "web-client.apps.googleusercontent.com",
        nonce: "nonce-123",
      },
    });
    const onCredential = vi.fn().mockResolvedValue(undefined);

    render(<GoogleSignInButton onCredential={onCredential} onSetupError={vi.fn()} />);

    await waitFor(() => expect(renderButton).toHaveBeenCalledOnce());
    expect(initialize).toHaveBeenCalledWith(expect.objectContaining({
      client_id: "web-client.apps.googleusercontent.com",
      nonce: "nonce-123",
      ux_mode: "popup",
      auto_select: false,
    }));

    const callback = initialize.mock.calls[0][0].callback;
    await act(async () => {
      await callback({ credential: "signed-google-id-token" });
    });
    expect(onCredential).toHaveBeenCalledWith("signed-google-id-token");
  });
});
