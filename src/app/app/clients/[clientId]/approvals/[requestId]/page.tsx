import { notFound } from "next/navigation";
import { getClientById } from "@/modules/clients/actions";
import { getApprovalRequestById, sendApprovalRequest, closeApprovalRequest } from "@/modules/approvals/actions";
import { getCurrentWorkspace } from "@/lib/auth";
import { ApprovalRequestDetail } from "@/components/approvals/ApprovalRequestDetail";

export default async function ApprovalRequestDetailPage({
  params,
}: {
  params: Promise<{ clientId: string; requestId: string }>;
}) {
  const { clientId, requestId } = await params;
  const workspace = await getCurrentWorkspace();
  const client = await getClientById(clientId, workspace.id);

  if (!client) {
    notFound();
  }

  const request = await getApprovalRequestById(requestId, workspace.id);

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{request.title}</h1>
        <p className="text-muted-foreground">{client.name}</p>
      </div>

      <ApprovalRequestDetail
        request={request}
        clientId={clientId}
        onSend={sendApprovalRequest}
        onClose={async (id) => {
          await closeApprovalRequest(id);
        }}
      />
    </div>
  );
}

