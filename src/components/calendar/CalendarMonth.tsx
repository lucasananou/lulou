"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { type SocialPlatform } from "@/contracts/posts";

const platformLabels: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Autre",
};

interface CalendarPost {
  id: string;
  title: string;
  platform: string;
  scheduledAt: Date | null;
  status: string;
}

interface CalendarMonthProps {
  clientId: string;
  currentDate: Date;
  posts: CalendarPost[];
}

export function CalendarMonth({
  clientId,
  currentDate,
  posts,
}: CalendarMonthProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getPostsForDay = (day: Date) => {
    return posts.filter(
      (post) =>
        post.scheduledAt &&
        isSameDay(new Date(post.scheduledAt), day)
    );
  };

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {format(currentDate, "MMMM yyyy", { locale: fr })}
        </h2>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}

        {days.map((day) => {
          const dayPosts = getPostsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] border p-2 ${
                isCurrentMonth ? "bg-background" : "bg-muted/30"
              } ${isToday ? "ring-2 ring-primary" : ""}`}
            >
              <div
                className={`text-sm mb-1 ${
                  isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                } ${isToday ? "font-bold" : ""}`}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayPosts.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    href={`/app/clients/${clientId}/posts/${post.id}`}
                  >
                    <Badge
                      variant="outline"
                      className="w-full text-xs justify-start truncate"
                      title={post.title}
                    >
                      {platformLabels[post.platform as SocialPlatform] ||
                        post.platform}{" "}
                      - {post.title.slice(0, 15)}
                      {post.title.length > 15 ? "..." : ""}
                    </Badge>
                  </Link>
                ))}
                {dayPosts.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayPosts.length - 3} autre{dayPosts.length - 3 > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

