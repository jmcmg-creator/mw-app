-- Yahoo Finance fundamentals cache on each asset.
alter table "assets" add column if not exists "sector" text;
alter table "assets" add column if not exists "industry" text;
alter table "assets" add column if not exists "market_cap" decimal(18, 2);
alter table "assets" add column if not exists "pe_ratio" decimal(10, 4);
alter table "assets" add column if not exists "debt_to_equity" decimal(10, 4);
alter table "assets" add column if not exists "free_cashflow" decimal(18, 2);
alter table "assets" add column if not exists "ytd_return" decimal(10, 6);
alter table "assets"
  add column if not exists "fundamentals_updated_at" timestamp(3);
