import { notFound } from "next/navigation";
import { getClientById } from "@/modules/clients/actions";
import { listReportsByClient } from "@/modules/reports/actions";
import { getCurrentWorkspace } from "@/lib/auth";
import { ReportSummaryCard } from "@/components/reports/ReportSummaryCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ReportForm } from "@/components/reports/ReportForm";
import { upsertReport } from "@/modules/reports/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default async function ClientReportsPage({
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

  const reports = await listReportsByClient(clientId, workspace.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapports</h1>
          <p className="text-muted-foreground">{client.name}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau rapport
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un rapport</DialogTitle>
              <DialogDescription>
                Créez un nouveau rapport mensuel pour ce client
              </DialogDescription>
            </DialogHeader>
            <ReportForm
              clientId={clientId}
              onSubmit={async (data) => {
                await upsertReport(data);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              Aucun rapport pour ce client
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Créer un rapport</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer un rapport</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau rapport mensuel pour ce client
                  </DialogDescription>
                </DialogHeader>
                <ReportForm
                  clientId={clientId}
                  onSubmit={async (data) => {
                    await upsertReport(data);
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ReportSummaryCard
              key={report.id}
              report={report}
              linkTo={`/app/reports/${report.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

