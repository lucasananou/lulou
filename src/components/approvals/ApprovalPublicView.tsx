"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Send } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { type UpdateApprovalItemInput } from "@/contracts/approvals";

const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Autre",
};

interface ApprovalPublicViewProps {
  request: any;
  onUpdateItem: (input: UpdateApprovalItemInput) => Promise<any>;
}

export function ApprovalPublicView({
  request,
  onUpdateItem,
}: ApprovalPublicViewProps) {
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleItemUpdate = async (
    itemId: string,
    status: "approved" | "rejected"
  ) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      await onUpdateItem({
        itemId,
        status,
        clientComment: comments[itemId] || null,
      });
      setSubmitted(true);
      // Recharger la page après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const allItemsProcessed = request.items.every(
    (item: any) => item.status !== "pending"
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{request.title}</CardTitle>
          <CardDescription>
            Veuillez valider ou refuser les posts ci-dessous
          </CardDescription>
        </CardHeader>
        {request.expiresAt && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Date d'expiration:{" "}
              {format(new Date(request.expiresAt), "dd MMMM yyyy", {
                locale: fr,
              })}
            </p>
          </CardContent>
        )}
      </Card>

      {submitted && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="p-4">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✓ Vos retours ont été enregistrés avec succès !
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {request.items.map((item: any) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {platformLabels[item.post.platform] || item.post.platform}
                  </Badge>
                  <CardTitle className="text-lg">{item.post.title}</CardTitle>
                </div>
                {item.status === "approved" && (
                  <Badge className="bg-green-500">
                    <Check className="mr-1 h-3 w-3" />
                    Approuvé
                  </Badge>
                )}
                {item.status === "rejected" && (
                  <Badge variant="destructive">
                    <X className="mr-1 h-3 w-3" />
                    Refusé
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.post.scheduledAt && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Date de publication prévue
                  </Label>
                  <p className="text-sm">
                    {format(new Date(item.post.scheduledAt), "dd MMMM yyyy à HH:mm", {
                      locale: fr,
                    })}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Contenu
                </Label>
                <p className="text-sm whitespace-pre-wrap mt-1">
                  {item.post.body}
                </p>
              </div>

              {item.status === "pending" && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label htmlFor={`comment-${item.id}`}>
                      Commentaire (optionnel, recommandé si refus)
                    </Label>
                    <Textarea
                      id={`comment-${item.id}`}
                      placeholder="Ajoutez un commentaire..."
                      value={comments[item.id] || ""}
                      onChange={(e) =>
                        setComments((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleItemUpdate(item.id, "approved")}
                      disabled={updatingItems.has(item.id)}
                      className="flex-1"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {updatingItems.has(item.id) ? "Enregistrement..." : "Valider"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleItemUpdate(item.id, "rejected")}
                      disabled={updatingItems.has(item.id)}
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      {updatingItems.has(item.id) ? "Enregistrement..." : "Refuser"}
                    </Button>
                  </div>
                </div>
              )}

              {item.status !== "pending" && item.clientComment && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Votre commentaire
                  </Label>
                  <p className="text-sm mt-1">{item.clientComment}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {allItemsProcessed && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              ✓ Tous les posts ont été traités. Merci pour votre retour !
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}

