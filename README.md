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
