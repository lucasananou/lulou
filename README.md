# Lulou Planner MVP

Outil interne de planification & gestion social media pour l'agence Lulou.

## Stack technique

- **Next.js 14+** (App Router, TypeScript)
- **TailwindCSS** + **shadcn/ui**
- **Supabase** (PostgreSQL)
- **Drizzle ORM**
- **Clerk** (Authentification)

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.local.example .env.local
```

Remplir les variables dans `.env.local` :
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` : Clé publique Clerk
- `CLERK_SECRET_KEY` : Clé secrète Clerk
- `DATABASE_URL` : URL de connexion PostgreSQL (Supabase)

3. Générer les migrations Drizzle :
```bash
npm run db:generate
```

4. Appliquer les migrations :
```bash
npm run db:push
```

5. Démarrer le serveur de développement :
```bash
npm run dev
```

## Structure du projet

```
src/
├── app/              # Routes Next.js (App Router)
│   ├── (app)/        # Routes protégées (espace interne)
│   ├── sign-in/      # Authentification Clerk
│   └── sign-up/
├── components/       # Composants React réutilisables
│   ├── layout/       # Layout & navigation
│   ├── client/       # Composants clients
│   └── ui/           # Composants shadcn/ui
├── lib/              # Utilitaires
│   ├── db/           # Configuration Drizzle
│   ├── auth.ts       # Helpers authentification
│   └── utils.ts      # Utilitaires généraux
├── modules/          # Domaines fonctionnels
│   ├── clients/      # Actions & logique clients
│   └── workspaces/   # Actions & logique workspaces
└── contracts/        # Schémas Zod de validation
```

## Partie 1 - Fonctionnalités implémentées

✅ Setup projet (Next.js, Tailwind, shadcn/ui, Drizzle, Clerk)
✅ Schémas de base de données (workspaces, workspace_members, clients)
✅ Authentification avec Clerk
✅ Layout protégé avec Sidebar & Topbar
✅ Gestion des clients :
  - Liste des clients (`/app/clients`)
  - Création d'un client (`/app/clients/new`)
  - Vue d'ensemble client (`/app/clients/[clientId]`)

## Prochaines étapes (Parties suivantes)

- Social accounts (comptes sociaux par client)
- Brand profiles (profils de marque)
- Posts (création et gestion de contenus)
- Calendar (planning éditorial)
- Approvals (validation client)
- Reports (rapports mensuels)

# lulou
