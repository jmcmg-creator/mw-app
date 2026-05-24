# Patrimoine — suivi de portefeuille d'investissements

Application personnelle (SaaS) de suivi de patrimoine : bourse, produits
structurés et immobilier, dans une interface épurée et mobile-first.

## Stack

- **Next.js 16** (App Router, TypeScript) + **Tailwind CSS v4** + Shadcn UI
- **Supabase** — PostgreSQL, Auth (2FA TOTP), Storage
- **Prisma 7** — ORM (driver adapter `pg`)
- **Recharts**, **yahoo-finance2**, **Vercel AI SDK** (à venir)

## Démarrage

```bash
npm install
cp .env.example .env   # renseigner les valeurs Supabase
npm run dev
```

## Base de données

Le schéma vit dans `prisma/schema.prisma`. La migration initiale
(`prisma/migrations/`) et les scripts Supabase (`supabase/migrations/` —
trigger de synchro auth, politiques RLS) doivent être appliqués sur le
projet Supabase.

## Structure

- `src/app/` — routes (auth + espace applicatif protégé)
- `src/actions/` — Server Actions métier (PRU, produits structurés, immo)
- `src/services/` — intégrations externes (Checkmyguest)
- `src/lib/` — clients Prisma et Supabase
- `src/components/ui/` — composants Shadcn

## Scripts

| Commande              | Rôle                     |
| --------------------- | ------------------------ |
| `npm run dev`         | Serveur de développement |
| `npm run build`       | Build de production      |
| `npm run lint`        | Lint ESLint              |
| `npm run db:generate` | Génère le client Prisma  |

## Déploiement auto (Vercel)

Le repo est branché sur le workflow `.github/workflows/deploy.yml` :
chaque push sur `main` ou sur une branche `claude/**` build, applique la
migration Prisma (`vercel-build` = `prisma migrate deploy && next build`)
et déploie sur Vercel.

### Setup une seule fois (~10 min)

1. **Créer (ou ouvrir) le projet Vercel** lié au repo `jmcmg-creator/mw-app`.
2. **Ajouter les variables d'environnement sur Vercel** (Settings → Environment Variables) — celles de `.env.example` :
   - `DATABASE_URL` (direct, port 5432, pour les migrations)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (extraction de documents)
3. **Récupérer 3 valeurs** depuis Vercel :
   - `VERCEL_TOKEN` → https://vercel.com/account/tokens (créer un token "GitHub Actions")
   - `VERCEL_ORG_ID` → Settings → General du projet
   - `VERCEL_PROJECT_ID` → Settings → General du projet
4. **Ajouter ces 3 secrets sur GitHub** : Repo → Settings → Secrets and variables → Actions → New repository secret.
5. **Activer le workflow** : Repo → Settings → Secrets and variables → Actions → Variables → New variable `DEPLOY_ENABLED=true`.

Une fois ces étapes faites, l'URL publique apparaît dans le résumé du
job GitHub Actions à chaque push.
