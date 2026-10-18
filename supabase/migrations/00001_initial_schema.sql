-- Profiles table (auto-created on sign up via trigger)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  max_clips int not null default 50,
  default_expiry_hours int not null default 24,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Clips table
create table public.clips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  clip_type text not null default 'text' check (clip_type in ('text', 'link', 'image', 'code')),
  title text,
  pinned boolean not null default false,
  favorite boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clips enable row level security;

create policy "Users can CRUD own clips"
  on public.clips for all using (auth.uid() = user_id);

create index idx_clips_user_created on public.clips (user_id, created_at desc);
create index idx_clips_expires on public.clips (expires_at) where expires_at is not null;

-- Clip metadata (Open Graph for links)
create table public.clip_metadata (
  id uuid primary key default gen_random_uuid(),
  clip_id uuid references public.clips(id) on delete cascade not null unique,
  og_title text,
  og_description text,
  og_image text,
  og_site_name text,
  favicon_url text,
  created_at timestamptz not null default now()
);

alter table public.clip_metadata enable row level security;

create policy "Users can read own clip metadata"
  on public.clip_metadata for select
  using (exists (
    select 1 from public.clips where clips.id = clip_metadata.clip_id and clips.user_id = auth.uid()
  ));

create policy "Users can insert own clip metadata"
  on public.clip_metadata for insert
  with check (exists (
    select 1 from public.clips where clips.id = clip_metadata.clip_id and clips.user_id = auth.uid()
  ));

-- Auto-expire clips (run via pg_cron every hour)
-- SELECT cron.schedule('expire-clips', '0 * * * *', $$
--   DELETE FROM public.clips WHERE expires_at < now() AND pinned = false;
-- $$);

-- Enforce max clip count per user (trigger)
create or replace function public.enforce_max_clips()
returns trigger as $$
declare
  clip_count int;
  user_max int;
begin
  select count(*) into clip_count from public.clips where user_id = new.user_id;
  select max_clips into user_max from public.profiles where id = new.user_id;

  if clip_count > coalesce(user_max, 50) then
    delete from public.clips
    where id in (
      select id from public.clips
      where user_id = new.user_id and pinned = false
      order by created_at asc
      limit (clip_count - coalesce(user_max, 50))
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_clip_inserted
  after insert on public.clips
  for each row execute function public.enforce_max_clips();

-- Enable realtime
alter publication supabase_realtime add table public.clips;
