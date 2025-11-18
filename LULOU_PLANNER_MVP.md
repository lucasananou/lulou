# Lulou Planner — MVP fonctionnel (Spécification pour Cursor)

> Outil interne de planification & gestion social media pour l’agence **Lulou** (community management).
> Objectif MVP : remplacer Metricool pour un usage **interne agence**, avec :
> - gestion des clients,
> - planning éditorial,
> - suivi des contenus,
> - validation simple par le client,
> - base pour ajouter la publication automatique plus tard.

---

## 0. Stack & principes d’architecture

On réutilise la stack standard déjà définie (Next.js + Supabase + Drizzle + Clerk + Stripe en option pour plus tard). fileciteturn0file0L1-L40

**Front / App :**
- Next.js 14+ (App Router, RSC, Server Actions).
- TypeScript strict.
- TailwindCSS + shadcn/ui + Radix UI.
- Organisation du code :
  - `src/app` : routes & layouts.
  - `src/modules` : domaines fonctionnels (clients, posts, calendar, approvals…).
  - `src/components` : composants UI réutilisables.
  - `src/lib` : utilitaires (auth, db, env, dates…).

**Back / Data :**
- Supabase (PostgreSQL) pour prod / staging.
- Drizzle ORM :
  - `drizzle/schema.ts` (ou dossiers par domaine).
  - `drizzle/migrations/`.
- Pas de fetch client pour la donnée sensible → lectures en RSC, mutations via Server Actions.

**Auth :**
- Clerk (users, sessions, organisations internes).
- Middleware Next pour protéger les routes `/(app)` (logged) et segment éventuel `/(client)` (pour les pages d’approbation protégées par token).

**Paiements :**
- MVP **sans Stripe** côté produit (outil interne).
- Stripe déjà prévu dans la stack pour une future ouverture SaaS (à ignorer fonctionnellement dans ce MVP).

---

## 1. Domaine fonctionnel & vocabulaire

### 1.1. Concepts

- **User** : membre de l’équipe Lulou (toi, ta soeur, freelances).
- **Workspace** : organisation interne (ici : Lulou). Optionnellement, on garde la structure multi-workspace pour futur SaaS.
- **Client** : entreprise ou marque gérée par l’agence.
- **SocialAccount** : compte social d’un client (Instagram, Facebook, LinkedIn… — pour MVP : juste stocké, pas d’API).
- **BrandProfile** : infos de la marque (ton, couleurs, cibles, lignes éditoriales).
- **ContentPost** (Post éditorial) : une idée de post + son contenu (texte, visuels, réseau ciblé, statut).
- **PublicationSlot** : date + heure + réseau + client sur lequel un Post est/ou sera publié.
- **ApprovalRequest** : lien envoyé au client pour valider les posts d’une période.
- **Report** (simple) : snapshot mensuel des stats (rempli à la main dans le MVP).

### 1.2. MVP – ce que l’appli doit savoir faire

**IN :**
- Créer / éditer / archiver des clients.
- Définir les comptes sociaux du client.
- Définir un “profil de marque” (ton, couleurs, notes).
- Créer des posts pour un client (texte + visuels + réseau + statut).
- Planifier les posts dans un calendrier (PublicationSlot).
- Voir le planning du mois/semaine par client.
- Générer une vue “validation client” (liste des posts + statut + commentaire).
- Générer un mini-report mensuel (manuel, juste stocké pour l’instant).

**HORS MVP (mais anticipé dans le design) :**
- Publication automatique via API Meta / LinkedIn / TikTok.
- Stats automatiques des posts.
- Multi-tenant SaaS ouvert aux autres agences.
- Paiements intégrés / abonnement client self-service.

---

## 2. Expérience utilisateur & routes principales

### 2.1. Layouts

- `/(marketing)` (optionnel, plus tard) : page publique de présentation.
- `/(app)` : espace interne agence, nécessite login Clerk.
  - Layout `AppShell` avec :
    - sidebar (clients, vue globale),
    - topbar (switch workspace, user menu).
