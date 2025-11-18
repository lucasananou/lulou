import { notFound } from "next/navigation";
import { getApprovalRequestByToken, updateApprovalItemStatus } from "@/modules/approvals/actions";
import { ApprovalPublicView } from "@/components/approvals/ApprovalPublicView";

export default async function ApprovalPublicPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const request = await getApprovalRequestByToken(token);

  if (!request) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <ApprovalPublicView
          request={request}
          onUpdateItem={updateApprovalItemStatus}
        />
      </div>
    </div>
  );
}

