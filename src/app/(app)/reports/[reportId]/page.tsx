import { notFound } from "next/navigation";
import { getReportById, upsertReport } from "@/modules/reports/actions";
import { getCurrentWorkspace } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportForm } from "@/components/reports/ReportForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReportDetailView } from "@/components/reports/ReportDetailView";

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

export default async function ReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { reportId } = await params;
  const { edit } = await searchParams;
  const workspace = await getCurrentWorkspace();
  const report = await getReportById(reportId, workspace.id);

  if (!report) {
    notFound();
  }

  const isEditing = edit === "true";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/reports">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{report.title}</h1>
            <p className="text-muted-foreground">
              {monthLabels[report.month] || `Mois ${report.month}`} {report.year} • {report.client.name}
            </p>
          </div>
        </div>
        <Link href={`/app/clients/${report.clientId}`}>
          <Button variant="outline">Voir le client</Button>
        </Link>
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Modifier le rapport</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportForm
              clientId={report.clientId}
              onSubmit={async (data) => {
                await upsertReport(data);
              }}
              defaultValues={report}
            />
          </CardContent>
        </Card>
      ) : (
        <ReportDetailView report={report} />
      )}
    </div>
  );
}

