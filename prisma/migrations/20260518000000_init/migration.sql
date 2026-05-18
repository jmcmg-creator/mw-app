-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('ACTION', 'ETF', 'STRUCTURE', 'IMMO', 'SECURISE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL', 'DIVIDEND', 'FEE');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD');

-- CreateEnum
CREATE TYPE "LoanRateType" AS ENUM ('FIXE', 'VARIABLE');

-- CreateEnum
CREATE TYPE "ReferenceRate" AS ENUM ('EURIBOR_1M', 'EURIBOR_3M', 'EURIBOR_6M', 'EURIBOR_12M', 'ESTR', 'SOFR', 'LIVRET_A');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ACTE_VENTE', 'BAIL', 'RELEVE', 'CONTRAT_PRET', 'FISCAL', 'TERM_SHEET', 'AUTRE');

-- CreateEnum
CREATE TYPE "ExtractionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ObservationOutcome" AS ENUM ('PENDING', 'AUTOCALLED', 'COUPON_PAID', 'COUPON_MISSED', 'CAPITAL_LOSS', 'MATURED_FULL_REPAYMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "base_currency" "Currency" NOT NULL DEFAULT 'EUR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "base_currency" "Currency" NOT NULL DEFAULT 'EUR',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_balances" (
    "id" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "currency" "Currency" NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "type" "AssetType" NOT NULL,
    "name" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "notes" TEXT,
    "ticker" TEXT,
    "isin" TEXT,
    "cached_pru" DECIMAL(18,6),
    "cached_quantity" DECIMAL(18,6),
    "cached_market_price" DECIMAL(18,6),
    "pru_updated_at" TIMESTAMP(3),
    "surface_sqm" DECIMAL(10,2),
    "personal_equity" DECIMAL(18,2),
    "address" TEXT,
    "purchase_price" DECIMAL(18,2),
    "current_valuation" DECIMAL(18,2),
    "monthly_rent" DECIMAL(18,2),
    "monthly_charges" DECIMAL(18,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "type" "TransactionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantity" DECIMAL(18,6),
    "unit_price" DECIMAL(18,6),
    "fees" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "currency" "Currency" NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "exchange_rate" DECIMAL(18,8) NOT NULL DEFAULT 1,
    "amount_in_base_currency" DECIMAL(18,4) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "structured_product_details" (
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "underlying_ticker" TEXT NOT NULL,
    "strike_price" DECIMAL(18,6) NOT NULL,
    "capital_barrier" DECIMAL(6,4),
    "coupon_barrier" DECIMAL(6,4),
    "autocall_barrier" DECIMAL(6,4),
    "coupon_rate" DECIMAL(8,6) NOT NULL,
    "issuer" TEXT,
    "isin" TEXT,
    "nominal_amount" DECIMAL(18,2),
    "issue_date" TIMESTAMP(3),
    "maturity_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "structured_product_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_observation_dates" (
    "id" UUID NOT NULL,
    "structured_product_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "observation_date" TIMESTAMP(3) NOT NULL,
    "outcome" "ObservationOutcome" NOT NULL DEFAULT 'PENDING',
    "underlying_level" DECIMAL(18,6),
    "coupon_paid" DECIMAL(18,4),
    "notes" TEXT,

    CONSTRAINT "product_observation_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "lender" TEXT,
    "rate_type" "LoanRateType" NOT NULL,
    "fixed_rate" DECIMAL(8,6),
    "reference_rate" "ReferenceRate",
    "margin_rate" DECIMAL(8,6),
    "insurance_rate" DECIMAL(8,6),
    "principal" DECIMAL(18,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "duration_months" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amortization_schedules" (
    "id" UUID NOT NULL,
    "loan_id" UUID NOT NULL,
    "period" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "payment" DECIMAL(18,2) NOT NULL,
    "principal_paid" DECIMAL(18,2) NOT NULL,
    "interest_paid" DECIMAL(18,2) NOT NULL,
    "insurance_paid" DECIMAL(18,2),
    "remaining_balance" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "amortization_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'AUTRE',
    "title" TEXT NOT NULL,
    "storage_bucket" TEXT NOT NULL DEFAULT 'documents',
    "storage_path" TEXT NOT NULL,
    "mime_type" TEXT,
    "file_size" INTEGER,
    "extracted_data" JSONB,
    "extraction_status" "ExtractionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "portfolios_user_id_idx" ON "portfolios"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cash_balances_portfolio_id_currency_key" ON "cash_balances"("portfolio_id", "currency");

-- CreateIndex
CREATE INDEX "assets_portfolio_id_idx" ON "assets"("portfolio_id");

-- CreateIndex
CREATE INDEX "assets_ticker_idx" ON "assets"("ticker");

-- CreateIndex
CREATE INDEX "transactions_asset_id_idx" ON "transactions"("asset_id");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE UNIQUE INDEX "structured_product_details_asset_id_key" ON "structured_product_details"("asset_id");

-- CreateIndex
CREATE INDEX "product_observation_dates_observation_date_idx" ON "product_observation_dates"("observation_date");

-- CreateIndex
CREATE UNIQUE INDEX "product_observation_dates_structured_product_id_sequence_key" ON "product_observation_dates"("structured_product_id", "sequence");

-- CreateIndex
CREATE INDEX "loans_asset_id_idx" ON "loans"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "amortization_schedules_loan_id_period_key" ON "amortization_schedules"("loan_id", "period");

-- CreateIndex
CREATE INDEX "documents_asset_id_idx" ON "documents"("asset_id");

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_balances" ADD CONSTRAINT "cash_balances_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "structured_product_details" ADD CONSTRAINT "structured_product_details_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_observation_dates" ADD CONSTRAINT "product_observation_dates_structured_product_id_fkey" FOREIGN KEY ("structured_product_id") REFERENCES "structured_product_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amortization_schedules" ADD CONSTRAINT "amortization_schedules_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
