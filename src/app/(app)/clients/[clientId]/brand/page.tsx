import { notFound } from "next/navigation";
import { getClientById } from "@/modules/clients/actions";
import { getBrandProfileByClientId } from "@/modules/brand-profiles/actions";
import { getCurrentWorkspace } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandProfileForm } from "@/components/brand-profiles/BrandProfileForm";
import { upsertBrandProfile } from "@/modules/brand-profiles/actions";
import { BrandProfileView } from "@/components/brand-profiles/BrandProfileView";

export default async function BrandProfilePage({
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

  const brandProfile = await getBrandProfileByClientId(clientId, workspace.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil de marque</h1>
        <p className="text-muted-foreground">{client.name}</p>
      </div>

      {brandProfile ? (
        <BrandProfileView
          brandProfile={brandProfile}
          clientId={clientId}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Créer un profil de marque</CardTitle>
            <CardDescription>
              Aucun profil de marque défini pour ce client. Créez-en un pour
              définir les références éditoriales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BrandProfileForm
              clientId={clientId}
              onSubmit={async (data) => {
                await upsertBrandProfile(data);
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

