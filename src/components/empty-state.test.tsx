import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No data" description="Nothing to show here." />);

    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.getByText("Nothing to show here.")).toBeInTheDocument();
  });

  it("renders action button when actionLabel is provided", () => {
    render(
      <EmptyState
        title="No data"
        description="Nothing here."
        actionLabel="Retry"
      />,
    );

    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("does not render action button when actionLabel is omitted", () => {
    render(<EmptyState title="No data" description="Nothing here." />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onAction when button is clicked", async () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No data"
        description="Nothing here."
        actionLabel="Retry"
        onAction={handleAction}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(handleAction).toHaveBeenCalledOnce();
  });
});
