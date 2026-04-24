import { Badge, type BadgeProps } from "@ba33/ui-web";
import { formatEnumLabel } from "@/lib/format";

function getVariant(value: string | null | undefined): BadgeProps["variant"] {
  switch (value) {
    case "active":
    case "delivered":
    case "issued":
    case "paid":
    case "produced":
    case "certified":
    case "clear":
    case "resolved":
      return "success";
    case "pending":
    case "assigned":
    case "accepted":
    case "in_progress":
    case "warning":
    case "quote":
    case "preparing":
    case "flagged":
    case "partial":
      return "warning";
    case "urgent":
    case "critical":
    case "cancelled":
    case "rejected":
    case "revoked":
    case "deleted":
    case "suspended":
      return "destructive";
    case "info":
      return "info";
    default:
      return "secondary";
  }
}

interface StatusBadgeProps {
  value: string | null | undefined;
}

export function StatusBadge({ value }: StatusBadgeProps) {
  return <Badge variant={getVariant(value)}>{formatEnumLabel(value)}</Badge>;
}
