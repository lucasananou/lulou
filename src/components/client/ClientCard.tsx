import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type clients } from "@/lib/db/schema";

type Client = typeof clients.$inferSelect;

const statusLabels: Record<Client["status"], string> = {
  active: "Actif",
  paused: "En pause",
  archived: "Archivé",
};

const statusVariants: Record<Client["status"], "default" | "secondary" | "outline"> = {
  active: "default",
  paused: "secondary",
  archived: "outline",
};

export function ClientCard({ client }: { client: Client }) {
  return (
    <Link href={`/app/clients/${client.id}`}>
      <Card className="transition-colors hover:bg-accent">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>{client.name}</CardTitle>
            <Badge variant={statusVariants[client.status]}>
              {statusLabels[client.status]}
            </Badge>
          </div>
          {client.industry && (
            <CardDescription>{client.industry}</CardDescription>
          )}
        </CardHeader>
        {client.contactName && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contact: {client.contactName}
              {client.contactEmail && ` (${client.contactEmail})`}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}

