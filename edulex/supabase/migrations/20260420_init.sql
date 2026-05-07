-- ================================================================
-- EduLex 초기 DB 마이그레이션
-- Supabase SQL Editor에 전체 붙여넣기 후 실행
-- ================================================================

-- ----------------------------------------------------------------
-- 1. 테이블 생성
-- ----------------------------------------------------------------

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nickname text not null unique,
  role text not null default 'user',
  major text[] default '{}',
  active_title text,
  star_dust integer not null default 0,
  level integer not null default 1,
  created_at timestamptz default now()
);

create table if not exists public.official_wordbooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  major text not null,
  created_at timestamptz default now()
);

create table if not exists public.official_words (
  id uuid primary key default gen_random_uuid(),
  wordbook_id uuid references public.official_wordbooks(id) on delete cascade,
  english text not null,
  general_meaning text,
  major_meaning text not null,
  general_example text,
  major_example text not null,
  created_at timestamptz default now()
);

create table if not exists public.user_wordbooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_words (
  id uuid primary key default gen_random_uuid(),
  wordbook_id uuid references public.user_wordbooks(id) on delete cascade,
  english text not null,
  general_meaning text,
  major_meaning text not null,
  general_example text,
  major_example text not null,
  created_at timestamptz default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  date date not null,
  created_at timestamptz default now(),
  unique(user_id, date)
);

create table if not exists public.bookmark_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  change_amount integer not null,
  reason text not null,
  ref_id uuid,
  created_at timestamptz default now()
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  wordbook_id uuid not null,
  wordbook_type text not null,
  score integer not null,
  total integer not null,
  correct integer not null,
  created_at timestamptz default now()
);

create table if not exists public.word_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  wordbook_id uuid not null,
  word_id uuid not null,
  is_completed boolean default false,
  unique(user_id, word_id)
);

-- ----------------------------------------------------------------
-- 2. 단어장 2개 초과 생성 방지 DB 트리거 (API + DB 이중 방어)
-- ----------------------------------------------------------------

create or replace function public.check_wordbook_limit()
returns trigger language plpgsql as $$
begin
  if (
    select count(*) from public.user_wordbooks where user_id = new.user_id
  ) >= 2 then
    raise exception '단어장은 최대 2개까지만 생성할 수 있습니다.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_wordbook_limit on public.user_wordbooks;
create trigger trg_wordbook_limit
  before insert on public.user_wordbooks
  for each row execute function public.check_wordbook_limit();

-- ----------------------------------------------------------------
-- 3. 출석 체크 + 책갈피 트랜잭션 함수 (H02)
-- ----------------------------------------------------------------

create or replace function public.check_attendance(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_attendance_id uuid;
begin
  insert into public.attendance(user_id, date)
  values (p_user_id, current_date)
  returning id into v_attendance_id;

  update public.users
  set star_dust = star_dust + 10
  where id = p_user_id;

  insert into public.bookmark_logs(user_id, change_amount, reason, ref_id)
  values (p_user_id, 10, 'attendance', v_attendance_id);
end;
$$;

-- ----------------------------------------------------------------
-- 4. 퀴즈 결과 저장 + 별가루 트랜잭션 함수 (N03)
-- ----------------------------------------------------------------

create or replace function public.save_quiz_result(
  p_user_id uuid,
  p_wordbook_id uuid,
  p_wordbook_type text,
  p_score integer,
  p_total integer,
  p_correct integer
) returns void language plpgsql security definer as $$
declare
  v_result_id uuid;
  v_reward integer;
begin
  -- wordbook_id 서버 검증
  if p_wordbook_type = 'official' then
    if not exists (
      select 1 from public.official_wordbooks where id = p_wordbook_id
    ) then
      raise exception 'invalid wordbook_id';
    end if;
  else
    if not exists (
      select 1 from public.user_wordbooks
      where id = p_wordbook_id and user_id = p_user_id
    ) then
      raise exception 'invalid wordbook_id';
    end if;
  end if;

  insert into public.quiz_results(user_id, wordbook_id, wordbook_type, score, total, correct)
  values (p_user_id, p_wordbook_id, p_wordbook_type, p_score, p_total, p_correct)
  returning id into v_result_id;

  v_reward := greatest(5, p_correct * 2);

  update public.users
  set star_dust = star_dust + v_reward
  where id = p_user_id;

  insert into public.bookmark_logs(user_id, change_amount, reason, ref_id)
  values (p_user_id, v_reward, 'test_reward', v_result_id);
end;
$$;

-- ----------------------------------------------------------------
-- 5. 신규 가입 시 users 테이블 자동 생성 트리거
-- ----------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users(id, email, nickname)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------
-- 6. RLS 활성화 및 정책 설정
-- ----------------------------------------------------------------

alter table public.users enable row level security;
alter table public.official_wordbooks enable row level security;
alter table public.official_words enable row level security;
alter table public.user_wordbooks enable row level security;
alter table public.user_words enable row level security;
alter table public.attendance enable row level security;
alter table public.bookmark_logs enable row level security;
alter table public.quiz_results enable row level security;
alter table public.word_progress enable row level security;

-- users
drop policy if exists "users_select" on public.users;
drop policy if exists "users_update" on public.users;
create policy "users_select" on public.users for select using (auth.uid() = id);
create policy "users_update" on public.users for update using (auth.uid() = id);

-- official_wordbooks
drop policy if exists "official_wb_select" on public.official_wordbooks;
drop policy if exists "official_wb_admin" on public.official_wordbooks;
create policy "official_wb_select" on public.official_wordbooks for select using (true);
create policy "official_wb_admin" on public.official_wordbooks for all
  using ((select role from public.users where id = auth.uid()) = 'admin');

-- official_words
drop policy if exists "official_w_select" on public.official_words;
drop policy if exists "official_w_admin" on public.official_words;
create policy "official_w_select" on public.official_words for select using (true);
create policy "official_w_admin" on public.official_words for all
  using ((select role from public.users where id = auth.uid()) = 'admin');

-- user_wordbooks
drop policy if exists "user_wb_all" on public.user_wordbooks;
create policy "user_wb_all" on public.user_wordbooks for all using (auth.uid() = user_id);

-- user_words
drop policy if exists "user_w_all" on public.user_words;
create policy "user_w_all" on public.user_words for all
  using (exists (
    select 1 from public.user_wordbooks
    where id = user_words.wordbook_id and user_id = auth.uid()
  ));

-- attendance
drop policy if exists "attendance_all" on public.attendance;
create policy "attendance_all" on public.attendance for all using (auth.uid() = user_id);

-- bookmark_logs
drop policy if exists "logs_select" on public.bookmark_logs;
create policy "logs_select" on public.bookmark_logs for select using (auth.uid() = user_id);

-- quiz_results
drop policy if exists "results_all" on public.quiz_results;
create policy "results_all" on public.quiz_results for all using (auth.uid() = user_id);

-- word_progress
drop policy if exists "progress_all" on public.word_progress;
create policy "progress_all" on public.word_progress for all using (auth.uid() = user_id);
