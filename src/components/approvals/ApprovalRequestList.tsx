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
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";
import { Plus, Eye, Send, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { type approvalRequests } from "@/lib/db/schema";

type ApprovalRequest = typeof approvalRequests.$inferSelect & {
  itemsCount: number;
};

interface ApprovalRequestListProps {
  clientId: string;
  requests: ApprovalRequest[];
}

export function ApprovalRequestList({
  clientId,
  requests,
}: ApprovalRequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground mb-4">
          Aucune demande d'approbation pour ce client
        </p>
        <Link href={`/app/clients/${clientId}/approvals/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Créer une demande
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
            <TableHead>Titre</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Posts</TableHead>
            <TableHead>Date d'envoi</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.title}</TableCell>
              <TableCell>
                <ApprovalStatusBadge status={request.status as any} />
              </TableCell>
              <TableCell>{request.itemsCount} post(s)</TableCell>
              <TableCell>
                {request.sentAt ? (
                  <span className="text-sm">
                    {format(new Date(request.sentAt), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/app/clients/${clientId}/approvals/${request.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

