"use server";

import { db } from "@/lib/db";
import { reports, clients } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentWorkspace, requireAuth } from "@/lib/auth";
import {
  upsertReportSchema,
  type UpsertReportInput,
} from "@/contracts/reports";
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

export async function upsertReport(input: UpsertReportInput) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();

  // Validation
  const validated = upsertReportSchema.parse(input);

  // Vérifier que le client appartient au workspace
  await verifyClientAccess(validated.clientId, workspace.id);

  // Vérifier si un rapport existe déjà pour ce client/mois/année
  const [existing] = await db
    .select()
    .from(reports)
    .where(
      and(
        eq(reports.clientId, validated.clientId),
        eq(reports.year, validated.year),
        eq(reports.month, validated.month)
      )
    )
    .limit(1);

  if (existing) {
    // Mise à jour
    const [updated] = await db
      .update(reports)
      .set({
        title: validated.title,
        summary: validated.summary || null,
        metrics: validated.metrics || null,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, existing.id))
      .returning();

    revalidatePath(`/app/clients/${validated.clientId}/reports`);
    revalidatePath(`/app/reports`);
    revalidatePath(`/app/reports/${updated.id}`);
    revalidatePath(`/app/clients/${validated.clientId}`);
    return updated;
  } else {
    // Création
    const [created] = await db
      .insert(reports)
      .values({
        clientId: validated.clientId,
        month: validated.month,
        year: validated.year,
        title: validated.title,
        summary: validated.summary || null,
        metrics: validated.metrics || null,
      })
      .returning();

    revalidatePath(`/app/clients/${validated.clientId}/reports`);
    revalidatePath(`/app/reports`);
    revalidatePath(`/app/reports/${created.id}`);
    revalidatePath(`/app/clients/${validated.clientId}`);
    return created;
  }
}

export async function listReportsByClient(
  clientId: string,
  workspaceId: string
) {
  await requireAuth();

  await verifyClientAccess(clientId, workspaceId);

  const reportsList = await db
    .select()
    .from(reports)
    .where(eq(reports.clientId, clientId))
    .orderBy(desc(reports.year), desc(reports.month));

  return reportsList;
}

export async function listReportsByWorkspace(workspaceId: string) {
  await requireAuth();

  const reportsList = await db
    .select({
      report: reports,
      client: clients,
    })
    .from(reports)
    .innerJoin(clients, eq(reports.clientId, clients.id))
    .where(eq(clients.workspaceId, workspaceId))
    .orderBy(desc(reports.year), desc(reports.month));

  return reportsList.map(({ report, client }) => ({
    ...report,
    client,
  }));
}

export async function getReportById(reportId: string, workspaceId: string) {
  await requireAuth();

  const [result] = await db
    .select({
      report: reports,
      client: clients,
    })
    .from(reports)
    .innerJoin(clients, eq(reports.clientId, clients.id))
    .where(
      and(
        eq(reports.id, reportId),
        eq(clients.workspaceId, workspaceId)
      )
    )
    .limit(1);

  if (!result) {
    return null;
  }

  return {
    ...result.report,
    client: result.client,
  };
}

export async function deleteReport(reportId: string) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();

  // Récupérer le rapport pour vérifier l'accès
  const report = await getReportById(reportId, workspace.id);
  if (!report) {
    throw new Error("Rapport non trouvé ou accès refusé");
  }

  const clientId = report.clientId;

  // Supprimer
  await db.delete(reports).where(eq(reports.id, reportId));

  revalidatePath(`/app/clients/${clientId}/reports`);
  revalidatePath(`/app/reports`);
  revalidatePath(`/app/clients/${clientId}`);
}

