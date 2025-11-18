"use server";

import { db } from "@/lib/db";
import { brandProfiles, clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentWorkspace, requireAuth } from "@/lib/auth";
import {
  upsertBrandProfileSchema,
  type UpsertBrandProfileInput,
} from "@/contracts/brand-profiles";
import { revalidatePath } from "next/cache";

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

export async function getBrandProfileByClientId(
  clientId: string,
  workspaceId: string
) {
  await requireAuth();

  // Vérifier l'accès au client
  await verifyClientAccess(clientId, workspaceId);

  const [profile] = await db
    .select()
    .from(brandProfiles)
    .where(eq(brandProfiles.clientId, clientId))
    .limit(1);

  return profile || null;
}

export async function upsertBrandProfile(input: UpsertBrandProfileInput) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();

  // Validation
  const validated = upsertBrandProfileSchema.parse(input);

  // Vérifier que le client appartient au workspace
  await verifyClientAccess(validated.clientId, workspace.id);

  // Vérifier si un profil existe déjà
  const existing = await getBrandProfileByClientId(
    validated.clientId,
    workspace.id
  );

  if (existing) {
    // Mise à jour
    const [updated] = await db
      .update(brandProfiles)
      .set({
        toneOfVoice: validated.toneOfVoice || null,
        brandColors: validated.brandColors || null,
        audience: validated.audience || null,
        do: validated.do || null,
        dont: validated.dont || null,
        examples: validated.examples || null,
        updatedAt: new Date(),
      })
      .where(eq(brandProfiles.clientId, validated.clientId))
      .returning();

    revalidatePath(`/app/clients/${validated.clientId}`);
    revalidatePath(`/app/clients/${validated.clientId}/brand`);
    return updated;
  } else {
    // Création
    const [created] = await db
      .insert(brandProfiles)
      .values({
        clientId: validated.clientId,
        toneOfVoice: validated.toneOfVoice || null,
        brandColors: validated.brandColors || null,
        audience: validated.audience || null,
        do: validated.do || null,
        dont: validated.dont || null,
        examples: validated.examples || null,
      })
      .returning();

    revalidatePath(`/app/clients/${validated.clientId}`);
    revalidatePath(`/app/clients/${validated.clientId}/brand`);
    return created;
  }
}

