"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { addMonths, subMonths, format } from "date-fns";
import { fr } from "date-fns/locale";

interface CalendarNavigationProps {
  clientId: string;
  currentDate: Date;
}

export function CalendarNavigation({
  clientId,
  currentDate,
}: CalendarNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateMonth = (direction: "prev" | "next" | "today") => {
    let newDate: Date;
    if (direction === "prev") {
      newDate = subMonths(currentDate, 1);
    } else if (direction === "next") {
      newDate = addMonths(currentDate, 1);
    } else {
      newDate = new Date();
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("month", String(newDate.getMonth() + 1));
    params.set("year", String(newDate.getFullYear()));
    router.push(`/app/clients/${clientId}/calendar?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => navigateMonth("prev")}>
          <ChevronLeft className="h-4 w-4" />
          Mois précédent
        </Button>
        <Button variant="outline" onClick={() => navigateMonth("today")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Aujourd'hui
        </Button>
        <Button variant="outline" onClick={() => navigateMonth("next")}>
          Mois suivant
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

