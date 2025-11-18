import { notFound } from "next/navigation";
import { getClientById } from "@/modules/clients/actions";
import { listSocialAccountsByClient } from "@/modules/social-accounts/actions";
import { getBrandProfileByClientId } from "@/modules/brand-profiles/actions";
import { getClientPostOverview } from "@/modules/posts/actions";
import { listApprovalRequestsByClient } from "@/modules/approvals/actions";
import { listReportsByClient } from "@/modules/reports/actions";
import { getCurrentWorkspace } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Instagram, Facebook, Linkedin, Youtube, MessageSquare, Palette, Calendar, FileText, FileCheck, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ApprovalStatusBadge } from "@/components/approvals/ApprovalStatusBadge";

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

const statusLabels: Record<string, string> = {
  active: "Actif",
  paused: "En pause",
  archived: "Archivé",
};

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  paused: "secondary",
  archived: "outline",
};

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: MessageSquare,
  other: MessageSquare,
};

export default async function ClientOverviewPage({
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

  const socialAccounts = await listSocialAccountsByClient(clientId, workspace.id);
  const activeAccounts = socialAccounts.filter((acc) => acc.isActive);
  const brandProfile = await getBrandProfileByClientId(clientId, workspace.id);
  const postOverview = await getClientPostOverview(clientId, workspace.id);
  const approvalRequests = await listApprovalRequestsByClient(clientId, workspace.id);
  const activeApprovals = approvalRequests.filter(
    (req) => req.status !== "closed" && req.status !== "approved"
  );
  const lastApproval = approvalRequests[0] || null;
  const reports = await listReportsByClient(clientId, workspace.id);
  const lastReport = reports[0] || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-muted-foreground">Vue d'ensemble du client</p>
        </div>
        <Badge variant={statusVariants[client.status]}>
          {statusLabels[client.status]}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.industry && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Secteur
                </p>
                <p className="text-sm">{client.industry}</p>
              </div>
            )}
            {client.contactName && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Contact
                </p>
                <p className="text-sm">{client.contactName}</p>
                {client.contactEmail && (
                  <p className="text-sm text-muted-foreground">
                    {client.contactEmail}
                  </p>
                )}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Slug</p>
              <p className="text-sm font-mono">{client.slug}</p>
            </div>
          </CardContent>
        </Card>

        {client.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Comptes sociaux</CardTitle>
              <CardDescription>
                {activeAccounts.length > 0
                  ? `${activeAccounts.length} compte${activeAccounts.length > 1 ? "s" : ""} actif${activeAccounts.length > 1 ? "s" : ""}`
                  : "Aucun compte social configuré"}
              </CardDescription>
            </div>
            <Link href={`/app/clients/${clientId}/social-accounts`}>
              <Button variant="outline">Gérer</Button>
            </Link>
          </div>
        </CardHeader>
        {activeAccounts.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activeAccounts.map((account) => {
                const Icon = platformIcons[account.platform] || MessageSquare;
                return (
                  <div
                    key={account.id}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{account.handle}</span>
                    {account.url && (
                      <a
                        href={account.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <span className="sr-only">Ouvrir</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Profil de marque
              </CardTitle>
              <CardDescription>
                {brandProfile
                  ? "Références éditoriales définies"
                  : "Aucun profil de marque défini"}
              </CardDescription>
            </div>
            <Link href={`/app/clients/${clientId}/brand`}>
              <Button variant="outline">
                {brandProfile ? "Voir le profil complet" : "Créer un profil de marque"}
              </Button>
            </Link>
          </div>
        </CardHeader>
        {brandProfile && (
          <CardContent className="space-y-4">
            {brandProfile.toneOfVoice && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Ton de voix
                </p>
                <p className="text-sm line-clamp-2">
                  {brandProfile.toneOfVoice}
                </p>
              </div>
            )}
            {brandProfile.brandColors &&
              (brandProfile.brandColors as string[]).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Couleurs
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(brandProfile.brandColors as string[]).slice(0, 5).map((color) => (
                      <div
                        key={color}
                        className="flex items-center gap-2 rounded-lg border px-2 py-1"
                      >
                        <div
                          className="h-4 w-4 rounded border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-mono">{color}</span>
                      </div>
                    ))}
                    {(brandProfile.brandColors as string[]).length > 5 && (
                      <span className="text-xs text-muted-foreground">
                        +{(brandProfile.brandColors as string[]).length - 5} autres
                      </span>
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Planning éditorial
              </CardTitle>
              <CardDescription>
                {postOverview.scheduledThisWeek > 0
                  ? `${postOverview.scheduledThisWeek} post${postOverview.scheduledThisWeek > 1 ? "s" : ""} programmé${postOverview.scheduledThisWeek > 1 ? "s" : ""} cette semaine`
                  : "Aucun post programmé cette semaine"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href={`/app/clients/${clientId}/posts`}>
                <Button variant="outline">Voir tous les posts</Button>
              </Link>
              <Link href={`/app/clients/${clientId}/calendar`}>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendrier
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        {postOverview.nextPost && (
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Prochain post
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{postOverview.nextPost.platform}</Badge>
                <span className="text-sm font-medium">
                  {postOverview.nextPost.title}
                </span>
                {postOverview.nextPost.scheduledAt && (
                  <span className="text-sm text-muted-foreground">
                    - {format(
                      new Date(postOverview.nextPost.scheduledAt),
                      "dd MMM yyyy à HH:mm",
                      { locale: fr }
                    )}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Approbations
              </CardTitle>
              <CardDescription>
                {activeApprovals.length > 0
                  ? `${activeApprovals.length} demande${activeApprovals.length > 1 ? "s" : ""} active${activeApprovals.length > 1 ? "s" : ""}`
                  : "Aucune demande d'approbation active"}
              </CardDescription>
            </div>
            <Link href={`/app/clients/${clientId}/approvals`}>
              <Button variant="outline">Gérer les approvals</Button>
            </Link>
          </div>
        </CardHeader>
        {lastApproval && (
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{lastApproval.title}</p>
                <p className="text-xs text-muted-foreground">
                  {lastApproval.itemsCount} post(s)
                </p>
              </div>
              <ApprovalStatusBadge status={lastApproval.status as any} />
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Rapports
              </CardTitle>
              <CardDescription>
                {reports.length > 0
                  ? `${reports.length} rapport${reports.length > 1 ? "s" : ""}`
                  : "Aucun rapport"}
              </CardDescription>
            </div>
            <Link href={`/app/clients/${clientId}/reports`}>
              <Button variant="outline">Gérer les rapports</Button>
            </Link>
          </div>
        </CardHeader>
        {lastReport && (
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">{lastReport.title}</p>
              <p className="text-xs text-muted-foreground">
                {monthLabels[lastReport.month] || `Mois ${lastReport.month}`} {lastReport.year}
              </p>
              {lastReport.summary && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {lastReport.summary}
                </p>
              )}
            </div>
            <Link href={`/app/reports/${lastReport.id}`}>
              <Button variant="outline" size="sm" className="w-full mt-2">
                Voir le rapport complet
              </Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

