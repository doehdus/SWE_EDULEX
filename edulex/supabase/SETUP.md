# Supabase 세팅 가이드

## 1단계 — Supabase 프로젝트 생성

1. https://supabase.com → 로그인 → New Project
2. 프로젝트 이름: `edulex`
3. 비밀번호 설정 후 Create Project

## 2단계 — DB 전체 구조 한 번에 생성

1. Supabase 대시보드 → **SQL Editor**
2. `supabase/migrations/20260420_init.sql` 내용 전체 복사
3. SQL Editor에 붙여넣기 → **Run**

→ 테이블 9개 + RLS 정책 + DB 함수 2개 + 트리거 2개 자동 생성

## 3단계 — .env.local 키 입력

Settings → API 에서 복사:

```
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

## 4단계 — Authentication 설정

- Authentication → Providers → Email: **Enable**
- Authentication → URL Configuration → Site URL: `http://localhost:5173`

## 5단계 — Realtime 활성화

Database → Replication → `users` 테이블 Enable

## 6단계 — Edge Function 배포 (PDF→AI)

```bash
npx supabase login
npx supabase link --project-ref 프로젝트ID
npx supabase secrets set GEMINI_API_KEY=AIza...
npx supabase functions deploy create-wordbook-from-pdf
```

## 7단계 — 관리자 계정 설정

1. 앱에서 일반 회원가입 후
2. Supabase → Table Editor → users 테이블
3. 해당 row의 `role` 컬럼을 `admin` 으로 수정

## 8단계 — 앱 실행

```bash
npm run dev
```