- `/(approval)` : pages d’approbation client accessibles via un lien sécurisé par token (pas besoin de compte).

### 2.2. Routes MVP

Sous `src/app` :

- `/login` → géré par Clerk.
- `/app` (Dashboard général)
  - Widget “Prochains posts à publier” (par date).
  - Liste des clients avec nombre de posts planifiés cette semaine.
- `/app/clients`
  - Liste des clients : nom, secteur, réseaux liés, statut (actif/inactif).
- `/app/clients/new`
  - Formulaire de création client.
- `/app/clients/[clientId]`
  - Vue “Overview client” :
    - infos de base,
    - résumé des comptes sociaux,
    - résumé du planning (nombre de posts cette semaine / ce mois),
    - dernier rapport.
- `/app/clients/[clientId]/brand`
  - BrandProfile : ton, style, couleurs, exemples, notes.
- `/app/clients/[clientId]/posts`
  - Table des posts :
    - filtre par statut (brouillon, à valider, validé, programmé, publié).
    - bouton “Nouveau post”.
- `/app/clients/[clientId]/posts/new`
  - Formulaire de création / édition :
    - titre interne / nom de campagne,
    - texte du post,
    - réseau cible (multi-select),
    - date/horaire souhaité,
    - tags (ex : “promo”, “éducation”, “inspiration”),
    - pièces jointes (URL Miro / Figma / Drive ou upload dans Supabase storage plus tard).
- `/app/clients/[clientId]/calendar`
  - Vue calendrier :
    - mois + semaine,
    - cartes de posts à la date/horaire,
    - drag & drop **optionnel** (hors MVP si trop complexe : simple display avec changement de date via modal).
- `/app/clients/[clientId]/approvals`
  - Liste des campagnes d’approbation :
    - période (ex : avril 2026),
    - statut (brouillon, envoyé, partiellement validé, validé).
- `/app/reports`
  - Liste des rapports mensuels par client.
- `/app/reports/[reportId]`
  - Vue d’un rapport (textes + chiffres saisis manuellement).

Routes publiques d’approbation client :

- `/approval/[token]`
  - Vue simple :
    - liste des posts concernés (date, réseau, texte, preview image),
    - boutons “Valider / Refuser / Commenter”,
    - zone commentaire global,
    - état de validation affiché.

---

## 3. Modèle de données (Drizzle / Supabase)

### 3.1. Table `workspaces` (optionnel mais conseillé)

- `id` (uuid, pk)
- `name` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 3.2. Table `workspace_members`

- `id` (uuid, pk)
- `workspace_id` (fk → workspaces.id)
- `user_id` (string – ref Clerk user id)
- `role` (`'owner' | 'admin' | 'member'`)
- `created_at`
- `updated_at`

### 3.3. Table `clients`

- `id` (uuid, pk)
- `workspace_id` (fk)
- `name` (text)
- `slug` (text, unique par workspace)
- `industry` (text, nullable)
- `contact_name` (text, nullable)
- `contact_email` (text, nullable)
- `status` (`'active' | 'paused' | 'archived'`)
- `notes` (text, nullable)
- `created_at`
- `updated_at`

### 3.4. Table `social_accounts`

- `id` (uuid, pk)
- `client_id` (fk → clients.id)
- `platform` (`'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube' | 'other'`)
- `handle` (text) – @username ou URL courte.
- `url` (text, nullable)
- `is_active` (boolean, default true)
- `created_at`
- `updated_at`

### 3.5. Table `brand_profiles`

- `id` (uuid, pk)
- `client_id` (fk)
- `tone_of_voice` (text, long)
- `brand_colors` (jsonb, ex: array de strings hex)
- `audience` (text)
- `do` (text)    // à faire
- `dont` (text)  // à éviter
- `examples` (text) // exemples de messages / posts
- `created_at`
- `updated_at`

### 3.6. Table `posts`

Représente l’unité de contenu éditorial (même si on prévoit multi-réseaux par post dans le futur, pour le MVP on peut faire 1 post = 1 réseau).

