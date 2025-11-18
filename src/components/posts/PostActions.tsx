"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePostStatus, deletePost } from "@/modules/posts/actions";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  to_approve: "À valider",
  approved: "Validé",
  scheduled: "Programmé",
  published: "Publié",
  cancelled: "Annulé",
};

interface PostActionsProps {
  postId: string;
  currentStatus: string;
  clientId: string;
}

export function PostActions({
  postId,
  currentStatus,
  clientId,
}: PostActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updatePostStatus(postId, newStatus);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) {
      return;
    }

    try {
      await deletePost(postId);
      router.push(`/app/clients/${clientId}/posts`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Changer le statut</label>
        <Select
          value={currentStatus}
          onValueChange={handleStatusChange}
          disabled={isUpdating}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="destructive"
        onClick={handleDelete}
        className="w-full"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Supprimer le post
      </Button>
    </div>
  );
}

