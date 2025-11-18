import { Badge } from "@/components/ui/badge";
import { type PostStatus } from "@/contracts/posts";

const statusLabels: Record<PostStatus, string> = {
  draft: "Brouillon",
  to_approve: "À valider",
  approved: "Validé",
  scheduled: "Programmé",
  published: "Publié",
  cancelled: "Annulé",
};

const statusVariants: Record<
  PostStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "outline",
  to_approve: "secondary",
  approved: "default",
  scheduled: "default",
  published: "default",
  cancelled: "destructive",
};

interface PostStatusBadgeProps {
  status: PostStatus;
}

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>
  );
}

