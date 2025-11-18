import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientCard } from "@/components/client/ClientCard";
import { listClients } from "@/modules/clients/actions";
import { getCurrentWorkspace } from "@/lib/auth";

export default async function ClientsPage() {
  const workspace = await getCurrentWorkspace();
  const clients = await listClients(workspace.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Gérez vos clients et leurs comptes sociaux
          </p>
        </div>
        <Link href="/app/clients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau client
          </Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Aucun client pour le moment
          </p>
          <Link href="/app/clients/new">
            <Button variant="outline">Créer votre premier client</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}

