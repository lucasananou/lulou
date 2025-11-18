import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { workspaces, workspaceMembers } from "./db/schema";
import { eq, and } from "drizzle-orm";

export async function getCurrentUser() {
  const user = await currentUser();
  return user;
}

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function getCurrentWorkspace() {
  const userId = await requireAuth();
  
  // Récupère le premier workspace auquel l'utilisateur appartient
  const member = await db
    .select({
      workspace: workspaces,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!member) {
    throw new Error("No workspace found for user");
  }

  return member.workspace;
}

export async function requireWorkspaceMember(role?: "owner" | "admin" | "member") {
  const userId = await requireAuth();
  const workspace = await getCurrentWorkspace();

  const member = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspace.id),
        eq(workspaceMembers.userId, userId)
      )
    )
    .limit(1)
    .then((rows) => rows[0]);

  if (!member) {
    throw new Error("User is not a member of this workspace");
  }

  if (role && member.role !== role && member.role !== "owner") {
    if (role === "admin" && member.role !== "admin") {
      throw new Error("Insufficient permissions");
    }
  }

  return { workspace, member };
}

