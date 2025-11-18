"use server";

import { getDb } from "@/lib/db";
import {
  approvalRequests,
  approvalItems,
  posts,
  clients,
} from "@/lib/db/schema";
import { eq, and, inArray, isNull } from "drizzle-orm";
import { getCurrentWorkspace, requireAuth } from "@/lib/auth";
import {
  createApprovalRequestSchema,
  updateApprovalItemSchema,
  type CreateApprovalRequestInput,
  type UpdateApprovalItemInput,
} from "@/contracts/approvals";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

/**
 * Vérifie que le client appartient au workspace courant
 */
async function verifyClientAccess(clientId: string, workspaceId: string) {
  const database = getDb();
  const [client] = await database
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.workspaceId, workspaceId)))
    .limit(1);

  if (!client) {
    throw new Error("Client non trouvé ou accès refusé");
  }

  return client;
}

/**
 * Génère un token unique pour l'approval request
 */
function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createApprovalRequest(input: CreateApprovalRequestInput) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();

  // Validation
  const validated = createApprovalRequestSchema.parse(input);

  // Vérifier que le client appartient au workspace
  await verifyClientAccess(validated.clientId, workspace.id);

  // Vérifier que les posts existent et appartiennent au client
  const database = getDb();
  const postsList = await database
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.clientId, validated.clientId),
        inArray(posts.id, validated.postIds)
      )
    );

  // Vérifier qu'aucun post n'est déjà dans une demande
  const postsAlreadyInRequest = postsList.filter(
    (post) => post.approvalRequestId !== null
  );
  if (postsAlreadyInRequest.length > 0) {
    throw new Error(
      "Certains posts sont déjà dans une demande d'approbation"
    );
  }

  if (postsList.length !== validated.postIds.length) {
    throw new Error(
      "Certains posts ne peuvent pas être ajoutés (déjà dans une demande ou n'existent pas)"
    );
  }

  // Créer la demande d'approbation
  const [newRequest] = await database
    .insert(approvalRequests)
    .values({
      clientId: validated.clientId,
      workspaceId: workspace.id,
      title: validated.title,
      expiresAt: validated.expiresAt
        ? new Date(validated.expiresAt)
        : null,
      status: "draft",
    })
    .returning();

  // Créer les items d'approbation
  const items = validated.postIds.map((postId) => ({
    approvalRequestId: newRequest.id,
    postId,
    status: "pending" as const,
  }));

  await database.insert(approvalItems).values(items);

  // Associer les posts à la demande
  await database
    .update(posts)
    .set({
      approvalRequestId: newRequest.id,
      status: "to_approve", // Passer les posts au statut "to_approve"
    })
    .where(inArray(posts.id, validated.postIds));

  revalidatePath(`/app/clients/${validated.clientId}/approvals`);
  return newRequest;
}

export async function sendApprovalRequest(id: string) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();
  const database = getDb();

  // Récupérer la demande
  const [request] = await database
    .select()
    .from(approvalRequests)
    .where(
      and(eq(approvalRequests.id, id), eq(approvalRequests.workspaceId, workspace.id))
    )
    .limit(1);

  if (!request) {
    throw new Error("Demande d'approbation non trouvée");
  }

  if (request.status !== "draft") {
    throw new Error("La demande a déjà été envoyée");
  }

  // Générer un token si non existant
  let token = request.token;
  if (!token) {
    token = generateToken();
  }

  // Mettre à jour la demande
  const [updated] = await database
    .update(approvalRequests)
    .set({
      token,
      status: "sent",
      sentAt: new Date(),
    })
    .where(eq(approvalRequests.id, id))
    .returning();

  revalidatePath(`/app/clients/${request.clientId}/approvals`);
  revalidatePath(`/app/clients/${request.clientId}/approvals/${id}`);

  // Retourner l'URL publique
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    ...updated,
    publicUrl: `${baseUrl}/approval/${token}`,
  };
}

export async function getApprovalRequestByToken(token: string) {
  const database = getDb();
  const [request] = await database
    .select()
    .from(approvalRequests)
    .where(eq(approvalRequests.token, token))
    .limit(1);

  if (!request) {
    return null;
  }

  // Vérifier l'expiration
  if (request.expiresAt && new Date(request.expiresAt) < new Date()) {
    return null;
  }

  // Récupérer les items avec les posts
  const items = await database
    .select({
      item: approvalItems,
      post: posts,
    })
    .from(approvalItems)
    .innerJoin(posts, eq(approvalItems.postId, posts.id))
    .where(eq(approvalItems.approvalRequestId, request.id));

  return {
    ...request,
    items: items.map(({ item, post }) => ({
      ...item,
      post,
    })),
  };
}

