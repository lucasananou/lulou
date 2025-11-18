import { z } from "zod";

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const upsertBrandProfileSchema = z.object({
  clientId: z.string().uuid("L'ID du client est requis"),
  toneOfVoice: z
    .string()
    .min(10, "Le ton de voix doit contenir au moins 10 caractères")
    .optional()
    .or(z.literal("")),
  brandColors: z
    .array(z.string().regex(hexColorRegex, "Format hex invalide (ex: #000000)"))
    .optional()
    .default([]),
  audience: z.string().optional().or(z.literal("")),
  do: z.string().optional().or(z.literal("")),
  dont: z.string().optional().or(z.literal("")),
  examples: z.string().optional().or(z.literal("")),
});

export type UpsertBrandProfileInput = z.infer<typeof upsertBrandProfileSchema>;

