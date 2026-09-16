import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WorkflowPage from "../page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock("@/lib/services/workflow", () => ({
  listWorkflows: vi.fn().mockResolvedValue([
    {
      id: "workflow-123",
      name: "Test Workflow",
      description: "Test workflow",
      status: "draft",
      cluster_id: "cluster-1",
      nodes: [],
      run_count: 0,
      success_count: 0,
      failure_count: 0,
      updated_at: "2026-01-01T00:00:00Z",
    },
  ]),
  cloneWorkflow: vi.fn(),
  updateWorkflowStatus: vi.fn(),
}));

vi.mock("@/lib/services/cluster", () => ({
  clusterService: {
    listClusters: vi.fn().mockResolvedValue({
      clusters: [{ id: "cluster-1" }],
    }),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn(),
  },
}));

describe("WorkflowPage", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("navigates to the workflow detail page when Run is clicked", async () => {
    render(<WorkflowPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Workflow")).toBeTruthy();
    });

    const workflowName = screen.getByText("Test Workflow");

    const workflowCard = workflowName.closest(
      "[data-slot='card']"
    ) as HTMLElement | null;

    expect(workflowCard).toBeTruthy();

    const actionsButton = within(workflowCard!).getByRole("button");

    fireEvent.pointerDown(actionsButton);

    const runItem = await screen.findByRole("menuitem", {
      name: "Run",
    });

    fireEvent.click(runItem);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/dashboard/workflow/workflow-123");
  });
});
