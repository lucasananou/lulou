import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  industry: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  status: z.enum(["active", "paused", "archived"]).default("active"),
  notes: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

