import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Header } from "./header";

// Mock next/link since we're outside of Next.js runtime
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("Header", () => {
  it("renders the app name with a link to home", () => {
    render(<Header />);

    const link = screen.getByRole("link", { name: "Solana Portfolio" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders a disabled wallet button", () => {
    render(<Header />);

    const button = screen.getByRole("button", { name: /connect wallet/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
