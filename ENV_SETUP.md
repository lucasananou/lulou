# Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

## Variables requises

### Clerk (Authentification)

1. Créez un compte sur [Clerk](https://clerk.com)
2. Créez une nouvelle application
3. Récupérez vos clés depuis le dashboard Clerk

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Supabase / PostgreSQL

1. Créez un projet sur [Supabase](https://supabase.com)
2. Récupérez la connection string depuis Settings > Database > Connection string
3. Utilisez le format "URI" (mode transaction)

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

## Exemple de fichier `.env.local`

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:xxxxxxxxxxxxx@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

## Étapes suivantes après configuration

1. **Générer les migrations Drizzle** :
   ```bash
   npm run db:generate
   ```

2. **Appliquer les migrations** :
   ```bash
   npm run db:push
   ```

3. **Créer un workspace par défaut** (optionnel) :
   ```bash
   npm run seed
   ```
   Puis ajoutez-vous manuellement comme membre du workspace via Supabase ou une action serveur.

4. **Démarrer le serveur** :
   ```bash
   npm run dev
   ```

