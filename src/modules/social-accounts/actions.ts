"use server";

import { db } from "@/lib/db";
import { socialAccounts, clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentWorkspace, requireAuth } from "@/lib/auth";
import {
  createSocialAccountSchema,
  updateSocialAccountSchema,
  type CreateSocialAccountInput,
  type UpdateSocialAccountInput,
} from "@/contracts/social-accounts";
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

export async function listSocialAccountsByClient(
  clientId: string,
  workspaceId: string
) {
  await requireAuth();

  // Vérifier l'accès au client
  await verifyClientAccess(clientId, workspaceId);

  const accounts = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.clientId, clientId))
    .orderBy(socialAccounts.platform, socialAccounts.handle);

  return accounts;
}

export async function createSocialAccount(input: CreateSocialAccountInput) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();

  // Validation
  const validated = createSocialAccountSchema.parse(input);

  // Vérifier que le client appartient au workspace
  await verifyClientAccess(validated.clientId, workspace.id);

  // Créer le compte social
  const [newAccount] = await db
    .insert(socialAccounts)
    .values({
      clientId: validated.clientId,
      platform: validated.platform,
      handle: validated.handle,
      url: validated.url || null,
      isActive: validated.isActive ?? true,
    })
    .returning();

  revalidatePath(`/app/clients/${validated.clientId}`);
  revalidatePath(`/app/clients/${validated.clientId}/social-accounts`);
  return newAccount;
}

export async function updateSocialAccount(
  id: string,
  input: Partial<Omit<CreateSocialAccountInput, "clientId">>
) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();

  // Validation
  const validated = updateSocialAccountSchema.partial().parse({ id, ...input });

  // Récupérer le compte social pour vérifier l'accès via le client
  const [account] = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.id, id))
    .limit(1);

  if (!account) {
    throw new Error("Compte social non trouvé");
  }

  // Vérifier que le client appartient au workspace
  await verifyClientAccess(account.clientId, workspace.id);

  // Mettre à jour
  const [updated] = await db
    .update(socialAccounts)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(socialAccounts.id, id))
    .returning();

  revalidatePath(`/app/clients/${account.clientId}`);
  revalidatePath(`/app/clients/${account.clientId}/social-accounts`);
  return updated;
}

/**
 * Supprime définitivement un compte social (hard delete)
 * Pour un soft delete, utilisez updateSocialAccount avec isActive: false
 */
export async function deleteSocialAccount(id: string) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();

  // Récupérer le compte social pour vérifier l'accès
  const [account] = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.id, id))
    .limit(1);

  if (!account) {
    throw new Error("Compte social non trouvé");
  }

  // Vérifier que le client appartient au workspace
  await verifyClientAccess(account.clientId, workspace.id);

  // Supprimer
  await db.delete(socialAccounts).where(eq(socialAccounts.id, id));

  revalidatePath(`/app/clients/${account.clientId}`);
  revalidatePath(`/app/clients/${account.clientId}/social-accounts`);
}

/**
 * Récupère un compte social par son ID (avec vérification d'accès)
 */
export async function getSocialAccountById(
  id: string,
  workspaceId: string
) {
  await requireAuth();

  const [account] = await db
    .select({
      account: socialAccounts,
      client: clients,
    })
    .from(socialAccounts)
    .innerJoin(clients, eq(socialAccounts.clientId, clients.id))
    .where(
      and(
        eq(socialAccounts.id, id),
        eq(clients.workspaceId, workspaceId)
      )
    )
    .limit(1);

  if (!account) {
    return null;
  }

  return account.account;
}

