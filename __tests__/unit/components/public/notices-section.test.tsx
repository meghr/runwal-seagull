import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@tests/helpers/test-utils";
import { NoticesSection } from "@/components/public/notices-section";

// Mock child components to simplify testing
vi.mock("@/components/public/notice-card", () => ({
    NoticeCard: ({ notice, onClick }: any) => (
        <div data-testid="notice-card" onClick={() => onClick(notice.id)}>
            {notice.title}
        </div>
    ),
}));

vi.mock("@/components/public/notice-modal", () => ({
    NoticeModal: ({ notice, onClose }: any) => (
        notice ? (
            <div data-testid="notice-modal">
                <h1>{notice.title}</h1>
                <button onClick={onClose}>Close</button>
            </div>
        ) : null
    ),
}));

// Mock Link
vi.mock("next/link", () => ({
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("NoticesSection", () => {
    const mockNotices = [
        { id: "1", title: "Notice 1", content: "Content 1" },
        { id: "2", title: "Notice 2", content: "Content 2" },
        { id: "3", title: "Notice 3", content: "Content 3" },
    ];

    it("should render empty state when no notices", () => {
        render(<NoticesSection notices={[]} />);
        expect(screen.getByText(/No notices at the moment/i)).toBeInTheDocument();
    });

    it("should render list of notice cards", () => {
        render(<NoticesSection notices={mockNotices} />);

        const cards = screen.getAllByTestId("notice-card");
        expect(cards).toHaveLength(3);
        expect(cards[0]).toHaveTextContent("Notice 1");
    });

    it("should open modal when clicking a card", () => {
        render(<NoticesSection notices={mockNotices} />);

        const card = screen.getByText("Notice 1");
        fireEvent.click(card);

        expect(screen.getByTestId("notice-modal")).toBeInTheDocument();
        expect(screen.getByTestId("notice-modal")).toHaveTextContent("Notice 1");
    });

    it("should close modal when clicked", () => {
        render(<NoticesSection notices={mockNotices} />);

        fireEvent.click(screen.getByText("Notice 1"));
        fireEvent.click(screen.getByText("Close"));

        expect(screen.queryByTestId("notice-modal")).not.toBeInTheDocument();
    });

    it("should limit display to 6 notices", () => {
        const manyNotices = Array.from({ length: 10 }, (_, i) => ({
            id: String(i),
            title: `Notice ${i}`,
        }));

        render(<NoticesSection notices={manyNotices} />);

        const cards = screen.getAllByTestId("notice-card");
        expect(cards).toHaveLength(6);

        // Should show "View All" link
        expect(screen.getByText("View All Notices")).toBeInTheDocument();
    });
});
