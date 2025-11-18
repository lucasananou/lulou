"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createSocialAccountSchema,
  type CreateSocialAccountInput,
  type SocialPlatform,
} from "@/contracts/social-accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type socialAccounts } from "@/lib/db/schema";

type SocialAccount = typeof socialAccounts.$inferSelect;

const platformLabels: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Autre",
};

interface SocialAccountFormProps {
  clientId: string;
  onSubmit: (data: CreateSocialAccountInput) => Promise<unknown>;
  defaultValues?: Partial<SocialAccount>;
  onCancel?: () => void;
}

export function SocialAccountForm({
  clientId,
  onSubmit,
  defaultValues,
  onCancel,
}: SocialAccountFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateSocialAccountInput>({
    resolver: zodResolver(createSocialAccountSchema),
    defaultValues: {
      clientId,
      platform: defaultValues?.platform || "instagram",
      handle: defaultValues?.handle || "",
      url: defaultValues?.url || "",
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const platform = watch("platform");
  const isActive = watch("isActive");

  const onSubmitForm = async (data: CreateSocialAccountInput) => {
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
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="platform">
          Plateforme <span className="text-destructive">*</span>
        </Label>
        <Select
          value={platform}
          onValueChange={(value) =>
            setValue("platform", value as SocialPlatform)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une plateforme" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(platformLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.platform && (
          <p className="text-sm text-destructive">{errors.platform.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="handle">
          Handle / Username <span className="text-destructive">*</span>
        </Label>
        <Input
          id="handle"
          {...register("handle")}
          placeholder="@username ou identifiant"
        />
        {errors.handle && (
          <p className="text-sm text-destructive">{errors.handle.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL du profil</Label>
        <Input
          id="url"
          type="url"
          {...register("url")}
          placeholder="https://..."
        />
        {errors.url && (
          <p className="text-sm text-destructive">{errors.url.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="isActive">Compte actif</Label>
          <p className="text-sm text-muted-foreground">
            Désactiver pour masquer temporairement ce compte
          </p>
        </div>
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) => setValue("isActive", checked)}
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

