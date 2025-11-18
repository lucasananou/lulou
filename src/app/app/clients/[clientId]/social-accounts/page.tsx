import { notFound } from "next/navigation";
import { getClientById } from "@/modules/clients/actions";
import { listSocialAccountsByClient } from "@/modules/social-accounts/actions";
import { getCurrentWorkspace } from "@/lib/auth";
import { SocialAccountList } from "@/components/social-accounts/SocialAccountList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SocialAccountsPage({
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

  const accounts = await listSocialAccountsByClient(clientId, workspace.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{client.name}</h1>
        <p className="text-muted-foreground">Gestion des comptes sociaux</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comptes sociaux</CardTitle>
          <CardDescription>
            Configurez les comptes sociaux associés à ce client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SocialAccountList clientId={clientId} accounts={accounts} />
        </CardContent>
      </Card>
    </div>
  );
}

