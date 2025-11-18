"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Send, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PostStatusBadge } from "@/components/posts/PostStatusBadge";

const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Autre",
};

const itemStatusLabels: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Refusé",
};

const itemStatusVariants: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

interface ApprovalRequestDetailProps {
  request: any;
  clientId: string;
  onSend: (id: string) => Promise<any>;
  onClose: (id: string) => Promise<void>;
}

export function ApprovalRequestDetail({
  request,
  clientId,
  onSend,
  onClose,
}: ApprovalRequestDetailProps) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(request.publicUrl);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const result = await onSend(request.id);
      setPublicUrl(result.publicUrl);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de l'envoi");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = async () => {
    if (!confirm("Êtes-vous sûr de vouloir fermer cette demande ?")) {
      return;
    }

    setIsClosing(true);
    try {
      await onClose(request.id);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de la fermeture");
    } finally {
      setIsClosing(false);
    }
  };

  const copyToClipboard = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Informations</CardTitle>
              <CardDescription>Détails de la demande d'approbation</CardDescription>
            </div>
            <ApprovalStatusBadge status={request.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Statut
            </Label>
            <p className="text-sm">{request.status}</p>
          </div>
          {request.sentAt && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Date d'envoi
              </Label>
              <p className="text-sm">
                {format(new Date(request.sentAt), "dd MMMM yyyy à HH:mm", {
                  locale: fr,
                })}
              </p>
            </div>
          )}
          {request.expiresAt && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Date d'expiration
              </Label>
              <p className="text-sm">
                {format(new Date(request.expiresAt), "dd MMMM yyyy à HH:mm", {
                  locale: fr,
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {publicUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Lien public</CardTitle>
            <CardDescription>
              Partagez ce lien avec le client pour qu'il puisse valider les posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={publicUrl} readOnly />
              <Button
                variant="outline"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copier
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Posts ({request.items.length})</CardTitle>
            <div className="flex gap-2">
              {request.status === "draft" && (
                <Button onClick={handleSend} disabled={isSending}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSending ? "Envoi..." : "Envoyer au client"}
                </Button>
              )}
              {(request.status === "partially_approved" ||
                request.status === "approved") && (
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isClosing}
                >
                  <X className="mr-2 h-4 w-4" />
                  {isClosing ? "Fermeture..." : "Clore la demande"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {request.items.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {platformLabels[item.post.platform] ||
                            item.post.platform}
                        </Badge>
                        <span className="font-medium">{item.post.title}</span>
                        <PostStatusBadge status={item.post.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.post.body}
                      </p>
                      {item.post.scheduledAt && (
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(item.post.scheduledAt),
                            "dd MMM yyyy",
                            { locale: fr }
                          )}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            itemStatusVariants[item.status] || "secondary"
                          }
                        >
                          {itemStatusLabels[item.status] || item.status}
                        </Badge>
                        {item.clientComment && (
                          <p className="text-sm text-muted-foreground">
                            Commentaire: {item.clientComment}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

