# EduLex MVP 개발 진행 정리

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스 | 전공 어휘 학습 웹 플랫폼 (EduLex) |
| 기술스택 | React, Tailwind CSS, Supabase, Figma, Gemini 2.0 Flash API |
| 팀 구성 | 5명 (개발 4명 + 서기 1명) |
| 방식 | 변형 스크럼 — 2팀 병렬 개발 |
| Sprint 기간 | 1주 |
| 제출 기한 | 2026-05-08 (금) 오후 5시 |

---

## 2. 팀 분배

### 팀A (FE1 + BE1) — 기반 인프라 + 외부 API

| 단계 | SBI | 내용 |
|------|-----|------|
| 1단계 | L00 | 랜딩 페이지 (FE 전담, 백엔드 없음) |
| 1단계 | L01 | 회원가입 |
| 2단계 | L02 | 사용자 로그인 |
| 2단계 | L05 | 관리자 로그인 및 권한 부여 |
| 3단계 | A01 | 공식 단어장 CRUD |
| 3단계 | H04 | PDF → AI 단어장 생성 바 (Gemini API) |
| 4단계 | H05 | 별가루 실시간 조회 |

### 팀B (FE1 + BE1) — UX/게이미피케이션 + 단어장 소비

| 단계 | SBI | 내용 | 의존성 |
|------|-----|------|--------|
| 1단계 | H01 | 캐릭터 + 전공 선택 + 칭호 선택 | 팀A L01/L02 완료 후 시작 |
| 2단계 | H02 | 출석 체크 / 스트릭 | |
| 2단계 | N01 | 공식 단어장 조회 | H01 전공 상태 연동 |
| 3단계 | N02 | 나만의 단어장 조회 | 팀A H04 완료 후 연동 |
| 4단계 | N03 | 테스트 (퀴즈 Lv1) | |
| 4단계 | U04 | 단어장별 학습 진행률 | |

> **분배 핵심 이유 (v1.5 재조정):**
> - H04(PDF→AI)는 외부 API 독립 작업 → 팀A
> - N01(공식 단어장)은 H01 전공 상태를 공유해야 연동 충돌 없음 → 팀B로 교환

---

## 3. Sprint Backlog 버전별 변경 이력

| 버전 | 주요 변경 |
|------|-----------|
| v1.0 | 최초 작성 |
| v1.1 | AI API: GEMINI → OpenAI로 변경 |
| v1.2 | 회원가입 시 전공 선택 제거(H01로 이동), 나만의 단어장 수동 CRUD 제거, 테스트 Lv1만 MVP |
| v1.3 | H01 칭호 선택 UI 추가, N01 전공 연동 명시, U05 MVP 제외 |
| v1.4 | N02 단어장 최대 2개 제한, 삭제 기능 포함, 페이지 레이아웃 확정 |
| v1.5 | H04↔N01 팀 교환 — 의존성·난이도 균형 재조정 |
| v1.6 | ERD 변경 반영 (star_dust_logs 트랜잭션, RLS, general_meaning 표시) |
| v1.7 | L00 랜딩 페이지 SBI 신규 추가 (REQ-004 반영) |
| v1.8 | 구현 중 기술 결함 수정 — OpenAI → Gemini 2.0 Flash, PDF multimodal 전환, JWT 인증 방식 변경, CORS 보완 |

---

## 4. MVP 선택 범위 (총 13개 PBI)

| 우선순위 | 포함 항목 | 제외 항목 |
|----------|-----------|-----------|
| High 전부 | L00, L01, L02, L05, A01, H04, H05, N01, N02, N03 | A02 (MVP 핵심 무관) |
| Medium 일부 | H01, H02, U04 | L03, L04, H03, H06 등 |
| Low | 전부 제외 | U05(오답노트), 랭킹, 커뮤니티 등 |

---

## 5. 실제 구현 현황

| SBI | 구현 파일 | 상태 |
|-----|-----------|------|
| L00 | `edulex/src/pages/LandingPage.jsx` | 완료 |
| L01 | `edulex/src/pages/SignupPage.jsx` | 완료 |
| L02 | `edulex/src/pages/LoginPage.jsx`, `edulex/src/context/AuthContext.jsx` | 완료 |
| L05 | `edulex/src/pages/AdminLoginPage.jsx` | 완료 |
| A01 | `edulex/src/pages/AdminWordbookPage.jsx` | 완료 |
| H01 | `edulex/src/components/CharacterPreview.jsx`, `edulex/src/context/MajorContext.jsx` | 완료 |
| H02 | `edulex/src/components/AttendanceStreak.jsx` | 완료 |
| H04 | `edulex/src/components/PdfUploadBar.jsx`, `edulex/supabase/functions/create-wordbook-from-pdf/index.ts` | 완료 (※ API 키 소진) |
| H05 | `edulex/src/hooks/useStarDust.js` | 완료 |
| N01 | `edulex/src/pages/OfficialWordbookPage.jsx` | 완료 |
| N02 | `edulex/src/pages/MyWordbookPage.jsx` | 완료 |
| N03 | `edulex/src/pages/QuizPage.jsx` | 완료 |
| U04 | `edulex/src/pages/DashboardPage.jsx` | 완료 |

**DB / 인프라:**
- `edulex/supabase/migrations/20260420_init.sql` — DB 스키마 전체 (RLS 포함)
- `edulex/supabase/functions/create-wordbook-from-pdf/index.ts` — Edge Function

---

## 6. 핵심 기술적 이슈 및 해결 (v1.8)

| 문제 | 해결 |
|------|------|
| OpenAI API 모델 가용성 문제 | Gemini 2.0 Flash로 교체 |
| PDF 텍스트 바이너리 디코딩 한계 | Gemini multimodal inline_data 방식으로 전환 |
| 대용량 PDF 스택 오버플로 | base64 인코딩 32KB 청크 단위 처리 |
| JWT ES256 호환성 문제 | --no-verify-jwt 배포 + 내부 Auth REST API 검증으로 대체 |
| CORS 오류 | x-client-info, apikey 헤더 추가 보완 |
| **미해결** | Gemini API 키 할당량 소진 → 새 Google AI Studio API 키 발급 후 secrets set 필요 |

---

## 7. 통합 테스트 체크리스트 (Sprint 마지막 단계)

- [ ] 팀A ↔ 팀B API 연동 확인 (인증 토큰, 사용자 데이터 공유)
- [ ] H01 전공 선택 → N01 공식 단어장 자동 갱신 연동 확인
- [ ] 별가루 지급 흐름 전체 테스트 (출석 → H05 실시간 반영, 테스트 참여 → 지급)
- [ ] star_dust_logs 감사 로그 정합성 확인 (지급 시마다 로그 기록, 잔액 일치)
- [ ] PDF → Gemini 2.0 Flash API → 단어장 생성 E2E 테스트
- [ ] 단어장 2개 초과 생성 차단 확인 (API 레벨 + DB 트리거 이중 검증)
- [ ] 퀴즈 Lv1 동작 및 결과 저장 확인
- [ ] test_results 저장 시 wordbook_id 서버 검증 확인 (잘못된 ID 거부 여부)
- [ ] 관리자 권한 분리 보안 테스트 (일반 사용자가 admin API 접근 불가 확인)
- [ ] RLS 정책 전체 확인 (각 테이블별 본인 데이터만 접근 가능)
- [ ] Supabase Realtime 동기화 확인
