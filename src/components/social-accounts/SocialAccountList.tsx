"use client";

import { useState } from "react";
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
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { type socialAccounts } from "@/lib/db/schema";
import { type SocialPlatform } from "@/contracts/social-accounts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SocialAccountForm } from "./SocialAccountForm";
import { updateSocialAccount, deleteSocialAccount, createSocialAccount } from "@/modules/social-accounts/actions";
import { type CreateSocialAccountInput } from "@/contracts/social-accounts";

type SocialAccount = typeof socialAccounts.$inferSelect;

const platformLabels: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Autre",
};

const platformColors: Record<SocialPlatform, "default" | "secondary" | "outline"> = {
  instagram: "default",
  facebook: "default",
  linkedin: "default",
  tiktok: "default",
  youtube: "default",
  other: "secondary",
};

interface SocialAccountListProps {
  clientId: string;
  accounts: SocialAccount[];
}

export function SocialAccountList({ clientId, accounts }: SocialAccountListProps) {
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce compte social ?")) {
      return;
    }

    try {
      await deleteSocialAccount(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  };

  const handleEdit = (account: SocialAccount) => {
    setEditingAccount(account);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: CreateSocialAccountInput) => {
    if (!editingAccount) return;
    const { clientId, ...updateData } = data;
    await updateSocialAccount(editingAccount.id, updateData);
    setIsEditDialogOpen(false);
    setEditingAccount(null);
  };

  if (accounts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground mb-4">
          Aucun compte social configuré pour ce client
        </p>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Ajouter un compte social</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un compte social</DialogTitle>
              <DialogDescription>
                Configurez un nouveau compte social pour ce client
              </DialogDescription>
            </DialogHeader>
            <SocialAccountForm
              clientId={clientId}
              onSubmit={createSocialAccount}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Comptes sociaux</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Ajouter un compte social</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un compte social</DialogTitle>
              <DialogDescription>
                Configurez un nouveau compte social pour ce client
              </DialogDescription>
            </DialogHeader>
            <SocialAccountForm
              clientId={clientId}
              onSubmit={createSocialAccount}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plateforme</TableHead>
              <TableHead>Handle</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>
                  <Badge variant={platformColors[account.platform]}>
                    {platformLabels[account.platform]}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {account.handle}
                </TableCell>
                <TableCell>
                  {account.url ? (
                    <a
                      href={account.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <span className="truncate max-w-[200px]">{account.url}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={account.isActive ? "default" : "secondary"}>
                    {account.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(account)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingAccount && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le compte social</DialogTitle>
              <DialogDescription>
                Modifiez les informations du compte social
              </DialogDescription>
            </DialogHeader>
            <SocialAccountForm
              clientId={clientId}
              onSubmit={async (data) => {
                await handleUpdate(data);
              }}
              defaultValues={editingAccount}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingAccount(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

