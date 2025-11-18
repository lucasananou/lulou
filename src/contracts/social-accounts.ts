import { z } from "zod";

export const socialPlatformSchema = z.enum([
  "instagram",
  "facebook",
  "linkedin",
  "tiktok",
  "youtube",
  "other",
]);

export const createSocialAccountSchema = z.object({
  clientId: z.string().uuid("L'ID du client est requis"),
  platform: socialPlatformSchema,
  handle: z.string().min(1, "Le handle est requis"),
  url: z.string().url("URL invalide").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const updateSocialAccountSchema = createSocialAccountSchema
  .partial()
  .extend({
    id: z.string().uuid(),
  })
  .omit({ clientId: true }); // clientId ne peut pas être modifié

export type CreateSocialAccountInput = z.infer<typeof createSocialAccountSchema>;
export type UpdateSocialAccountInput = z.infer<typeof updateSocialAccountSchema>;
export type SocialPlatform = z.infer<typeof socialPlatformSchema>;

