import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type reports, type clients } from "@/lib/db/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Report = typeof reports.$inferSelect;
type Client = typeof clients.$inferSelect;

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

interface ReportSummaryCardProps {
  report: Report & { client?: Client };
  showClient?: boolean;
  linkTo?: string;
}

export function ReportSummaryCard({
  report,
  showClient = false,
  linkTo,
}: ReportSummaryCardProps) {
  const metrics = report.metrics as Record<string, string | number> | null;
  const monthLabel = monthLabels[report.month] || `Mois ${report.month}`;

  const content = (
    <Card className="transition-colors hover:bg-accent">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{report.title}</CardTitle>
            <CardDescription>
              {monthLabel} {report.year}
              {showClient && report.client && ` • ${report.client.name}`}
            </CardDescription>
          </div>
          <Badge variant="outline">
            {report.year}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {report.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {report.summary}
          </p>
        )}
        {metrics && (
          <div className="flex flex-wrap gap-2 text-xs">
            {metrics.followers_start && metrics.followers_end && (
              <Badge variant="secondary">
                Followers: {metrics.followers_start} → {metrics.followers_end}
              </Badge>
            )}
            {metrics.posts_published && (
              <Badge variant="secondary">
                {metrics.posts_published} post(s)
              </Badge>
            )}
            {metrics.engagement_rate && (
              <Badge variant="secondary">
                Engagement: {metrics.engagement_rate}%
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (linkTo) {
    return <Link href={linkTo}>{content}</Link>;
  }

  return content;
}

