import { defineConfig } from "prisma/config";

// `prisma generate` doesn't need a real DB connection but Prisma 7's strict
// `env()` throws at config-load time when DATABASE_URL is missing — which
// breaks postinstall in fresh build environments. Use a lazy fallback so
// generate works everywhere; commands that *do* connect (migrate deploy,
// db push) will still fail loudly when the env is genuinely missing.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://unused:unused@localhost:5432/unused",
  },
});
