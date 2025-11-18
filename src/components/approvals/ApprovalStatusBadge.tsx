import { Badge } from "@/components/ui/badge";
import { type ApprovalRequestStatus } from "@/contracts/approvals";

const statusLabels: Record<ApprovalRequestStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  partially_approved: "Partiellement approuvé",
  approved: "Approuvé",
  closed: "Fermé",
};

const statusVariants: Record<
  ApprovalRequestStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "outline",
  sent: "secondary",
  partially_approved: "secondary",
  approved: "default",
  closed: "destructive",
};

interface ApprovalStatusBadgeProps {
  status: ApprovalRequestStatus;
}

export function ApprovalStatusBadge({ status }: ApprovalStatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>
  );
}