- `id` (uuid, pk)
- `client_id` (fk)
- `title` (text) – titre interne (ex : “Promo -20% Octobre”)
- `body` (text) – texte principal du post
- `platform` (enum comme `social_accounts.platform`)
- `status` (`'draft' | 'to_approve' | 'approved' | 'scheduled' | 'published' | 'cancelled'`)
- `tags` (text[]) – mots-clés internes
- `scheduled_at` (timestamp, nullable)
- `published_at` (timestamp, nullable)
- `approval_request_id` (fk nullable vers `approval_requests.id`)
- `created_by` (fk workspace_members.id ou user_id string)
- `created_at`
- `updated_at`

### 3.7. Table `post_assets` (optionnel MVP, mais structure prévue)

- `id` (uuid, pk)
- `post_id` (fk → posts.id)
- `type` (`'image' | 'video' | 'external_link'`)
- `url` (text)
- `notes` (text, nullable)
- `created_at`

### 3.8. Table `approval_requests`

- `id` (uuid, pk)
- `client_id` (fk)
- `workspace_id` (fk)
- `token` (text unique, utilisé dans `/approval/[token]`)
- `title` (text) – ex : “Posts à valider – Avril 2026”
- `status` (`'draft' | 'sent' | 'partially_approved' | 'approved' | 'closed'`)
- `sent_at` (timestamp, nullable)
- `approved_at` (timestamp, nullable)
- `expires_at` (timestamp, nullable)
- `created_at`
- `updated_at`

### 3.9. Table `approval_items`

Lien entre un `approval_request` et des `posts`, avec état au niveau du post.

- `id` (uuid, pk)
- `approval_request_id` (fk)
- `post_id` (fk)
- `status` (`'pending' | 'approved' | 'rejected'`)
- `client_comment` (text, nullable)
- `updated_at`

### 3.10. Table `reports`

Pour stocker les rapports mensuels (même si les chiffres sont saisis à la main).

- `id` (uuid, pk)
- `client_id` (fk)
- `month` (int, 1–12)
- `year` (int)
- `title` (text)
- `summary` (text)
- `metrics` (jsonb) – ex: `{ "followers_start": 1000, "followers_end": 1120, "best_post_id": "...", "engagement_rate": 3.2 }`
- `created_at`
- `updated_at`

---

## 4. Server Actions & logique métier

On centralise les actions par module dans `src/modules/<domain>/actions.ts`.

### 4.1. Auth / Workspace

- `getCurrentWorkspace()` – récupère workspace courant selon user (Clerk) + choix dans l’UI.
- `requireWorkspaceMember(role?)` – helper pour vérifier les permissions.

### 4.2. Clients

Fichier : `src/modules/clients/actions.ts`

- `createClient(input)` :
  - validate avec Zod,
  - insère dans `clients`,
  - crée une entrée vide dans `brand_profiles`.
- `updateClient(id, input)`
- `listClients(workspaceId)` :
  - renvoie clients + stats de posts (compte par statut).
- `getClientOverview(clientId)` :
  - infos client,
  - social accounts,
  - nb de posts par statut,
  - dernier rapport.

### 4.3. Social accounts

- `addSocialAccount(clientId, input)`
- `updateSocialAccount(id, input)`
- `deleteSocialAccount(id)`

### 4.4. Posts

Fichier : `src/modules/posts/actions.ts`

- `createPost(clientId, input)` :
  - crée un `posts` en statut `'draft'`.
- `updatePost(postId, input)`
- `changePostStatus(postId, status)`
- `schedulePost(postId, scheduledAt)`
- `listPostsByClient(clientId, filters)`
- `getPost(postId)`

### 4.5. Calendar

Fichier : `src/modules/calendar/queries.ts`

- `getClientCalendar(clientId, from, to)` :
  - retourne les posts avec `scheduled_at` dans la plage donnée, groupés par jour.
- (optionnel) `getWorkspaceCalendar(workspaceId, from, to)` pour vue globale.

### 4.6. Approvals

Fichier : `src/modules/approvals/actions.ts`

