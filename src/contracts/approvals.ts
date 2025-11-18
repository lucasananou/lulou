import { z } from "zod";

export const approvalRequestStatusSchema = z.enum([
  "draft",
  "sent",
  "partially_approved",
  "approved",
  "closed",
]);

export const approvalItemStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);

export const createApprovalRequestSchema = z.object({
  clientId: z.string().uuid("L'ID du client est requis"),
  title: z.string().min(1, "Le titre est requis"),
  postIds: z
    .array(z.string().uuid("ID de post invalide"))
    .min(1, "Au moins un post doit être sélectionné"),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const updateApprovalItemSchema = z.object({
  itemId: z.string().uuid(),
  status: approvalItemStatusSchema,
  clientComment: z.string().optional().nullable(),
});

export type CreateApprovalRequestInput = z.infer<
  typeof createApprovalRequestSchema
>;
export type UpdateApprovalItemInput = z.infer<typeof updateApprovalItemSchema>;
export type ApprovalRequestStatus = z.infer<
  typeof approvalRequestStatusSchema
>;
export type ApprovalItemStatus = z.infer<typeof approvalItemStatusSchema>;

