"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  upsertReportSchema,
  type UpsertReportInput,
} from "@/contracts/reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type reports } from "@/lib/db/schema";

type Report = typeof reports.$inferSelect;

const monthLabels: Record<number, string> = {
  1: "Janvier",
  2: "Février",
  3: "Mars",
  4: "Avril",
  5: "Mai",
  6: "Juin",
  7: "Juillet",
  8: "Août",
  9: "Septembre",
  10: "Octobre",
  11: "Novembre",
  12: "Décembre",
};

interface ReportFormProps {
  clientId: string;
  onSubmit: (data: UpsertReportInput) => Promise<void>;
  defaultValues?: Partial<Report>;
  onCancel?: () => void;
}

export function ReportForm({
  clientId,
  onSubmit,
  defaultValues,
  onCancel,
}: ReportFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpsertReportInput>({
    resolver: zodResolver(upsertReportSchema),
    defaultValues: {
      clientId,
      month: defaultValues?.month || currentMonth,
      year: defaultValues?.year || currentYear,
      title: defaultValues?.title || "",
      summary: defaultValues?.summary || "",
      metrics: (defaultValues?.metrics as Record<string, string | number>) || {
        followers_start: "",
        followers_end: "",
        posts_published: "",
        engagement_rate: "",
      },
    },
  });

  const month = watch("month");
  const year = watch("year");
  const metrics = watch("metrics") || {};

  const onSubmitForm = async (data: UpsertReportInput) => {
    setIsSubmitting(true);
    try {
      // Nettoyer les métriques (enlever les champs vides)
      const cleanedMetrics: Record<string, string | number> = {};
      Object.entries(data.metrics || {}).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          // Convertir en nombre si possible
          if (typeof value === "string" && !isNaN(Number(value)) && value.trim() !== "") {
            cleanedMetrics[key] = Number(value);
          } else if (value !== "") {
            cleanedMetrics[key] = value;
          }
        }
      });

      await onSubmit({
        ...data,
        metrics: Object.keys(cleanedMetrics).length > 0 ? cleanedMetrics : null,
      });
      router.refresh();
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="month">
            Mois <span className="text-destructive">*</span>
          </Label>
          <Select
            value={String(month)}
            onValueChange={(value) => setValue("month", Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un mois" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(monthLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.month && (
            <p className="text-sm text-destructive">{errors.month.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">
            Année <span className="text-destructive">*</span>
          </Label>
          <Input
            id="year"
            type="number"
            {...register("year", { valueAsNumber: true })}
            min="2020"
            max="2100"
          />
          {errors.year && (
            <p className="text-sm text-destructive">{errors.year.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          Titre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Ex: Rapport Avril 2026"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Résumé</Label>
        <Textarea
          id="summary"
          {...register("summary")}
          placeholder="Résumé du rapport mensuel..."
          rows={4}
        />
      </div>

      <div className="space-y-4">
        <Label>Métriques</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="followers_start" className="text-sm">
              Followers début
            </Label>
            <Input
              id="followers_start"
              type="number"
              value={metrics.followers_start || ""}
              onChange={(e) =>
                setValue("metrics", {
                  ...metrics,
                  followers_start: e.target.value ? Number(e.target.value) : "",
                })
              }
              placeholder="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followers_end" className="text-sm">
              Followers fin
            </Label>
            <Input
              id="followers_end"
              type="number"
              value={metrics.followers_end || ""}
              onChange={(e) =>
                setValue("metrics", {
                  ...metrics,
                  followers_end: e.target.value ? Number(e.target.value) : "",
                })
              }
              placeholder="1120"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="posts_published" className="text-sm">
              Posts publiés
            </Label>
            <Input
              id="posts_published"
              type="number"
              value={metrics.posts_published || ""}
              onChange={(e) =>
                setValue("metrics", {
                  ...metrics,
                  posts_published: e.target.value ? Number(e.target.value) : "",
                })
              }
              placeholder="18"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="engagement_rate" className="text-sm">
              Taux d'engagement (%)
            </Label>
            <Input
              id="engagement_rate"
              type="number"
              step="0.1"
              value={metrics.engagement_rate || ""}
              onChange={(e) =>
                setValue("metrics", {
                  ...metrics,
                  engagement_rate: e.target.value ? Number(e.target.value) : "",
                })
              }
              placeholder="3.2"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Les métriques sont optionnelles et peuvent être complétées plus tard
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
}