- `createApprovalRequest(clientId, input)` :
  - crée `approval_requests` en `'draft'`,
  - associe les posts (table `approval_items`).
- `sendApprovalRequest(approvalRequestId)` :
  - génère un `token` si non présent,
  - passe `status` à `'sent'` + `sent_at`,
  - renvoie l’URL `/approval/[token]` pour envoi manuel par email (MVP).
- `getApprovalRequestByToken(token)` :
  - renvoie les infos + posts + items.
- `updateApprovalItemStatus(itemId, status, comment?)` :
  - mis à jour par la page `/approval/[token]`,
  - si tous `approved` → maj `approval_requests.status = 'approved'`.
- Optionnel : `closeApprovalRequest(approvalRequestId)`.

### 4.7. Reports

Fichier : `src/modules/reports/actions.ts`

- `createOrUpdateReport(clientId, month, year, input)`
- `listReportsByClient(clientId)`
- `getReport(reportId)`

---

## 5. UI / composants

Organisation recommandée :

- `src/components/layout/AppShell.tsx`
- `src/components/nav/Sidebar.tsx`
- `src/components/nav/Topbar.tsx`
- `src/components/client/ClientCard.tsx`
- `src/components/client/ClientStats.tsx`
- `src/components/posts/PostCard.tsx`
- `src/components/posts/PostForm.tsx`
- `src/components/calendar/CalendarMonth.tsx`
- `src/components/calendar/CalendarWeek.tsx`
- `src/components/approvals/ApprovalPostList.tsx`
- `src/components/approvals/ApprovalStatusBadge.tsx`
- `src/components/reports/ReportSummaryCard.tsx`

Principes UI :
- Design sobre, lisible, style “outil pro” (comme Linear / Notion).
- Navigation principale par client.
- Beaucoup de filtres simples : statut de post, période, plateforme.
- Feedback clair :
  - toasts (`sonner`) pour les actions,
  - badges de statut,
  - skeletons / loading states pour RSC.

---

## 6. Validation & schémas Zod

Dossier : `src/contracts/`.

- `clients.ts` :
  - `createClientSchema`, `updateClientSchema`.
- `posts.ts` :
  - `createPostSchema`, `updatePostSchema`, `schedulePostSchema`.
- `approvals.ts` :
  - `createApprovalRequestSchema`, `updateApprovalItemSchema`.
- `reports.ts` :
  - `upsertReportSchema`.

Ces schémas sont partagés :
- côté serveur (Server Actions),
- côté client (React Hook Form).

---

## 7. Roadmap d’implémentation (ordre conseillé)

1. **Setup projet / infra**
   - Next.js + Tailwind + shadcn/ui.
   - Supabase + Drizzle (connexion, première migration).
   - Clerk (auth), layout `/(app)` protégé.

2. **Modèle Workspace & Members**
   - tables `workspaces`, `workspace_members`.
   - Seed : 1 workspace “Lulou” + toi en owner.

3. **Clients**
   - tables `clients`, `social_accounts`, `brand_profiles`.
   - pages `/app/clients`, `/app/clients/[clientId]`, `/brand`.
   - formulaires avec Zod + RHF.

4. **Posts & Calendar**
   - table `posts` (+ `post_assets` si tu veux direct).
   - pages `/app/clients/[clientId]/posts` + création.
   - vue calendrier simple (sans drag&drop au début).

5. **Approvals**
   - tables `approval_requests`, `approval_items`.
   - logic pour créer une campagne d’approbation sur un set de posts.
   - page `/approval/[token]` (publique) avec action de validation.

6. **Reports**
   - table `reports`.
   - pages `/app/reports` + `/app/reports/[reportId]`.

7. **Polish / qualité**
   - loader states, erreurs, 404 spécifiques.
   - petits détails UI (résumé client, statut visuels, etc.).
   - éventuellement un mode dark/light (next-themes).

---

Ce fichier `.md` sert de **blueprint complet pour Cursor** : 
- il définit le domaine,
- le modèle de données,
- les routes,
- les Server Actions,
- et une roadmap claire pour coder le MVP sans se perdre.
