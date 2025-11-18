"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { type PostStatus, type SocialPlatform } from "@/contracts/posts";

const platformLabels: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Autre",
};

const statusLabels: Record<PostStatus, string> = {
  draft: "Brouillon",
  to_approve: "À valider",
  approved: "Validé",
  scheduled: "Programmé",
  published: "Publié",
  cancelled: "Annulé",
};

interface PostFiltersProps {
  status?: string[];
  platform?: string[];
  onStatusChange: (status: string[]) => void;
  onPlatformChange: (platform: string[]) => void;
  onClear: () => void;
}

export function PostFilters({
  status = [],
  platform = [],
  onStatusChange,
  onPlatformChange,
  onClear,
}: PostFiltersProps) {
  const hasFilters = status.length > 0 || platform.length > 0;

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-2">
        <Label>Statut</Label>
        <Select
          value={status[0] || "all"}
          onValueChange={(value) => {
            if (value === "all") {
              onStatusChange([]);
            } else {
              onStatusChange([value]);
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Plateforme</Label>
        <Select
          value={platform[0] || "all"}
          onValueChange={(value) => {
            if (value === "all") {
              onPlatformChange([]);
            } else {
              onPlatformChange([value]);
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Toutes les plateformes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les plateformes</SelectItem>
            {Object.entries(platformLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="outline" onClick={onClear}>
          <X className="mr-2 h-4 w-4" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
}

