"use server";

import { db } from "@/lib/db";
import { posts, clients, postAssets } from "@/lib/db/schema";
import { eq, and, gte, lte, inArray, isNull, isNotNull } from "drizzle-orm";
import { getCurrentWorkspace, requireAuth } from "@/lib/auth";
import {
  createPostSchema,
  updatePostSchema,
  updatePostStatusSchema,
  type CreatePostInput,
  type UpdatePostInput,
  type UpdatePostStatusInput,
} from "@/contracts/posts";
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

export interface PostFilters {
  status?: string[];
  platform?: string[];
  from?: Date;
  to?: Date;
}

export async function listPostsByClient(
  clientId: string,
  workspaceId: string,
  filters?: PostFilters
) {
  await requireAuth();

  // Vérifier l'accès au client
  await verifyClientAccess(clientId, workspaceId);

  let query = db
    .select()
    .from(posts)
    .where(eq(posts.clientId, clientId));

  // Appliquer les filtres
  const conditions = [eq(posts.clientId, clientId)];

  if (filters?.status && filters.status.length > 0) {
    conditions.push(inArray(posts.status, filters.status as any));
  }

  if (filters?.platform && filters.platform.length > 0) {
    conditions.push(inArray(posts.platform, filters.platform as any));
  }

  if (filters?.from) {
    conditions.push(gte(posts.scheduledAt, filters.from));
  }

  if (filters?.to) {
    conditions.push(lte(posts.scheduledAt, filters.to));
  }

  const allPosts = await db
    .select()
    .from(posts)
    .where(and(...conditions))
    .orderBy(posts.scheduledAt, posts.createdAt);

  return allPosts;
}

export async function getPostById(postId: string, workspaceId: string) {
  await requireAuth();

  const [post] = await db
    .select({
      post: posts,
      client: clients,
    })
    .from(posts)
    .innerJoin(clients, eq(posts.clientId, clients.id))
    .where(
      and(
        eq(posts.id, postId),
        eq(clients.workspaceId, workspaceId)
      )
    )
    .limit(1);

  if (!post) {
    return null;
  }

  // Récupérer les assets
  const assets = await db
    .select()
    .from(postAssets)
    .where(eq(postAssets.postId, postId));

  return {
    ...post.post,
    assets,
  };
}

export async function createPost(input: CreatePostInput) {
  const userId = await requireAuth();
  const workspace = await getCurrentWorkspace();

  // Validation
  const validated = createPostSchema.parse(input);

  // Vérifier que le client appartient au workspace
  await verifyClientAccess(validated.clientId, workspace.id);

  // Créer le post
  const [newPost] = await db
    .insert(posts)
    .values({
      clientId: validated.clientId,
      platform: validated.platform,
      title: validated.title,
      body: validated.body,
      tags: validated.tags || null,
      scheduledAt: validated.scheduledAt
        ? new Date(validated.scheduledAt)
        : null,
      status: validated.scheduledAt ? "scheduled" : "draft",
      createdBy: userId,
    })
    .returning();

  revalidatePath(`/app/clients/${validated.clientId}/posts`);
  revalidatePath(`/app/clients/${validated.clientId}/calendar`);
  revalidatePath(`/app/clients/${validated.clientId}`);
  return newPost;
}

export async function updatePost(postId: string, input: Partial<Omit<CreatePostInput, "clientId">>) {
  const userId = await requireAuth();
  const workspace = await getCurrentWorkspace();

  // Récupérer le post pour vérifier l'accès
  const post = await getPostById(postId, workspace.id);
  if (!post) {
    throw new Error("Post non trouvé ou accès refusé");
  }

  // Validation
  const validated = updatePostSchema.partial().parse({ id: postId, ...input });

  // Déterminer le statut si scheduledAt change
  let status = post.status;
  if (validated.scheduledAt !== undefined) {
    if (validated.scheduledAt) {
      status = "scheduled";
    } else if (post.status === "scheduled") {
      status = "draft";
    }
  }

  // Mettre à jour
  const [updated] = await db
    .update(posts)
    .set({
      platform: validated.platform,
      title: validated.title,
      body: validated.body,
      tags: validated.tags || null,
      scheduledAt: validated.scheduledAt
        ? new Date(validated.scheduledAt)
        : validated.scheduledAt === null
        ? null
        : undefined,
      status,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))
    .returning();

  revalidatePath(`/app/clients/${post.clientId}/posts`);
  revalidatePath(`/app/clients/${post.clientId}/posts/${postId}`);
  revalidatePath(`/app/clients/${post.clientId}/calendar`);
  revalidatePath(`/app/clients/${post.clientId}`);
  return updated;
}

export async function updatePostStatus(postId: string, status: string) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();

  // Récupérer le post pour vérifier l'accès
  const post = await getPostById(postId, workspace.id);
  if (!post) {
    throw new Error("Post non trouvé ou accès refusé");
  }

  // Validation
  const validated = updatePostStatusSchema.parse({ id: postId, status });

  // Mettre à jour le statut
  const [updated] = await db
    .update(posts)
    .set({
      status: validated.status as any,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))
    .returning();

  revalidatePath(`/app/clients/${post.clientId}/posts`);
  revalidatePath(`/app/clients/${post.clientId}/posts/${postId}`);
  revalidatePath(`/app/clients/${post.clientId}/calendar`);
  revalidatePath(`/app/clients/${post.clientId}`);
  return updated;
}

/**
 * Supprime définitivement un post (hard delete)
 * Pour un soft delete, utilisez updatePostStatus avec status='cancelled'
 */
export async function deletePost(postId: string) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();

  // Récupérer le post pour vérifier l'accès
  const post = await getPostById(postId, workspace.id);
  if (!post) {
    throw new Error("Post non trouvé ou accès refusé");
  }

  const clientId = post.clientId;

  // Supprimer (cascade supprimera aussi les assets)
  await db.delete(posts).where(eq(posts.id, postId));

  revalidatePath(`/app/clients/${clientId}/posts`);
  revalidatePath(`/app/clients/${clientId}/calendar`);
  revalidatePath(`/app/clients/${clientId}`);
}

/**
 * Récupère un résumé des posts pour l'overview client
 */
export async function getClientPostOverview(clientId: string, workspaceId: string) {
  await requireAuth();

  await verifyClientAccess(clientId, workspaceId);

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Posts programmés cette semaine
  const scheduledThisWeek = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.clientId, clientId),
        eq(posts.status, "scheduled"),
        gte(posts.scheduledAt, now),
        lte(posts.scheduledAt, weekFromNow)
      )
    );

  // Prochain post à venir
  const [nextPost] = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.clientId, clientId),
        eq(posts.status, "scheduled"),
        gte(posts.scheduledAt, now)
      )
    )
    .orderBy(posts.scheduledAt)
    .limit(1);

  return {
    scheduledThisWeek: scheduledThisWeek.length,
    nextPost: nextPost || null,
  };
}

