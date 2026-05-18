-- Sync Supabase Auth users into public.users.
--
-- Supabase stores credentials in auth.users; the application profile lives
-- in public.users with the same id. This migration keeps them in sync:
--   1. A foreign key so deleting an auth user removes the app profile.
--   2. A trigger so a new sign-up creates the app profile automatically.
--
-- Run this in the Supabase SQL Editor (it references the auth schema, which
-- only exists on Supabase, so it is kept out of the Prisma migrations).

alter table public.users
  add constraint users_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, full_name, avatar_url, updated_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
