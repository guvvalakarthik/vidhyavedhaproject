import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../context/AuthContext.jsx";
import Login from "./Login.jsx";

vi.mock("../context/AuthContext.jsx", () => ({ useAuth: vi.fn() }));
vi.mock("../components/GoogleSignInButton.jsx", () => ({
  default: ({ onCredential, busy }) => (
    <button type="button" disabled={busy} onClick={() => onCredential("google-id-token")}>
      Continue with Google
    </button>
  ),
}));

const passwordLogin = vi.fn();
const googleLogin = vi.fn();

const renderLogin = (entry = "/login") => render(
  <MemoryRouter initialEntries={[entry]}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<p>Resident dashboard</p>} />
      <Route path="/" element={<p>Home page</p>} />
    </Routes>
  </MemoryRouter>,
);

describe("redesigned login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    passwordLogin.mockResolvedValue({});
    googleLogin.mockResolvedValue({});
    useAuth.mockReturnValue({
      login: passwordLogin,
      loginWithGoogle: googleLogin,
    });
  });

  it("offers Google and accessible password sign-in options", () => {
    renderLogin();

    expect(screen.getByText("Sign in to your account").tagName).toBe("H2");
    expect(screen.getByText("Continue with Google").closest("button")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password");

    fireEvent.click(screen.getByLabelText("Show password"));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
  });

  it("uses the existing secure password session and returns to the requested page", async () => {
    renderLogin({
      pathname: "/login",
      state: { from: { pathname: "/dashboard", search: "" } },
    });

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "resident@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Sign in securely").closest("button"));

    await waitFor(() => expect(passwordLogin).toHaveBeenCalledWith(
      "resident@example.com",
      "password123",
    ));
    expect(await screen.findByText("Resident dashboard")).toBeInTheDocument();
  });

  it("exchanges the Google credential through the auth context", async () => {
    renderLogin();

    fireEvent.click(screen.getByText("Continue with Google").closest("button"));

    await waitFor(() => expect(googleLogin).toHaveBeenCalledWith("google-id-token"));
    expect(await screen.findByText("Home page")).toBeInTheDocument();
  });
});
