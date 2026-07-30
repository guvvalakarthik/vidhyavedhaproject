import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";

const renderHome = () => render(
  <MemoryRouter>
    <App />
  </MemoryRouter>,
);

test("renders a task-focused public landing page", () => {
  renderHome();

  expect(screen.getByRole("heading", {
    level: 1,
    name: /find and access essential services/i,
  })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /create an account/i })).toHaveAttribute("href", "/register");
  expect(within(screen.getByRole("banner")).getByRole("link", { name: /^sign in$/i })).toHaveAttribute("href", "/login");
  expect(screen.getByRole("link", { name: /skip to main content/i })).toHaveAttribute("href", "#main-content");
  expect(screen.getAllByText("Official-route guidance")).toHaveLength(6);
  expect(screen.getAllByText(/Demo (provider|dispatch) network/)).toHaveLength(3);
});

test("filters service topics using plain-language terms", () => {
  renderHome();
  fireEvent.change(screen.getByRole("searchbox", { name: /what do you need help with/i }), {
    target: { value: "crop insurance" },
  });

  const directory = screen.getByRole("region", { name: /^services$/i });
  expect(within(directory).getByText("Agriculture and farming")).toBeInTheDocument();
  expect(within(directory).queryByText("Health and care")).not.toBeInTheDocument();
  expect(screen.getByText(/1 result for/i)).toBeInTheDocument();
});