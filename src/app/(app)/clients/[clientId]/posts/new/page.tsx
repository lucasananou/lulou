import { notFound } from "next/navigation";
import { getClientById } from "@/modules/clients/actions";
import { getCurrentWorkspace } from "@/lib/auth";
import { PostForm } from "@/components/posts/PostForm";
import { createPost } from "@/modules/posts/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewPostPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const workspace = await getCurrentWorkspace();
  const client = await getClientById(clientId, workspace.id);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouveau post</h1>
        <p className="text-muted-foreground">{client.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Créer un post</CardTitle>
          <CardDescription>
            Rédigez un nouveau post pour ce client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostForm
            clientId={clientId}
            onSubmit={async (data) => {
              await createPost(data);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

