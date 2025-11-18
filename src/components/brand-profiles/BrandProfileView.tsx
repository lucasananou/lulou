"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandProfileForm } from "./BrandProfileForm";
import { upsertBrandProfile } from "@/modules/brand-profiles/actions";
import { type brandProfiles } from "@/lib/db/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type BrandProfile = typeof brandProfiles.$inferSelect;

interface BrandProfileViewProps {
  brandProfile: BrandProfile;
  clientId: string;
}

export function BrandProfileView({
  brandProfile,
  clientId,
}: BrandProfileViewProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const brandColors = (brandProfile.brandColors as string[]) || [];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profil de marque</CardTitle>
              <CardDescription>
                Références éditoriales pour ce client
              </CardDescription>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button>Modifier le profil</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Modifier le profil de marque</DialogTitle>
                  <DialogDescription>
                    Mettez à jour les références éditoriales
                  </DialogDescription>
                </DialogHeader>
                <BrandProfileForm
                  clientId={clientId}
                  onSubmit={upsertBrandProfile}
                  defaultValues={brandProfile}
                  onCancel={() => setIsEditDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {brandProfile.toneOfVoice && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Ton de voix</h3>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {brandProfile.toneOfVoice}
              </p>
            </div>
          )}

          {brandProfile.audience && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Audience / Cible</h3>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {brandProfile.audience}
              </p>
            </div>
          )}

          {brandColors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Couleurs de la marque</h3>
              <div className="flex flex-wrap gap-2">
                {brandColors.map((color) => (
                  <div
                    key={color}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    <div
                      className="h-6 w-6 rounded border"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-mono">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {brandProfile.do && (
            <div>
              <h3 className="text-sm font-semibold mb-2">À faire</h3>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {brandProfile.do}
              </p>
            </div>
          )}

          {brandProfile.dont && (
            <div>
              <h3 className="text-sm font-semibold mb-2">À éviter</h3>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {brandProfile.dont}
              </p>
            </div>
          )}

          {brandProfile.examples && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Exemples</h3>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {brandProfile.examples}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

