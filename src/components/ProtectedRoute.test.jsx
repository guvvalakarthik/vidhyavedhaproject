import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { useAuth } from "../context/AuthContext.jsx";

vi.mock("../context/AuthContext.jsx", () => ({ useAuth: vi.fn() }));

const renderRoutes = (roles) => render(
  <MemoryRouter initialEntries={["/private"]}>
    <Routes>
      <Route path="/login" element={<div>Login screen</div>} />
      <Route path="/" element={<div>Public home</div>} />
      <Route
        path="/private"
        element={<ProtectedRoute roles={roles}><div>Private content</div></ProtectedRoute>}
      />
    </Routes>
  </MemoryRouter>,
);

describe("ProtectedRoute", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends signed-out visitors to login", () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    renderRoutes();
    expect(screen.getByText("Login screen")).toBeInTheDocument();
  });

  it("prevents citizens from opening administrator pages", () => {
    useAuth.mockReturnValue({ user: { role: "citizen" }, loading: false });
    renderRoutes(["admin"]);
    expect(screen.getByText("Public home")).toBeInTheDocument();
  });

  it("renders an allowed administrator route", () => {
    useAuth.mockReturnValue({ user: { role: "admin" }, loading: false });
    renderRoutes(["admin"]);
    expect(screen.getByText("Private content")).toBeInTheDocument();
  });
});