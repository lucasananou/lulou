/**
 * Script de seed pour créer un workspace par défaut
 * 
 * Usage: npx tsx src/scripts/seed.ts
 * 
 * Note: Assurez-vous d'avoir configuré DATABASE_URL dans .env.local
 */

import { db } from "@/lib/db";
import { workspaces, workspaceMembers } from "@/lib/db/schema";

async function seed() {
  console.log("🌱 Starting seed...");

  try {
    // Créer un workspace par défaut
    const [workspace] = await db
      .insert(workspaces)
      .values({
        name: "Lulou",
      })
      .returning();

    console.log(`✅ Created workspace: ${workspace.name} (${workspace.id})`);

    console.log(`
📝 Next steps:
1. Connectez-vous avec Clerk
2. Récupérez votre user_id depuis le dashboard Clerk
3. Exécutez cette requête SQL dans Supabase pour vous ajouter comme owner:

INSERT INTO workspace_members (workspace_id, user_id, role)
VALUES ('${workspace.id}', 'YOUR_CLERK_USER_ID', 'owner');

Ou utilisez l'API Drizzle dans une action serveur pour créer le membre.
    `);
  } catch (error) {
    console.error("❌ Error seeding:", error);
    process.exit(1);
  }
}

seed();

