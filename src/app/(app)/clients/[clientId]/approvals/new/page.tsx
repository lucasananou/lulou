import { notFound } from "next/navigation";
import { getClientById } from "@/modules/clients/actions";
import { getCurrentWorkspace } from "@/lib/auth";
import { getAvailablePostsForApproval, createApprovalRequest } from "@/modules/approvals/actions";
import { ApprovalRequestForm } from "@/components/approvals/ApprovalRequestForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewApprovalRequestPage({
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

  const availablePosts = await getAvailablePostsForApproval(clientId, workspace.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouvelle demande d'approbation</h1>
        <p className="text-muted-foreground">{client.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Créer une demande d'approbation</CardTitle>
          <CardDescription>
            Sélectionnez les posts à envoyer au client pour validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApprovalRequestForm
            clientId={clientId}
            availablePosts={availablePosts}
            onSubmit={createApprovalRequest}
          />
        </CardContent>
      </Card>
    </div>
  );
}

