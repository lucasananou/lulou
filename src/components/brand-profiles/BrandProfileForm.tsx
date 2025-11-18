"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  upsertBrandProfileSchema,
  type UpsertBrandProfileInput,
} from "@/contracts/brand-profiles";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type brandProfiles } from "@/lib/db/schema";
import { X } from "lucide-react";

type BrandProfile = typeof brandProfiles.$inferSelect;

interface BrandProfileFormProps {
  clientId: string;
  onSubmit: (data: UpsertBrandProfileInput) => Promise<void>;
  defaultValues?: BrandProfile | null;
  onCancel?: () => void;
}

export function BrandProfileForm({
  clientId,
  onSubmit,
  defaultValues,
  onCancel,
}: BrandProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [colorInput, setColorInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpsertBrandProfileInput>({
    resolver: zodResolver(upsertBrandProfileSchema),
    defaultValues: {
      clientId,
      toneOfVoice: defaultValues?.toneOfVoice || "",
      brandColors: (defaultValues?.brandColors as string[]) || [],
      audience: defaultValues?.audience || "",
      do: defaultValues?.do || "",
      dont: defaultValues?.dont || "",
      examples: defaultValues?.examples || "",
    },
  });

  const brandColors = watch("brandColors") || [];

  const addColor = () => {
    const trimmed = colorInput.trim();
    if (trimmed && /^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
      const current = brandColors || [];
      if (!current.includes(trimmed)) {
        setValue("brandColors", [...current, trimmed]);
        setColorInput("");
      }
    }
  };

  const removeColor = (color: string) => {
    const current = brandColors || [];
    setValue(
      "brandColors",
      current.filter((c) => c !== color)
    );
  };

  const onSubmitForm = async (data: UpsertBrandProfileInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
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
      <div className="space-y-2">
        <Label htmlFor="toneOfVoice">
          Ton de voix
        </Label>
        <Textarea
          id="toneOfVoice"
          {...register("toneOfVoice")}
          placeholder="Décrivez le ton de voix de la marque (tutoiement/vouvoiement, sérieux, fun, professionnel, etc.)"
          rows={4}
        />
        {errors.toneOfVoice && (
          <p className="text-sm text-destructive">{errors.toneOfVoice.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="audience">Audience / Cible</Label>
        <Textarea
          id="audience"
          {...register("audience")}
          placeholder="Décrivez la cible de la marque (âge, centres d'intérêt, besoins, etc.)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Couleurs de la marque</Label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="#000000"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addColor();
              }
            }}
            pattern="^#[0-9A-Fa-f]{6}$"
          />
          <Button type="button" variant="outline" onClick={addColor}>
            Ajouter
          </Button>
        </div>
        {errors.brandColors && (
          <p className="text-sm text-destructive">{errors.brandColors.message}</p>
        )}
        {brandColors.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {brandColors.map((color) => (
              <div
                key={color}
                className="flex items-center gap-2 rounded-lg border px-3 py-2"
              >
                <div
                  className="h-6 w-6 rounded border"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-mono">{color}</span>
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="do">À faire</Label>
        <Textarea
          id="do"
          {...register("do")}
          placeholder="Listez les bonnes pratiques de communication, les choses à faire..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dont">À éviter</Label>
        <Textarea
          id="dont"
          {...register("dont")}
          placeholder="Listez les choses à éviter, les pièges à ne pas tomber..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="examples">Exemples</Label>
        <Textarea
          id="examples"
          {...register("examples")}
          placeholder="Exemples de posts, tournures de phrases, phrases types, etc."
          rows={5}
        />
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

