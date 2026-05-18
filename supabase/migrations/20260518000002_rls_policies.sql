-- Row Level Security.
--
-- Every row is reachable only by the user who owns the parent portfolio.
-- Ownership helpers walk the hierarchy:
--   portfolio -> asset -> (loan | structured product) -> leaf rows.
--
-- IMPORTANT: these policies apply to the Supabase client (the
-- "authenticated" role). Server-side Prisma access uses the "postgres"
-- role and BYPASSES RLS, so server actions must additionally scope every
-- query to the current user.

-- Ownership helpers ---------------------------------------------------------

create or replace function public.owns_portfolio(p_id uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.portfolios p
    where p.id = p_id and p.user_id = auth.uid()
  );
$$;

create or replace function public.owns_asset(a_id uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.assets a
    join public.portfolios p on p.id = a.portfolio_id
    where a.id = a_id and p.user_id = auth.uid()
  );
$$;

create or replace function public.owns_loan(l_id uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.loans l
    where l.id = l_id and public.owns_asset(l.asset_id)
  );
$$;

create or replace function public.owns_structured_product(s_id uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.structured_product_details s
    where s.id = s_id and public.owns_asset(s.asset_id)
  );
$$;

-- Enable RLS ----------------------------------------------------------------

alter table public.users enable row level security;
alter table public.portfolios enable row level security;
alter table public.cash_balances enable row level security;
alter table public.assets enable row level security;
alter table public.transactions enable row level security;
alter table public.structured_product_details enable row level security;
alter table public.product_observation_dates enable row level security;
alter table public.loans enable row level security;
alter table public.amortization_schedules enable row level security;
alter table public.documents enable row level security;

-- Policies ------------------------------------------------------------------

create policy "users_self" on public.users
  for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "portfolios_owner" on public.portfolios
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "cash_balances_owner" on public.cash_balances
  for all to authenticated
  using (public.owns_portfolio(portfolio_id))
  with check (public.owns_portfolio(portfolio_id));

create policy "assets_owner" on public.assets
  for all to authenticated
  using (public.owns_portfolio(portfolio_id))
  with check (public.owns_portfolio(portfolio_id));

create policy "transactions_owner" on public.transactions
  for all to authenticated
  using (public.owns_asset(asset_id))
  with check (public.owns_asset(asset_id));

create policy "structured_product_details_owner" on public.structured_product_details
  for all to authenticated
  using (public.owns_asset(asset_id))
  with check (public.owns_asset(asset_id));

create policy "product_observation_dates_owner" on public.product_observation_dates
  for all to authenticated
  using (public.owns_structured_product(structured_product_id))
  with check (public.owns_structured_product(structured_product_id));

create policy "loans_owner" on public.loans
  for all to authenticated
  using (public.owns_asset(asset_id))
  with check (public.owns_asset(asset_id));

create policy "amortization_schedules_owner" on public.amortization_schedules
  for all to authenticated
  using (public.owns_loan(loan_id))
  with check (public.owns_loan(loan_id));

create policy "documents_owner" on public.documents
  for all to authenticated
  using (public.owns_asset(asset_id))
  with check (public.owns_asset(asset_id));
