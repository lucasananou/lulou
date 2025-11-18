import { z } from "zod";

export const reportMetricsSchema = z.record(
  z.string(),
  z.union([z.string(), z.number()])
);

export const upsertReportSchema = z.object({
  clientId: z.string().uuid("L'ID du client est requis"),
  month: z.number().min(1).max(12, "Le mois doit être entre 1 et 12"),
  year: z.number().min(2020).max(2100, "L'année doit être valide"),
  title: z.string().min(1, "Le titre est requis"),
  summary: z.string().optional().or(z.literal("")),
  metrics: reportMetricsSchema.optional().nullable(),
});

export type UpsertReportInput = z.infer<typeof upsertReportSchema>;
export type ReportMetrics = z.infer<typeof reportMetricsSchema>;

