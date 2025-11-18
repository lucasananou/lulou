"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre activité
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenue sur Lulou Planner</CardTitle>
          <CardDescription>
            Commencez par gérer vos clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/app/clients">
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Voir les clients
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

