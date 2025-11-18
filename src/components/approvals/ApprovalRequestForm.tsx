"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createApprovalRequestSchema,
  type CreateApprovalRequestInput,
} from "@/contracts/approvals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { type posts } from "@/lib/db/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Post = typeof posts.$inferSelect;

const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Autre",
};

interface ApprovalRequestFormProps {
  clientId: string;
  availablePosts: Post[];
  onSubmit: (data: CreateApprovalRequestInput) => Promise<unknown>;
}

export function ApprovalRequestForm({
  clientId,
  availablePosts,
  onSubmit,
}: ApprovalRequestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateApprovalRequestInput>({
    resolver: zodResolver(createApprovalRequestSchema),
    defaultValues: {
      clientId,
      title: "",
      postIds: [],
      expiresAt: undefined,
    },
  });

  const togglePost = (postId: string) => {
    setSelectedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const onSubmitForm = async (data: CreateApprovalRequestInput) => {
    if (selectedPostIds.length === 0) {
      alert("Veuillez sélectionner au moins un post");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        postIds: selectedPostIds,
      });
      router.push(`/app/clients/${clientId}/approvals`);
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (availablePosts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          Aucun post disponible pour l'approbation. Les posts doivent être en
          statut "draft", "to_approve" ou "scheduled" et ne pas être déjà dans
          une demande d'approbation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Titre de la demande <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Ex: Validation posts – Avril 2026"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Date d'expiration (optionnel)</Label>
        <Input
          id="expiresAt"
          type="datetime-local"
          {...register("expiresAt")}
        />
      </div>

      <div className="space-y-4">
        <Label>
          Posts à inclure <span className="text-destructive">*</span>
        </Label>
        <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-lg p-4">
          {availablePosts.map((post) => (
            <Card
              key={post.id}
              className={`cursor-pointer transition-colors ${
                selectedPostIds.includes(post.id)
                  ? "border-primary bg-primary/5"
                  : ""
              }`}
              onClick={() => togglePost(post.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedPostIds.includes(post.id)}
                    onCheckedChange={() => togglePost(post.id)}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {platformLabels[post.platform] || post.platform}
                      </Badge>
                      <span className="font-medium">{post.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.body}
                    </p>
                    {post.scheduledAt && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(post.scheduledAt), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {errors.postIds && (
          <p className="text-sm text-destructive">{errors.postIds.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {selectedPostIds.length} post(s) sélectionné(s)
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting || selectedPostIds.length === 0}>
          {isSubmitting ? "Création..." : "Créer la demande"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}

