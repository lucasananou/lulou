import { getCurrentWorkspace } from "@/lib/auth";
import { listReportsByWorkspace } from "@/modules/reports/actions";
import { ReportSummaryCard } from "@/components/reports/ReportSummaryCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReportsPage() {
  const workspace = await getCurrentWorkspace();
  const reports = await listReportsByWorkspace(workspace.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rapports</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de tous les rapports mensuels
        </p>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Aucun rapport pour le moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ReportSummaryCard
              key={report.id}
              report={report}
              showClient={true}
              linkTo={`/app/reports/${report.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

