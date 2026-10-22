-- Football Lobby Schema
-- Run this in your Supabase SQL editor

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time time not null,
  venue_name text not null,
  venue_address text,
  total_cost decimal(10,2),
  max_players integer not null default 10,
  status text not null default 'active' check (status in ('active', 'finalized', 'cancelled')),
  join_code text not null unique,
  created_by uuid not null references players(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  payment_status text not null default 'unpaid' check (payment_status in ('paid', 'unpaid')),
  payment_amount decimal(10,2),
  payment_date timestamptz,
  joined_at timestamptz default now(),
  unique(game_id, player_id)
);

-- Indexes
create index if not exists idx_games_join_code on games(join_code);
create index if not exists idx_game_players_game_id on game_players(game_id);
create index if not exists idx_game_players_player_id on game_players(player_id);

-- Disable RLS (we use service role key in API routes)
alter table players disable row level security;
alter table games disable row level security;
alter table game_players disable row level security;

-- Atomic join: prevents race condition where two concurrent joins exceed max_players
create or replace function join_game(p_game_id uuid, p_player_id uuid)
returns text
language plpgsql
as $$
declare
  v_status text;
  v_max integer;
  v_count integer;
begin
  -- Lock the game row to prevent concurrent joins
  select status, max_players into v_status, v_max
  from games where id = p_game_id for update;

  if v_status is null then
    return 'not_found';
  end if;

  if v_status != 'active' then
    return 'not_active';
  end if;

  select count(*) into v_count from game_players where game_id = p_game_id;

  if v_count >= v_max then
    return 'full';
  end if;

  insert into game_players (game_id, player_id, payment_status)
  values (p_game_id, p_player_id, 'unpaid');

  return 'ok';
exception
  when unique_violation then
    return 'already_joined';
end;
$$;
