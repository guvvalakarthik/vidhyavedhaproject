import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

test("renders the public landing page", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /empowering rural india/i,
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /get started free/i }),
  ).toHaveAttribute("href", "/register");
});
