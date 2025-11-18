"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteReport } from "@/modules/reports/actions";
import { type reports, type clients } from "@/lib/db/schema";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";

type Report = typeof reports.$inferSelect & { client: typeof clients.$inferSelect };

const monthLabels: Record<number, string> = {
  1: "Janvier",
  2: "Février",
  3: "Mars",
  4: "Avril",
  5: "Mai",
  6: "Juin",
  7: "Juillet",
  8: "Août",
  9: "Septembre",
  10: "Octobre",
  11: "Novembre",
  12: "Décembre",
};

interface ReportDetailViewProps {
  report: Report;
}

export function ReportDetailView({ report }: ReportDetailViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const metrics = report.metrics as Record<string, string | number> | null;
  const monthLabel = monthLabels[report.month] || `Mois ${report.month}`;

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce rapport ?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteReport(report.id);
      router.push("/app/reports");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Informations</CardTitle>
              <CardDescription>Détails du rapport mensuel</CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href={`/app/reports/${report.id}?edit=true`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Suppression..." : "Supprimer"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Période
            </p>
            <p className="text-sm">
              {monthLabel} {report.year}
            </p>
          </div>
          {report.summary && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Résumé
              </p>
              <p className="text-sm whitespace-pre-wrap">{report.summary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {metrics && Object.keys(metrics).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Métriques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {metrics.followers_start && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Followers début
                  </p>
                  <p className="text-2xl font-bold">
                    {metrics.followers_start.toLocaleString()}
                  </p>
                </div>
              )}
              {metrics.followers_end && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Followers fin
                  </p>
                  <p className="text-2xl font-bold">
                    {metrics.followers_end.toLocaleString()}
                  </p>
                  {metrics.followers_start && (
                    <p className="text-sm text-muted-foreground">
                      {Number(metrics.followers_end) - Number(metrics.followers_start) > 0
                        ? "+"
                        : ""}
                      {Number(metrics.followers_end) - Number(metrics.followers_start)}{" "}
                      followers
                    </p>
                  )}
                </div>
              )}
              {metrics.posts_published && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Posts publiés
                  </p>
                  <p className="text-2xl font-bold">
                    {metrics.posts_published}
                  </p>
                </div>
              )}
              {metrics.engagement_rate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Taux d'engagement
                  </p>
                  <p className="text-2xl font-bold">
                    {metrics.engagement_rate}%
                  </p>
                </div>
              )}
            </div>
            {metrics.best_post_id && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Meilleur post
                </p>
                <Link
                  href={`/app/clients/${report.clientId}/posts/${metrics.best_post_id}`}
                >
                  <Button variant="link" className="p-0 h-auto">
                    Voir le post
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href={`/app/clients/${report.clientId}`}>
            <Button variant="outline" className="w-full">
              Voir le client
            </Button>
          </Link>
          <Link href={`/app/clients/${report.clientId}/posts`}>
            <Button variant="outline" className="w-full">
              Voir les posts du client
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

