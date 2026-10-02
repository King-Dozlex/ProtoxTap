import type { CardStatus } from "../services/api";

const labels: Record<CardStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  unassigned: "Unassigned",
};

export default function StatusBadge({ status }: { status: CardStatus }) {
  return <span className={`status-badge status-${status}`}>{labels[status]}</span>;
}
