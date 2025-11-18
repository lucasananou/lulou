import { notFound } from "next/navigation";
import { getClientById } from "@/modules/clients/actions";
import { getCurrentWorkspace } from "@/lib/auth";
import { getClientCalendar } from "@/modules/calendar/queries";
import { CalendarMonth } from "@/components/calendar/CalendarMonth";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { CalendarNavigation } from "@/components/calendar/CalendarNavigation";
import { startOfMonth, endOfMonth } from "date-fns";

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const { clientId } = await params;
  const { month, year } = await searchParams;
  const workspace = await getCurrentWorkspace();
  const client = await getClientById(clientId, workspace.id);

  if (!client) {
    notFound();
  }

  // Déterminer la date courante
  const currentDate = new Date();
  if (month && year) {
    currentDate.setMonth(parseInt(month) - 1);
    currentDate.setFullYear(parseInt(year));
  }

  // Récupérer les posts du mois
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const posts = await getClientCalendar(
    clientId,
    workspace.id,
    monthStart,
    monthEnd
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendrier éditorial</h1>
          <p className="text-muted-foreground">{client.name}</p>
        </div>
      </div>

      <CalendarNavigation clientId={clientId} currentDate={currentDate} />

      <CalendarMonth
        clientId={clientId}
        currentDate={currentDate}
        posts={posts}
      />
    </div>
  );
}

