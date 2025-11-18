"use server";

import { db } from "@/lib/db";
import { posts, clients } from "@/lib/db/schema";
import { eq, and, gte, lte, isNotNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

/**
 * Vérifie que le client appartient au workspace courant
 */
async function verifyClientAccess(clientId: string, workspaceId: string) {
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.workspaceId, workspaceId)))
    .limit(1);

  if (!client) {
    throw new Error("Client non trouvé ou accès refusé");
  }

  return client;
}

export interface CalendarPost {
  id: string;
  title: string;
  platform: string;
  scheduledAt: Date | null;
  status: string;
}

/**
 * Récupère les posts d'un client dans une plage de dates
 * Retourne les posts groupés par jour (côté client)
 */
export async function getClientCalendar(
  clientId: string,
  workspaceId: string,
  from: Date,
  to: Date
) {
  await requireAuth();

  // Vérifier l'accès au client
  await verifyClientAccess(clientId, workspaceId);

  // Récupérer les posts avec scheduled_at dans la plage
  const calendarPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      platform: posts.platform,
      scheduledAt: posts.scheduledAt,
      status: posts.status,
    })
    .from(posts)
    .where(
      and(
        eq(posts.clientId, clientId),
        isNotNull(posts.scheduledAt),
        gte(posts.scheduledAt, from),
        lte(posts.scheduledAt, to)
      )
    )
    .orderBy(posts.scheduledAt);

  return calendarPosts as CalendarPost[];
}

