"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPostSchema,
  type CreatePostInput,
  type SocialPlatform,
} from "@/contracts/posts";
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
import { type posts } from "@/lib/db/schema";
import { X } from "lucide-react";

type Post = typeof posts.$inferSelect;

const platformLabels: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Autre",
};

interface PostFormProps {
  clientId: string;
  onSubmit: (data: CreatePostInput) => Promise<void>;
  defaultValues?: Partial<Post>;
  onCancel?: () => void;
}

export function PostForm({
  clientId,
  onSubmit,
  defaultValues,
  onCancel,
}: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      clientId,
      platform: (defaultValues?.platform as SocialPlatform) || "instagram",
      title: defaultValues?.title || "",
      body: defaultValues?.body || "",
      tags: (defaultValues?.tags as string[]) || [],
      scheduledAt: defaultValues?.scheduledAt
        ? new Date(defaultValues.scheduledAt).toISOString().slice(0, 16)
        : "",
    },
  });

  const platform = watch("platform");
  const tags = watch("tags") || [];

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setValue("tags", [...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tag)
    );
  };

  const onSubmitForm = async (data: CreatePostInput) => {
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
      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="scheduledAt">Date et heure de publication</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            {...register("scheduledAt")}
          />
          {errors.scheduledAt && (
            <p className="text-sm text-destructive">
              {errors.scheduledAt.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          Titre interne <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Ex: Promo -20% Octobre"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">
          Contenu du post <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="body"
          {...register("body")}
          placeholder="Rédigez le contenu du post..."
          rows={8}
        />
        {errors.body && (
          <p className="text-sm text-destructive">{errors.body.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ajouter un tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Ajouter
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
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

