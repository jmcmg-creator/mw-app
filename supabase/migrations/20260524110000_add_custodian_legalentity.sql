-- Custody & legal entity on assets (mirrors Prisma migration).

ALTER TABLE "assets"
  ADD COLUMN "custodian" TEXT,
  ADD COLUMN "legal_entity" TEXT;

CREATE INDEX "assets_custodian_idx" ON "assets"("custodian");
CREATE INDEX "assets_legal_entity_idx" ON "assets"("legal_entity");
