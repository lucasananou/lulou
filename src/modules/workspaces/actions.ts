"use server";

import { getDb } from "@/lib/db";
import { workspaces, workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function getWorkspaceById(id: string) {
  await requireAuth();
  const database = getDb();

  const [workspace] = await database
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, id))
    .limit(1);

  return workspace || null;
}

