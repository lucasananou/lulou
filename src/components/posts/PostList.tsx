"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PostStatusBadge } from "./PostStatusBadge";
import { Plus, Calendar } from "lucide-react";
import { type posts } from "@/lib/db/schema";
import { type SocialPlatform } from "@/contracts/posts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Post = typeof posts.$inferSelect;

const platformLabels: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Autre",
};

interface PostListProps {
  clientId: string;
  posts: Post[];
}

export function PostList({ clientId, posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground mb-4">Aucun post pour ce client</p>
        <Link href={`/app/clients/${clientId}/posts/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Créer un post
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Plateforme</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                {post.scheduledAt ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(post.scheduledAt), "dd MMM yyyy HH:mm", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {platformLabels[post.platform as SocialPlatform] ||
                    post.platform}
                </Badge>
              </TableCell>
              <TableCell>
                <Link
                  href={`/app/clients/${clientId}/posts/${post.id}`}
                  className="font-medium hover:underline"
                >
                  {post.title}
                </Link>
              </TableCell>
              <TableCell>
                <PostStatusBadge status={post.status as any} />
              </TableCell>
              <TableCell>
                {post.tags && (post.tags as string[]).length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {(post.tags as string[]).slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {(post.tags as string[]).length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{(post.tags as string[]).length - 3}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

