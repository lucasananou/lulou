"use server";

import { getDb } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentWorkspace, requireAuth } from "@/lib/auth";
import {
  createClientSchema,
  updateClientSchema,
  type CreateClientInput,
  type UpdateClientInput,
} from "@/contracts/clients";
import { revalidatePath } from "next/cache";

export async function createClient(input: CreateClientInput) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();
  const database = getDb();

  // Validation
  const validated = createClientSchema.parse(input);

  // Vérifier l'unicité du slug dans le workspace
  const existing = await database
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.workspaceId, workspace.id),
        eq(clients.slug, validated.slug)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Un client avec ce slug existe déjà dans ce workspace");
  }

  // Créer le client
  const [newClient] = await database
    .insert(clients)
    .values({
      workspaceId: workspace.id,
      name: validated.name,
      slug: validated.slug,
      industry: validated.industry || null,
      contactName: validated.contactName || null,
      contactEmail: validated.contactEmail || null,
      status: validated.status,
      notes: validated.notes || null,
    })
    .returning();

  revalidatePath("/app/clients");
  return newClient;
}

export async function updateClient(id: string, input: Partial<CreateClientInput>) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();
  const database = getDb();

  const validated = updateClientSchema.partial().parse({ id, ...input });

  // Vérifier que le client appartient au workspace
  const existing = await getClientById(id, workspace.id);
  if (!existing) {
    throw new Error("Client non trouvé");
  }

  // Si le slug change, vérifier l'unicité
  if (validated.slug && validated.slug !== existing.slug) {
    const duplicate = await database
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.workspaceId, workspace.id),
          eq(clients.slug, validated.slug)
        )
      )
      .limit(1);

    if (duplicate.length > 0) {
      throw new Error("Un client avec ce slug existe déjà");
    }
  }

  const [updated] = await database
    .update(clients)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, id))
    .returning();

  revalidatePath("/app/clients");
  revalidatePath(`/app/clients/${id}`);
  return updated;
}

export async function listClients(workspaceId: string) {
  await requireAuth();
  const database = getDb();
  const allClients = await database
    .select()
    .from(clients)
    .where(eq(clients.workspaceId, workspaceId))
    .orderBy(clients.name);

  return allClients;
}

export async function getClientById(id: string, workspaceId: string) {
  await requireAuth();
  const database = getDb();
  const [client] = await database
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.workspaceId, workspaceId)))
    .limit(1);

  return client || null;
}

