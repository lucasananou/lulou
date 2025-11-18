import { z } from "zod";

export const socialPlatformSchema = z.enum([
  "instagram",
  "facebook",
  "linkedin",
  "tiktok",
  "youtube",
  "other",
]);

export const postStatusSchema = z.enum([
  "draft",
  "to_approve",
  "approved",
  "scheduled",
  "published",
  "cancelled",
]);

export const createPostSchema = z.object({
  clientId: z.string().uuid("L'ID du client est requis"),
  platform: socialPlatformSchema,
  title: z.string().min(1, "Le titre est requis"),
  body: z.string().min(10, "Le contenu doit contenir au moins 10 caractères"),
  tags: z.array(z.string()).optional().default([]),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().uuid(),
});

export const updatePostStatusSchema = z.object({
  id: z.string().uuid(),
  status: postStatusSchema,
});

export const schedulePostSchema = z.object({
  id: z.string().uuid(),
  scheduledAt: z.string().datetime(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type UpdatePostStatusInput = z.infer<typeof updatePostStatusSchema>;
export type SchedulePostInput = z.infer<typeof schedulePostSchema>;
export type SocialPlatform = z.infer<typeof socialPlatformSchema>;
export type PostStatus = z.infer<typeof postStatusSchema>;

