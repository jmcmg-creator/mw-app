-- Bond cash-flow parameters for OBLIGATION assets.
-- Mirrors the Prisma migration; adds the Supabase RLS policy.

CREATE TYPE "CouponFrequency" AS ENUM ('ANNUAL', 'SEMI_ANNUAL', 'QUARTERLY', 'MONTHLY', 'ZERO_COUPON');

CREATE TABLE "bond_details" (
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "coupon_rate" DECIMAL(8,6) NOT NULL,
    "coupon_frequency" "CouponFrequency" NOT NULL DEFAULT 'ANNUAL',
    "nominal_amount" DECIMAL(18,2),
    "issue_date" TIMESTAMP(3),
    "maturity_date" TIMESTAMP(3) NOT NULL,
    "next_coupon_date" TIMESTAMP(3),
    "issuer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "bond_details_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bond_details_asset_id_key" ON "bond_details"("asset_id");

ALTER TABLE "bond_details"
  ADD CONSTRAINT "bond_details_asset_id_fkey"
  FOREIGN KEY ("asset_id") REFERENCES "assets"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.bond_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bond_details_owner" ON public.bond_details
  FOR ALL TO authenticated
  USING (public.owns_asset(asset_id))
  WITH CHECK (public.owns_asset(asset_id));
