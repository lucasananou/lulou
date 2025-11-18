import { notFound } from "next/navigation";
import { getClientById } from "@/modules/clients/actions";
import { listApprovalRequestsByClient } from "@/modules/approvals/actions";
import { getCurrentWorkspace } from "@/lib/auth";
import { ApprovalRequestList } from "@/components/approvals/ApprovalRequestList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ApprovalsPage({
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

  const requests = await listApprovalRequestsByClient(clientId, workspace.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demandes d'approbation</h1>
          <p className="text-muted-foreground">{client.name}</p>
        </div>
        <Link href={`/app/clients/${clientId}/approvals/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle demande
          </Button>
        </Link>
      </div>

      <ApprovalRequestList clientId={clientId} requests={requests} />
    </div>
  );
}