export async function updateApprovalItemStatus(
  input: UpdateApprovalItemInput
) {
  // Pas de vérification auth - accessible via token public

  // Validation
  const validated = updateApprovalItemSchema.parse(input);

  // Récupérer l'item
  const database = getDb();
  const [item] = await database
    .select({
      item: approvalItems,
      request: approvalRequests,
    })
    .from(approvalItems)
    .innerJoin(
      approvalRequests,
      eq(approvalItems.approvalRequestId, approvalRequests.id)
    )
    .where(eq(approvalItems.id, validated.itemId))
    .limit(1);

  if (!item) {
    throw new Error("Item d'approbation non trouvé");
  }

  // Vérifier l'expiration
  if (
    item.request.expiresAt &&
    new Date(item.request.expiresAt) < new Date()
  ) {
    throw new Error("Cette demande d'approbation a expiré");
  }

  // Mettre à jour l'item
  await database
    .update(approvalItems)
    .set({
      status: validated.status as any,
      clientComment: validated.clientComment || null,
      updatedAt: new Date(),
    })
    .where(eq(approvalItems.id, validated.itemId));

  // Mettre à jour le statut du post
  await database
    .update(posts)
    .set({
      status: validated.status === "approved" ? "approved" : "to_approve",
    })
    .where(eq(posts.id, item.item.postId));

  // Vérifier le statut global de la demande
  const allItems = await database
    .select()
    .from(approvalItems)
    .where(eq(approvalItems.approvalRequestId, item.request.id));

  const allApproved = allItems.every((i) => i.status === "approved");
  const allRejected = allItems.every((i) => i.status === "rejected");
  const hasApproved = allItems.some((i) => i.status === "approved");
  const hasRejected = allItems.some((i) => i.status === "rejected");

  let newStatus: "approved" | "partially_approved" | "sent" = "sent";
  if (allApproved) {
    newStatus = "approved";
  } else if (hasApproved || hasRejected) {
    newStatus = "partially_approved";
  }

  if (newStatus === "approved") {
    await database
      .update(approvalRequests)
      .set({
        status: "approved",
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(approvalRequests.id, item.request.id));
  } else if (newStatus === "partially_approved") {
    await database
      .update(approvalRequests)
      .set({
        status: "partially_approved",
        updatedAt: new Date(),
      })
      .where(eq(approvalRequests.id, item.request.id));
  }

  return { success: true };
}

export async function closeApprovalRequest(id: string) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();
  const database = getDb();

  // Récupérer la demande
  const [request] = await database
    .select()
    .from(approvalRequests)
    .where(
      and(eq(approvalRequests.id, id), eq(approvalRequests.workspaceId, workspace.id))
    )
    .limit(1);

  if (!request) {
    throw new Error("Demande d'approbation non trouvée");
  }

  // Mettre à jour le statut
  const [updated] = await database
    .update(approvalRequests)
    .set({
      status: "closed",
      updatedAt: new Date(),
    })
    .where(eq(approvalRequests.id, id))
    .returning();

  revalidatePath(`/app/clients/${request.clientId}/approvals`);
  revalidatePath(`/app/clients/${request.clientId}/approvals/${id}`);

  return updated;
}

export async function listApprovalRequestsByClient(
  clientId: string,
  workspaceId: string
) {
  await requireAuth();

  await verifyClientAccess(clientId, workspaceId);
  const database = getDb();
  const requests = await database
    .select()
    .from(approvalRequests)
    .where(
      and(
        eq(approvalRequests.clientId, clientId),
        eq(approvalRequests.workspaceId, workspaceId)
      )
    )
    .orderBy(approvalRequests.createdAt);

  // Récupérer le nombre d'items pour chaque demande
  const requestsWithCounts = await Promise.all(
    requests.map(async (request) => {
      const items = await database
        .select()
        .from(approvalItems)
        .where(eq(approvalItems.approvalRequestId, request.id));

      return {
        ...request,
        itemsCount: items.length,
      };
    })
  );

  return requestsWithCounts;
}

export async function getApprovalRequestById(
  id: string,
  workspaceId: string
) {
  await requireAuth();
  const database = getDb();

  const [request] = await database
    .select()
    .from(approvalRequests)
    .where(
      and(eq(approvalRequests.id, id), eq(approvalRequests.workspaceId, workspaceId))
    )
    .limit(1);

  if (!request) {
    return null;
  }

  // Récupérer les items avec les posts
  const items = await database
    .select({
      item: approvalItems,
      post: posts,
    })
    .from(approvalItems)
    .innerJoin(posts, eq(approvalItems.postId, posts.id))
    .where(eq(approvalItems.approvalRequestId, request.id));

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const publicUrl = request.token
    ? `${baseUrl}/approval/${request.token}`
    : null;

  return {
    ...request,
    items: items.map(({ item, post }) => ({
      ...item,
      post,
    })),
    publicUrl,
  };
}

export async function getAvailablePostsForApproval(
  clientId: string,
  workspaceId: string
) {
  await requireAuth();
  const database = getDb();

  await verifyClientAccess(clientId, workspaceId);

  // Posts qui ne sont pas déjà dans une demande d'approbation
  const availablePosts = await database
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.clientId, clientId),
        isNull(posts.approvalRequestId),
        inArray(posts.status, ["draft", "to_approve", "scheduled"])
      )
    )
    .orderBy(posts.createdAt);

  return availablePosts;
}

