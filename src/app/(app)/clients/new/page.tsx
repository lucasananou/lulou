import { ClientForm } from "@/components/client/ClientForm";
import { createClient } from "@/modules/clients/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouveau client</h1>
        <p className="text-muted-foreground">
          Ajoutez un nouveau client à votre workspace
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du client</CardTitle>
          <CardDescription>
            Remplissez les informations de base du client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm onSubmit={createClient} />
        </CardContent>
      </Card>
    </div>
  );
}

