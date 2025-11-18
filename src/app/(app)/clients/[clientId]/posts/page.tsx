import { notFound } from "next/navigation";
import { getClientById } from "@/modules/clients/actions";
import { listPostsByClient } from "@/modules/posts/actions";
import { getCurrentWorkspace } from "@/lib/auth";
import { PostList } from "@/components/posts/PostList";
import { PostFilters } from "@/components/posts/PostFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function PostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ status?: string; platform?: string }>;
}) {
  const { clientId } = await params;
  const { status, platform } = await searchParams;
  const workspace = await getCurrentWorkspace();
  const client = await getClientById(clientId, workspace.id);

  if (!client) {
    notFound();
  }

  const filters = {
    status: status ? [status] : undefined,
    platform: platform ? [platform] : undefined,
  };

  const postsList = await listPostsByClient(clientId, workspace.id, filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">{client.name}</p>
        </div>
        <Link href={`/app/clients/${clientId}/posts/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau post
          </Button>
        </Link>
      </div>

      <PostList clientId={clientId} posts={postsList} />
    </div>
  );
}

