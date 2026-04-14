# 🗃️ EduLex — DB 설계서 (ERD)

> EduLex 데이터베이스 스키마 설계서 | Supabase (PostgreSQL) 기반

---

## 📌 테이블 목록

| 테이블명 | 설명 |
|----------|------|
| [`users`](#1-users) | 사용자 계정 및 게임화 데이터 |
| [`official_wordbooks`](#2-official_wordbooks) | 관리자 등록 공식 단어장 |
| [`official_words`](#3-official_words) | 공식 단어장 소속 단어 |
| [`user_wordbooks`](#4-user_wordbooks) | 사용자 나만의 단어장 (PDF→AI) |
| [`user_words`](#5-user_words) | 나만의 단어장 소속 단어 |
| [`attendance`](#6-attendance) | 출석 기록 및 스트릭 |
| [`test_results`](#7-test_results) | 퀴즈 테스트 결과 |

---

## 1. `users`

> Supabase Auth의 `auth.users`와 1:1 연동되는 사용자 프로필 테이블

| 컬럼명 | 타입 | Nullable | 설명 |
|--------|------|:--------:|------|
| `id` | `uuid` | ❌ | PK, Supabase Auth UID |
| `nickname` | `text` | ❌ | 닉네임 (unique) |
| `email` | `text` | ❌ | 이메일 (unique) |
| `role` | `text` | ❌ | `'user'` \| `'admin'` (default: `'user'`) |
| `major` | `text[]` | ✅ | 선택 전공 (최대 2개, 회원가입 시 null) |
| `active_title` | `text` | ✅ | 현재 선택 칭호 |
| `star_dust` | `integer` | ❌ | 보유 별가루 (default: 0) |
| `level` | `integer` | ❌ | 사용자 레벨 (default: 1) |
| `created_at` | `timestamptz` | ❌ | 생성일시 |
| `updated_at` | `timestamptz` | ❌ | 수정일시 |

**제약 조건**
- `role` CHECK: `role IN ('user', 'admin')`
- `major` CHECK: `array_length(major, 1) <= 2`
- `star_dust` CHECK: `star_dust >= 0`

---

## 2. `official_wordbooks`

> 관리자가 등록·관리하는 전공별 공식 단어장

| 컬럼명 | 타입 | Nullable | 설명 |
|--------|------|:--------:|------|
| `id` | `uuid` | ❌ | PK |
| `title` | `text` | ❌ | 단어장 이름 |
| `major` | `text` | ❌ | 대상 전공 (예: `'computer_science'`) |
| `description` | `text` | ✅ | 단어장 설명 |
| `word_count` | `integer` | ❌ | 포함 단어 수 (default: 0) |
| `created_by` | `uuid` | ❌ | FK → `users.id` (관리자) |
| `created_at` | `timestamptz` | ❌ | 생성일시 |
| `updated_at` | `timestamptz` | ❌ | 수정일시 |

---

## 3. `official_words`

> 공식 단어장에 속한 단어 카드

| 컬럼명 | 타입 | Nullable | 설명 |
|--------|------|:--------:|------|
| `id` | `uuid` | ❌ | PK |
| `wordbook_id` | `uuid` | ❌ | FK → `official_wordbooks.id` (cascade delete) |
| `english` | `text` | ❌ | 영어 단어 |
| `major_meaning` | `text` | ❌ | 전공 뜻 |
| `general_example` | `text` | ✅ | 일반 예문 |
| `major_example` | `text` | ✅ | 전공 예문 |
| `order_index` | `integer` | ❌ | 단어장 내 순서 |
| `created_at` | `timestamptz` | ❌ | 생성일시 |

---

## 4. `user_wordbooks`

> 사용자가 PDF→AI로 생성한 나만의 단어장 (최대 2개)

| 컬럼명 | 타입 | Nullable | 설명 |
|--------|------|:--------:|------|
| `id` | `uuid` | ❌ | PK |
| `user_id` | `uuid` | ❌ | FK → `users.id` (cascade delete) |
| `title` | `text` | ❌ | 단어장 이름 (PDF 파일명 기반) |
| `source_filename` | `text` | ✅ | 원본 PDF 파일명 |
| `word_count` | `integer` | ❌ | 포함 단어 수 (default: 0) |
| `created_at` | `timestamptz` | ❌ | 생성일시 |

**제약 조건**
- 사용자당 최대 2개: 트리거 또는 API 레벨에서 검증

---

## 5. `user_words`

> 나만의 단어장에 속한 단어 (PDF→AI 추출, 읽기 전용)

| 컬럼명 | 타입 | Nullable | 설명 |
|--------|------|:--------:|------|
| `id` | `uuid` | ❌ | PK |
| `wordbook_id` | `uuid` | ❌ | FK → `user_wordbooks.id` (cascade delete) |
| `english` | `text` | ❌ | 영어 단어 |
| `meaning` | `text` | ❌ | 뜻 (AI 추출) |
| `example` | `text` | ✅ | 예문 (AI 추출) |
| `order_index` | `integer` | ❌ | 단어장 내 순서 |
| `created_at` | `timestamptz` | ❌ | 생성일시 |

---

## 6. `attendance`

> 사용자 일별 출석 기록 및 스트릭 관리

| 컬럼명 | 타입 | Nullable | 설명 |
|--------|------|:--------:|------|
| `id` | `uuid` | ❌ | PK |
| `user_id` | `uuid` | ❌ | FK → `users.id` (cascade delete) |
| `checked_at` | `date` | ❌ | 출석 날짜 |
| `streak_count` | `integer` | ❌ | 연속 출석 일수 |
| `reward_given` | `boolean` | ❌ | 별가루 지급 여부 (default: false) |
| `created_at` | `timestamptz` | ❌ | 생성일시 |

**제약 조건**
- `(user_id, checked_at)` UNIQUE — 하루 1회 체크

---

## 7. `test_results`

> 퀴즈 Lv1 테스트 결과 저장

| 컬럼명 | 타입 | Nullable | 설명 |
|--------|------|:--------:|------|
| `id` | `uuid` | ❌ | PK |
| `user_id` | `uuid` | ❌ | FK → `users.id` (cascade delete) |
| `wordbook_id` | `uuid` | ❌ | 테스트 대상 단어장 ID |
| `wordbook_type` | `text` | ❌ | `'official'` \| `'user'` |
| `level` | `integer` | ❌ | 테스트 레벨 (MVP: 1) |
| `total_count` | `integer` | ❌ | 총 문제 수 |
| `correct_count` | `integer` | ❌ | 정답 수 |
| `accuracy` | `numeric(5,2)` | ❌ | 정답률 (%) |
| `reward_given` | `boolean` | ❌ | 별가루 지급 여부 |
| `taken_at` | `timestamptz` | ❌ | 테스트 수행 시각 |

---

## 🔗 ERD 관계도

```
auth.users (Supabase)
    │
    └── users (1:1)
            │
            ├── user_wordbooks (1:N, cascade)
            │       └── user_words (1:N, cascade)
            │
            ├── attendance (1:N, cascade)
            │
            └── test_results (1:N, cascade)

users (admin role)
    └── official_wordbooks (1:N)
            └── official_words (1:N, cascade)
```

---

## 🔒 RLS (Row Level Security) 정책

| 테이블 | 정책 |
|--------|------|
| `users` | 본인 데이터만 SELECT/UPDATE |
| `official_wordbooks` | 전체 SELECT / admin만 INSERT·UPDATE·DELETE |
| `official_words` | 전체 SELECT / admin만 INSERT·UPDATE·DELETE |
| `user_wordbooks` | 본인 데이터만 CRUD |
| `user_words` | 본인 단어장 소속 데이터만 SELECT |
| `attendance` | 본인 데이터만 CRUD |
| `test_results` | 본인 데이터만 CRUD |
