-- ============================================================
-- סגירת מעגל - Supabase Database Schema
-- Run this entire file in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── Enable required extensions ─────────────────────────────
create extension if not exists "uuid-ossp";


-- ─── 1. profiles ────────────────────────────────────────────
-- Extends auth.users with app-specific user data.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  first_name   text,
  last_name    text,
  phone_number text,
  email        text,
  created_at   timestamptz default now()
);

-- Auto-create a profile row whenever a new user registers
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone_number)
  values (new.id, new.phone);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─── 2. packages (static catalog) ───────────────────────────
create table if not exists public.packages (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  type             text not null check (type in ('video', 'audio', 'letter', 'flowers')),
  description      text,
  price            numeric(10,2) not null,
  messages_limit   int not null default 1,
  max_recipients   int not null default 10,
  max_years_ahead  int not null default 10,
  created_at       timestamptz default now()
);

-- Seed the 4 package categories from the PDF
insert into public.packages (title, type, description, price, messages_limit, max_recipients, max_years_ahead) values
  ('שליחת סרטון בודד + מכתב + תמונה', 'video', 'סרטון אישי עד 2 דק'' + מכתב נלווה ותמונה מהעבר', 160, 1, 10, 10),
  ('שני סרטונים + מכתב + תמונה', 'video', 'שני סרטונים עד 2 דק'' כל אחד', 280, 2, 10, 10),
  ('שלושה סרטונים + מכתב + תמונה', 'video', 'שלושה סרטונים עד 2 דק'' כל אחד', 350, 3, 10, 10),
  ('הקלטת אודיו עד 10 דק'' + מכתב + תמונה', 'audio', 'הקלטה קולית + מכתב נלווה ותמונה', 120, 1, 10, 10),
  ('הקלטת אודיו עד 20 דק'' + מכתב + תמונה', 'audio', 'הקלטה קולית ארוכה + מכתב ותמונה', 180, 1, 10, 10),
  ('שלוש הקלטות אודיו עד 20 דק''', 'audio', 'שלוש הקלטות קוליות + מכתב ותמונה לכל אחת', 250, 3, 10, 10),
  ('ברכה בודדת + תמונה מהעבר', 'letter', 'מכתב/ברכה ללא הגבלת טקסט + רקעים מעוצבים', 50, 1, 10, 10),
  ('3 ברכות + תמונה מהעבר', 'letter', 'שלוש ברכות עם רקעים מעוצבים', 120, 3, 10, 10),
  ('10 ברכות + תמונה מהעבר', 'letter', 'עשר ברכות עם רקעים מעוצבים', 250, 10, 10, 10),
  ('זר חרציות + ברכה מתוזמנת', 'flowers', 'חרציות במגוון צבעים וגרברות', 450, 1, 1, 3),
  ('זר איחולים גדול + ברכה', 'flowers', 'שושן צחור לבן + ורדים לבנים + ליזי לבן', 500, 1, 1, 3),
  ('זר ורדים אדומים 15 יחידות', 'flowers', '15 ורדים אדומים מרהיבים', 500, 1, 1, 3),
  ('זר גדול לבן וורוד + ברכה', 'flowers', 'ליליות ורודות, ליזי ורוד ולבן, ורדים', 650, 1, 1, 3)
on conflict do nothing;


-- ─── 3. user_packages ───────────────────────────────────────
-- Records which packages a user has purchased.
create table if not exists public.user_packages (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  package_id      uuid not null references public.packages(id),
  purchased_at    timestamptz default now(),
  messages_used   int not null default 0,
  messages_limit  int not null default 1,
  status          text not null default 'active' check (status in ('active', 'cancelled', 'exhausted')),
  payment_ref     text
);


-- ─── 4. folders ─────────────────────────────────────────────
create table if not exists public.folders (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  name             text not null,
  parent_folder_id uuid references public.folders(id) on delete cascade,
  created_at       timestamptz default now()
);


-- ─── 5. messages ────────────────────────────────────────────
create table if not exists public.messages (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  folder_id      uuid references public.folders(id) on delete set null,
  package_id     uuid references public.packages(id),
  type           text not null check (type in ('video', 'audio', 'letter', 'photo', 'flowers')),
  status         text not null default 'draft' check (status in ('draft', 'scheduled', 'sent', 'cancelled')),
  title          text,
  content        text,
  scheduled_date date,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Auto-update updated_at on changes
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists messages_updated_at on public.messages;
create trigger messages_updated_at
  before update on public.messages
  for each row execute function public.update_updated_at();


-- ─── 6. recipients ──────────────────────────────────────────
create table if not exists public.recipients (
  id         uuid primary key default uuid_generate_v4(),
  message_id uuid not null references public.messages(id) on delete cascade,
  name       text not null,
  phone      text not null,
  email      text
);


-- ─── 7. message_attachments ─────────────────────────────────
create table if not exists public.message_attachments (
  id         uuid primary key default uuid_generate_v4(),
  message_id uuid not null references public.messages(id) on delete cascade,
  type       text not null check (type in ('VIDEO', 'AUDIO', 'PHOTO')),
  file_path  text not null,
  file_url   text not null,
  created_at timestamptz default now()
);


-- ─── 8. flower_orders ───────────────────────────────────────
create table if not exists public.flower_orders (
  id             uuid primary key default uuid_generate_v4(),
  message_id     uuid references public.messages(id) on delete set null,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  bouquet_type   text not null,
  recipient_name text not null,
  phone          text not null,
  address        text not null,
  scheduled_date date not null,
  notes          text,
  price          numeric(10,2) not null,
  status         text not null default 'pending' check (status in ('pending','confirmed','delivered','cancelled')),
  created_at     timestamptz default now()
);


-- ============================================================
-- Row Level Security Policies
-- ============================================================

alter table public.profiles          enable row level security;
alter table public.packages          enable row level security;
alter table public.user_packages     enable row level security;
alter table public.folders           enable row level security;
alter table public.messages          enable row level security;
alter table public.recipients        enable row level security;
alter table public.message_attachments enable row level security;
alter table public.flower_orders     enable row level security;

-- profiles: users manage only their own row
create policy "users can view own profile"    on public.profiles for select using (auth.uid() = id);
create policy "users can update own profile"  on public.profiles for update using (auth.uid() = id);
create policy "users can insert own profile"  on public.profiles for insert with check (auth.uid() = id);

-- packages: anyone can read (public catalog)
create policy "packages are public"           on public.packages for select using (true);

-- user_packages
create policy "users can view own packages"   on public.user_packages for select using (auth.uid() = user_id);
create policy "users can insert own packages" on public.user_packages for insert with check (auth.uid() = user_id);
create policy "users can update own packages" on public.user_packages for update using (auth.uid() = user_id);

-- folders
create policy "users can manage own folders"  on public.folders for all using (auth.uid() = user_id);

-- messages
create policy "users can manage own messages" on public.messages for all using (auth.uid() = user_id);

-- recipients (access via message ownership)
create policy "users can manage own recipients" on public.recipients for all
  using (exists (select 1 from public.messages m where m.id = message_id and m.user_id = auth.uid()));

-- message_attachments
create policy "users can manage own attachments" on public.message_attachments for all
  using (exists (select 1 from public.messages m where m.id = message_id and m.user_id = auth.uid()));

-- flower_orders
create policy "users can manage own flower orders" on public.flower_orders for all using (auth.uid() = user_id);


-- ============================================================
-- Storage Bucket
-- Run separately if bucket creation via SQL is not supported:
-- Dashboard > Storage > New bucket > "media" (public)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "authenticated users can upload media"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "users can delete own media"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[2]);
