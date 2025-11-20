-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  is_university_email boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create items table
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  category text not null,
  location text not null,
  coordinates jsonb,
  date_lost_found date not null,
  image_url text,
  type text check (type in ('lost', 'found')) not null,
  status text check (status in ('active', 'resolved')) default 'active' not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create conversations table
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.items(id) on delete cascade not null,
  user1_id uuid references public.profiles(id) on delete cascade not null,
  user2_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- RLS Policies

-- Profiles: Public read, Self update
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Items: Public read, Authenticated insert, Owner update/delete
create policy "Items are viewable by everyone."
  on public.items for select
  using ( true );

create policy "Authenticated users can insert items."
  on public.items for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update own items."
  on public.items for update
  using ( auth.uid() = user_id );

create policy "Users can delete own items."
  on public.items for delete
  using ( auth.uid() = user_id );

-- Conversations: Participants read/insert
create policy "Users can view their own conversations."
  on public.conversations for select
  using ( auth.uid() = user1_id or auth.uid() = user2_id );

create policy "Authenticated users can create conversations."
  on public.conversations for insert
  with check ( auth.role() = 'authenticated' );

-- Messages: Participants read, Sender insert
create policy "Users can view messages in their conversations."
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where id = conversation_id
      and (user1_id = auth.uid() or user2_id = auth.uid())
    )
  );

create policy "Users can insert messages in their conversations."
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversations
      where id = conversation_id
      and (user1_id = auth.uid() or user2_id = auth.uid())
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, is_university_email)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email like '%.edu'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
