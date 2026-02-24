import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/tests/utils/test-utils";
import StatusBadge from "@/components/ui/StatusBadge";

jest.mock("@/lib/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: "de",
    setLanguage: jest.fn(),
  }),
}));

describe("StatusBadge", () => {
  it("renders status label from translation key", () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText("status.draft")).toBeInTheDocument();
  });

  it("renders different statuses correctly", () => {
    const { rerender } = render(<StatusBadge status="approved" />);
    expect(screen.getByText("status.approved")).toBeInTheDocument();

    rerender(<StatusBadge status="rejected" />);
    expect(screen.getByText("status.rejected")).toBeInTheDocument();
  });

  it("when editable, clicking opens dropdown with status options", async () => {
    render(<StatusBadge status="draft" editable />);
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("status.transferred")).toBeInTheDocument();
    expect(screen.getByText("status.completed")).toBeInTheDocument();
  });

  it("when not editable, button is disabled", () => {
    render(<StatusBadge status="draft" editable={false} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("calls onStatusChange when selecting a new status", async () => {
    const onStatusChange = jest.fn();
    render(
      <StatusBadge status="draft" editable onStatusChange={onStatusChange} />
    );

    await userEvent.click(screen.getByRole("button"));
    const transferredOption = screen.getByText("status.transferred");
    await userEvent.click(transferredOption);

    expect(onStatusChange).toHaveBeenCalledWith("transferred");
  });
});
