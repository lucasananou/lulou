import { notFound } from "next/navigation";
import { getClientById } from "@/modules/clients/actions";
import { getPostById, updatePost, updatePostStatus, deletePost } from "@/modules/posts/actions";
import { getApprovalRequestById } from "@/modules/approvals/actions";
import { getCurrentWorkspace } from "@/lib/auth";
import { PostFormWrapper } from "@/components/posts/PostFormWrapper";
import { PostStatusBadge } from "@/components/posts/PostStatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PostActions } from "@/components/posts/PostActions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { FileCheck } from "lucide-react";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  to_approve: "À valider",
  approved: "Validé",
  scheduled: "Programmé",
  published: "Publié",
  cancelled: "Annulé",
};

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ clientId: string; postId: string }>;
}) {
  const { clientId, postId } = await params;
  const workspace = await getCurrentWorkspace();
  const client = await getClientById(clientId, workspace.id);

  if (!client) {
    notFound();
  }

  const post = await getPostById(postId, workspace.id);

  if (!post) {
    notFound();
  }

  // Récupérer la demande d'approbation si le post y est lié
  let approvalRequest = null;
  if (post.approvalRequestId) {
    approvalRequest = await getApprovalRequestById(
      post.approvalRequestId,
      workspace.id
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="text-muted-foreground">{client.name}</p>
        </div>
        <PostStatusBadge status={post.status as any} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contenu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Plateforme
              </p>
              <p className="text-sm">{post.platform}</p>
            </div>
            {post.scheduledAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Date de publication
                </p>
                <p className="text-sm">
                  {format(new Date(post.scheduledAt), "dd MMMM yyyy à HH:mm", {
                    locale: fr,
                  })}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Contenu
              </p>
              <p className="text-sm whitespace-pre-wrap">{post.body}</p>
            </div>
            {post.tags && (post.tags as string[]).length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {(post.tags as string[]).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-secondary px-3 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvalRequest && (
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Dans une demande d'approbation
                  </span>
                </div>
                <Link
                  href={`/app/clients/${clientId}/approvals/${approvalRequest.id}`}
                >
                  <Button variant="outline" size="sm" className="w-full">
                    Voir la demande : {approvalRequest.title}
                  </Button>
                </Link>
              </div>
            )}
            <PostActions
              postId={postId}
              currentStatus={post.status}
              clientId={clientId}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modifier le post</CardTitle>
        </CardHeader>
        <CardContent>
          <PostFormWrapper
            clientId={clientId}
            postId={postId}
            defaultValues={post}
          />
        </CardContent>
      </Card>
    </div>
  );
}

