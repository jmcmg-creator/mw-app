-- Holder identity on portfolios: tracks which individual or company actually
-- owns the positions tracked under a portfolio, so a single user can manage
-- multiple holders (themselves, spouse, SCI, etc.) and filter the UI.

-- CreateEnum
CREATE TYPE "HolderType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- AlterTable
ALTER TABLE "portfolios"
  ADD COLUMN "holder_name" TEXT,
  ADD COLUMN "holder_type" "HolderType",
  ADD COLUMN "holder_tax_id" TEXT;

-- CreateIndex
CREATE INDEX "portfolios_holder_name_idx" ON "portfolios"("holder_name");
