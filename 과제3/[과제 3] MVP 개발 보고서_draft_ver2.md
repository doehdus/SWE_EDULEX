# [과제 3] MVP 개발 보고서

**팀명:** [조 이름]
**제출 기한:** 2026년 5월 8일(금) 오후 5시
**파일명:** SE 과제3_[조이름].pptx

---

## 목차

1. 표지
2. AI 활용 방법론 선정 과정
3. Product Backlog (AI 버전 관리)
4. Sprint Goal & Sprint Backlog (AI 버전 관리)
5. 개발 단계 — Lesson Learned & 토큰 최적화
6. Prompt 작성을 통한 구현 설명
7. Sprint Increment (시연 영상)
8. Sprint Review 결과
9. Sprint Retrospective

---

## 1. AI 활용 방법론 선정 과정

### 1-1. 방법론 조사 배경

팀 전원이 AI를 어떻게 개발에 통합할지 논의하는 과정에서, 최근 개발 커뮤니티와 유튜브에서 활발하게 논의되는 세 가지 방향성을 조사하였다.

### 1-2. 3가지 방법론 설명

| 방법론 | 핵심 개념 | 특징 |
|--------|-----------|------|
| **프롬프트 엔지니어링** | 단일 요청의 품질을 높이는 기법 | 역할 부여(페르소나), Few-shot, Chain-of-thought 등 — 개별 프롬프트 품질에 집중 |
| **컨텍스트 엔지니어링** | AI에게 제공하는 맥락(배경·구조·히스토리)을 설계하는 기법 | 프로젝트 구조·ERD·히스토리를 사전 주입하여 세션 전반의 맥락 일관성 확보 |
| **하네스(Harness) 엔지니어링** | 훅·자동화 파이프라인으로 AI 작업 흐름 자체를 자동화 | CI/CD 연동, 에이전트 파이프라인 — 1인 개발 또는 완전 자동화 환경에서 극대화 |

### 1-3. 팀에 맞는 방법론 채택 이유

하네스 엔지니어링은 1인 개발 또는 CI/CD가 완전히 갖춰진 환경에서 극대화된다. 우리 팀은 **5인(개발 4 + 서기 1), 변형 스크럼, 2팀 병렬 개발** 구조이므로, 자동화보다 **인간 리뷰 루프를 유지하는 것이 정확성과 팀 소통 측면에서 더 적합하다**고 판단하였다.

| 방법론 | 채택 여부 | 근거 |
|--------|-----------|------|
| 프롬프트 엔지니어링 | ✅ 도입 | 페르소나 지정 + 단계적 지시로 출력 품질 향상 |
| 컨텍스트 엔지니어링 | ✅ 적극 도입 | 백로그·ERD·팀 구조를 사전 주입하여 맥락 일관성 확보 |
| 하네스 엔지니어링 | ⚠️ 제한적 도입 | 버전 태그 규칙 등 형식 고정에만 부분 적용 |

### 1-4. 우리 팀이 선택한 AI 활용 전략

> **"AI는 초안을 빠르게 생성하고, 사람이 정확성을 보장한다"**

- **컨텍스트 엔지니어링**: 백로그·ERD·팀 구조를 사전에 AI에게 주입하여 맥락 일관성 확보
- **프롬프트 엔지니어링**: 페르소나 지정 + 단계적 지시로 출력 품질 향상
- **하네스 일부**: 버전 태그(`[NEW]`, `[UPD]`, `[DEL]`)를 규칙으로 고정하여 AI가 형식을 이탈하지 않도록 제약

AI가 자동 생성한 결과물은 반드시 담당 팀원(또는 서기)이 리뷰하는 워크플로를 유지한다.

---

## 2. Product Backlog — AI 버전 관리 프롬프트 & 프로세스

> **스프린트 구성 변경 공지:** 기존 개발 4명 + 서기 1명으로 계획했으나, 개발 시간 부족 판단으로 이번 스프린트는 **전원 5명 개발(팀A 2명 + 팀B 3명)**으로 진행하였다. 서기는 개발에 참여하되 AI 버전 관리 리뷰 역할을 병행하였다.

### 2-1. AI 버전 관리 프로세스

Product Backlog는 회의 결과를 AI에게 입력하여 버전을 갱신하는 방식으로 관리하였다. 단순 AI 작성이 아닌 **회의 → AI 업데이트 → 서기 리뷰 → 노션 반영**의 4단계 루프를 고수하였다.

```
회의 결과 도출
    ↓
AI에게 변경 내용 전달 (컨텍스트: 현재 백로그 전체 + 회의 결정사항)
    ↓
AI가 버전 태그([NEW]/[UPD]/[DEL]) 적용하여 백로그 갱신
    ↓
서기가 회의록과 AI 출력 일치 여부 리뷰 (불일치 시 재요청)
    ↓
노션 공유 문서 반영 (확정본)
```

### 2-2. Product Backlog 버전 이력

| 버전 | 주요 변경 내용 | 트리거 |
|------|---------------|--------|
| v1.0 | 최초 작성 (이미지 원본 백로그 기반) | 1차 팀 회의 |
| v1.1 | PBI 세분화 — 인증·메인·네비게이션·대시보드·관리자 항목 확장 | AI 구체화 제안 + 팀 승인 |
| v1.2 | 회원가입 전공 선택 제거, AI API OpenAI로 명시, MVP 범위 확정 | 2차 팀 회의 결정사항 |
| v1.3 | 나만의 단어장 세부 사양 확정 (최대 2개 제한, 삭제 기능) | 3차 팀 회의 결정사항 |
| v1.4 | ERD 변경 반영 (star_dust_logs, general_meaning 등) | DB 설계 회의 반영 |

### 2-3. DoD 연동 — 서기 리뷰 체크리스트

Sprint Backlog 작성 과정에서 추가·변경된 사항이 Product Backlog에 반영될 때, **서기가 아래 항목을 리뷰하여 노션에 확정 반영**하였다.

> ※ DoD의 AI 산출물 품질 보증 항목(B6~B9)과 연동 — DoD 준수 방식은 6절 프롬프트 설명에서 상세 기술

- [ ] 회의에서 결정한 모든 사항이 백로그에 반영되었는가?
- [ ] 회의에서 논의되지 않은 내용이 AI에 의해 임의로 추가되지 않았는가?
- [ ] 버전 태그(`[NEW]`, `[UPD]`, `[DEL]`)가 실제 변경 내용과 일치하는가?
- [ ] 변경 이력 주석(※ v1.x:)이 정확하게 기록되었는가?

### 2-4. Product Backlog (v1.4 확정본)

| ID | Title | User Story | Constraints | 우선순위 |
|----|-------|-----------|-------------|---------|
| L01 | 회원가입 | 사용자는 이메일 인증, 비밀번호, 닉네임을 입력하여 계정을 생성할 수 있다. | 이메일 인증 필수, 닉네임 중복 불가 | High |
| L02 | 사용자 로그인 | 사용자는 이메일/비밀번호 또는 소셜 계정으로 빠르게 접속할 수 있다. | 일반 로그인 + OAuth 모두 지원 | High |
| L05 | 관리자 로그인 | 관리자는 별도 계정으로 로그인하여 관리자 전용 페이지에 접근할 수 있다. | 일반 사용자와 관리자 권한 분리 | High |
| H01 | 캐릭터 프리뷰 + 전공/칭호 선택 | 사용자는 메인 화면에서 캐릭터 상태를 확인하고 전공(최대 2개)과 칭호를 선택할 수 있다. | 전공 변경 시 공식 단어장 자동 갱신 연동 | Medium |
| H02 | 출석 체크 / 스트릭 | 사용자는 메인 화면에서 하루 1회 출석을 확인하고 책갈피 보상을 받을 수 있다. | 책갈피 지급 시 star_dust_logs 감사 로그 트랜잭션 처리 | Medium |
| H04 | PDF → AI 단어장 생성 | 사용자는 PDF를 업로드하여 AI가 자동 생성한 단어장을 즉시 만들 수 있다. | OpenAI API 연동, 단어장 2개 초과 시 생성 차단 | High |
| H05 | 책갈피 실시간 조회 | 사용자는 메인 화면에서 보유 중인 책갈피 수량을 실시간으로 확인할 수 있다. | Supabase Realtime 동기화 | High |
| N01 | 공식 단어장 조회 | 사용자는 선택 전공을 기반으로 공식 단어장 목록과 단어 카드를 조회할 수 있다. | H01 전공 선택 상태 연동, general_meaning optional 표시 | High |
| N02 | 나만의 단어장 조회 | 사용자는 PDF→AI로 생성된 단어장 목록과 단어 카드를 조회하고 삭제할 수 있다. | 단어장 최대 2개, 삭제 시 cascade 처리 | High |
| N03 | 테스트 (Lv1) | 사용자는 단어장을 선택해 Lv1 퀴즈를 풀고 결과와 책갈피 보상을 받을 수 있다. | 뜻→영어 4지선다, 책갈피 트랜잭션, wordbook_id 서버 검증 | High |
| U04 | 단어장별 학습 진행률 | 사용자는 보유한 각 단어장의 학습 진행률을 퍼센트로 확인할 수 있다. | 학습 완료 단어 수 / 전체 단어 수 계산 | Medium |
| A01 | 공식 단어장 CRUD | 관리자는 공식 단어장의 단어를 추가·수정·삭제할 수 있다. | 관리자 권한 검증 미들웨어 적용 | High |

---

## 3. Sprint Goal & Sprint Backlog — AI 버전 관리 프롬프트 & 프로세스

### 3-1. Sprint Goal

> **"사용자가 EduLex에 가입하고, 전공 기반 공식 단어장과 AI가 생성한 나만의 단어장으로 학습을 시작하며, 퀴즈를 통해 암기 수준을 점검하고 책갈피 보상을 받을 수 있다"**

*단순 기능 목록이 아닌, 사용자가 경험하는 가치 흐름으로 정의하였다.*

### 3-2. Sprint Backlog AI 버전 관리 프로세스

Sprint Backlog도 Product Backlog와 동일한 4단계 루프로 관리하였다. Sprint Backlog 작성 과정에서 새롭게 추가·구체화된 사항은 **서기가 리뷰하여 Product Backlog에도 역반영**하였다.

```
Sprint Backlog 작성/수정 회의
    ↓
AI에게 변경 내용 전달 (컨텍스트: Product Backlog 확정본 + 현재 SB 전체)
    ↓
AI가 SBI 형식(User Story + AC 체크리스트) 으로 갱신
    ↓
서기 리뷰 → Product Backlog 업데이트 필요 항목 추출 → PB에 역반영
    ↓
노션 확정 반영
```

### 3-3. Sprint Backlog — AC 체크리스트 방식 채택 근거

스크럼에서 SBI의 완료 기준을 정의하는 방법으로 **Acceptance Criteria(AC)** 를 쓰는 것이 일반적이다. 우리 팀은 AC를 **FE/BE 세부 작업 체크리스트 형태**로 작성하였다.

- **병렬 개발 환경**: FE/BE 작업을 명확히 분리하여 담당자가 즉시 확인할 수 있는 체크리스트가 협업에 더 적합
- **AI 프롬프트 입력 효율**: 세부 작업 목록을 그대로 프롬프트의 `[구현 대상]` 블록에 붙여넣기 가능
- **DoD와의 역할 분리**: 기능 완료 판단(검증)은 DoD가 담당 → SBI 레벨은 작업 단위로 역할 분리

### 3-4. Definition of Done (DoD)

> ※ 프롬프트 설명(6절)에서 각 SBI 구현 시 DoD 준수 방식도 함께 설명

우리 팀의 DoD는 **일반 개발 완료 기준**과 **AI 산출물 품질 보증 기준** 두 축으로 구성된다.

#### [A] 일반 개발 완료 기준

| # | DoD 항목 |
|---|---------|
| A1 | 코드가 main branch에 merge됨 |
| A2 | ESLint/빌드 오류 없음 |
| A3 | Supabase RLS 정책 적용 및 동작 확인 |
| A4 | 각 SBI 세부 작업 체크리스트 전체 완료 |
| A5 | 팀A ↔ 팀B 통합 테스트 통과 |
| A6 | 서기가 기능이 스프린트 목표와 일치하는지 확인 |

#### [B] AI 산출물 품질 보증 기준

| # | DoD 항목 |
|---|---------|
| B1 | AI 생성 코드를 담당자가 직접 실행하여 정상 동작 확인 |
| B2 | AI가 프롬프트의 [제약] 조건을 모두 준수했는지 항목별 대조 확인 |
| B3 | AI가 임의로 추가한 기능·로직이 없는지 확인 |
| B4 | 보안 제약 준수 확인 — 정답 클라이언트 노출 금지, role 클라이언트 저장 금지, API 키 하드코딩 금지 |
| B5 | AI 리뷰에서 발견된 오류 및 재요청 내용이 최종 코드에 반영되었는지 확인 |
| B6 | 서기가 회의 결정사항과 AI 업데이트 결과를 1:1 대조하여 누락·추가 없음 확인 |
| B7 | 버전 태그(`[NEW]` `[UPD]` `[DEL]`)가 실제 변경 내용과 일치하는지 확인 |
| B8 | AI가 지시하지 않은 항목을 임의로 수정·삭제하지 않았는지 확인 |
| B9 | 변경 이력 주석(`※ v1.x:`)이 각 PBI/SBI에 정확히 기록되었는지 확인 |

### 3-5. Sprint Backlog — 팀 분배 (v1.5 기준)

**Sprint 기간:** 1주 (병렬 개발 — 팀A: FE1+BE1 / 팀B: FE1+BE1+서기(개발 병행))

| 팀 | 개발 단계 | 담당 SBI |
|----|---------|---------|
| **팀A** | 1단계 | SBI-L01 회원가입 |
| | 2단계 | SBI-L02 로그인, SBI-L05 관리자 로그인 |
| | 3단계 | SBI-A01 공식단어장 CRUD, **SBI-H04** PDF→AI 생성 |
| | 4단계 | SBI-H05 책갈피 실시간 조회 |
| **팀B** | 1단계 | SBI-H01 캐릭터 + 전공 선택 *(팀A 인증 완료 후 시작)* |
| | 2단계 | SBI-H02 출석/스트릭, **SBI-N01** 공식단어장 조회 |
| | 3단계 | SBI-N02 나만의 단어장 *(팀A H04 완료 후 연동)* |
| | 4단계 | SBI-N03 테스트(Lv1), SBI-U04 학습 진행률 |

> **팀A↔팀B 교환 근거 (v1.5):** H04(PDF→AI)는 OpenAI API 독립 작업이므로 팀A가 전담. N01(공식단어장)은 H01 전공 선택 전역 상태와 공유해야 하므로 같은 팀B가 담당해야 연동 충돌 없음.

### 3-6. Sprint Backlog 버전 이력

| 버전 | 주요 변경 내용 |
|------|---------------|
| v1.0–v1.2 | 최초 작성 → SBI 구체화 → 기술스택 명시 |
| v1.3 | 전공 선택 위치 변경, 나만의 단어장 수동 CRUD 제거 |
| v1.4 | 단어장 최대 2개 제한 및 삭제 기능 확정 |
| v1.5 | H04↔N01 팀 교환 (의존성·난이도 균형 재분배) |
| v1.6 | ERD 변경 반영 (트랜잭션, 서버 검증, 보안 강화) |

---

## 4. 개발 단계 — Lesson Learned & 토큰 최적화

### 4-1. 개발 과정에서의 Lesson Learned

개발 단계 초기에는 프롬프트에 불필요한 설명이 많고, 컨텍스트를 제대로 주입하지 않아 AI가 의도와 다른 코드를 생성하는 경우가 잦았다. 이를 통해 얻은 주요 교훈은 다음과 같다.

| # | Lesson Learned | 적용 방식 |
|---|---------------|---------|
| 1 | 맥락 없는 프롬프트는 AI가 "일반적인 코드"를 생성함 → 프로젝트 구조·스택을 항상 먼저 주입 | 모든 프롬프트에 `[컨텍스트]` 블록 고정 |
| 2 | 제약 조건을 명시하지 않으면 AI가 보안 취약한 코드를 생성 (클라이언트 정답 노출, localStorage role 저장 등) | `[제약]` 블록에 보안 항목 필수 포함 |
| 3 | AI 산출물을 실행 없이 merge → 실제 동작 오류 발견이 늦어짐 | DoD B1: 반드시 직접 실행 후 merge |
| 4 | "한번에 다 만들어줘" 식의 넓은 요청은 오류 포함 확률이 높음 | SBI 단위로 요청, sector를 정해 구체화하여 수정 지시 |
| 5 | 시험 기간 중 조급함으로 인해 계획한 프롬프트 구조를 따르지 않고 무작위로 입력 → 오류 증가 | 시험 종료 후 시간 투자하여 재정비하기로 합의 |

### 4-2. 토큰 줄이기 — 기존 프롬프트 vs 개선 프롬프트 비교

AI 호출 시 불필요한 반복 설명을 줄이고, 핵심 정보만 압축하여 토큰 효율을 높였다.

#### 비교 예시: SBI-L01 회원가입 FE 구현 프롬프트

**기존 프롬프트 (컨텍스트 엔지니어링 부족)**
```
회원가입 페이지를 만들어줘. React랑 Tailwind CSS 쓰고, Supabase Auth 사용해.
이메일이랑 비밀번호, 닉네임 입력받고, 이메일 인증도 해야 해.
닉네임 중복 확인도 필요하고, 회원가입 성공하면 이메일 인증 안내 화면 보여줘.
비밀번호는 최소 8자 이상이어야 하고, 전공 선택은 나중에 로그인하고 나서 해.
```
→ **문제점:** 프로젝트 파일 구조 없음, Supabase 클라이언트 경로 불명확, 닉네임 중복 검사 방식 미지정 → AI가 Supabase 직접 쿼리로 구현, FE/BE 역할 혼재

**개선 프롬프트 (컨텍스트 엔지니어링 적용)**
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase Auth
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-L01 회원가입 FE]
  1. 회원가입 폼 UI (이메일, 비밀번호, 닉네임 입력 필드)
  2. 이메일 인증 안내 화면 (회원가입 완료 후)

[제약]
- 전공 선택 UI 없음 (로그인 후 H01에서 선택)
- 비밀번호 최소 8자 클라이언트 검증 포함
- 닉네임 중복 검사는 BE API 호출 (onBlur 시 비동기)
- 회원가입 성공 시 이메일 인증 안내 화면으로 전환 (페이지 이동 아님)
```
→ **개선 효과:** 역할 분리 명확, 보안 제약 명시, AI 오류 감소 / 토큰 약 30% 절감

---

## 5. Prompt 작성을 통한 구현 설명

### 5-1. 컨텍스트 엔지니어링 기반 공통 구조

모든 SBI 구현 프롬프트는 **`[컨텍스트] → [구현 대상] → [제약]` 3-블록 구조**를 공통으로 사용하였다.

공통 컨텍스트로는 기술스택(React, Tailwind CSS, Supabase), Supabase 클라이언트 경로(`src/utils/supabase.js`), React Router v6 정보를 모든 프롬프트에 사전 주입하였다.

#### 설계 단계에서 배운 것의 적용

| 설계 산출물 | 프롬프트 적용 방식 |
|------------|-----------------|
| ERD (다이어그램) | `[컨텍스트]` 블록에 관련 테이블 구조 직접 명시 |
| 아키텍처 다이어그램 | 폴더 구조, 컴포넌트 분리 기준을 `[제약]`에 고정 |
| 시퀀스 다이어그램 | FE/BE 역할 분리 및 API 호출 흐름을 `[구현 대상]`에 명시 |

#### 코딩 표준 적용

- **명명 규칙**: 컴포넌트 PascalCase, 훅 camelCase(`use` 접두사), 유틸 camelCase
- **아키텍처 및 폴더 구조**: `src/pages/`, `src/components/`, `src/utils/`, `src/context/` 분리
- **컴포넌트 분리 기준**: 독립적으로 재사용 가능한 UI 단위로 분리
- **기술 스택 제약**: Tailwind 클래스만 사용 (별도 CSS 파일 금지), 외부 UI 라이브러리 제한

#### Reduce the Waste — 확장성 고려 설계

불필요한 추가 기능을 나중에 넣기 편하도록 **높은 응집도(High Cohesion), 낮은 결합도(Low Coupling)** 원칙으로 작성하였다.

- 각 SBI 컴포넌트는 독립 단위로 분리 → 다른 SBI 변경이 영향을 최소화
- MajorContext처럼 전역 상태가 필요한 경우만 Context 사용, 나머지는 props 전달
- Post-MVP 기능(칭호 시스템, Lv2~4 테스트)을 위한 자리(placeholder)만 남기고 구현 배제

#### 수정 지시 프롬프트 구조

초기 구현 프롬프트 이후, 결과물을 확인하면서 **원하는 디자인이나 동작이 나올 때까지 수정 지시를 반복**하였다. 수정 지시는 다음 구조를 따랐다.

```
수정하고 싶은 sector(컴포넌트 + 구체적인 영역) 명시
    ↓
현재 어떻게 되어 있는지 / 무엇이 문제인지 설명
    ↓
어떻게 바꿔달라는지 구체적으로 요청
```

이 방식을 통해 AI에게 **"무엇을", "왜", "어떻게"** 를 한 번에 전달함으로써 재질문 없이 원하는 결과물로 수렴하는 시간을 단축하였다.

---

### 5-2. SBI별 구현 프롬프트 상세

> 각 SBI마다 **구현 초기 프롬프트** → **수정 지시 프롬프트 (1차 → 2차 → 3차...)** 순서로 기술한다.
> 수정 지시는 sector(영역)를 특정하여 구체적으로 작성하였으며, 원하는 결과물이 나올 때까지 반복하였다.

---

#### SBI-L00 | 랜딩 페이지

**FE 구현 프롬프트:**
```
[컨텍스트]
기술스택: React, Tailwind CSS
라우터: React Router v6 / Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-L00 랜딩 페이지]
  1. 히어로 섹션 UI (슬로건 + 로그인/회원가입 CTA 버튼)
  2. 출시 배경 섹션 (전공 어휘 문제 + 게이미피케이션 근거)
  3. 장점·소개 섹션 (주요 기능 카드: 공식 단어장, AI 단어장, 테스트, 랭킹)
  4. 사용 방법 섹션 (회원가입 → 전공 선택 → 학습 단계별 안내)
  5. 로그인/회원가입 페이지 라우팅 연결
  6. 로그인 상태에서 랜딩 접근 시 /main으로 리다이렉트

[제약]
- Tailwind 클래스만 사용 (별도 CSS 파일 없음)
- 백엔드 API 호출 없음 (정적 콘텐츠 + 라우팅만)
- 로그인 상태 확인: Supabase Auth의 getSession() 사용
- 각 섹션은 독립 컴포넌트로 분리 (LandingHero, LandingBackground, LandingFeatures, LandingGuide)
```

**수정 지시 1차 (sector: LandingHero — 전체 레이아웃):**
```
LandingHero 섹션 레이아웃 수정해줘.
지금 슬로건이랑 버튼이 세로로 쌓여 있어서 답답해 보이고, 배경도 단색이라 밋밋해.
섹션 높이 h-screen으로 키우고, 배경에 from-indigo-900 via-purple-900 to-slate-900 그라디언트 넣어줘.
슬로건 텍스트 크기도 text-5xl 이상으로 키우고, 로그인/회원가입 버튼 두 개 가로로 나란히 놓아줘.
```

**수정 지시 2차 (sector: LandingHero — 배경 별 효과):**
```
LandingHero 배경에 책갈피 느낌 살려줘.
그라디언트만 있으니까 너무 정적으로 보여.
작은 원형 점들을 absolute로 배경에 랜덤하게 뿌려주고 animate-pulse로 깜빡이게 해줘.
크기는 w-1~w-2 정도, 투명도는 opacity-20~60 사이로 다양하게 섞어서.
```

**수정 지시 3차 (sector: LandingFeatures — 기능 카드 디자인):**
```
LandingFeatures 기능 카드들이 너무 밋밋해.
지금 흰색 박스인데 배경이 어두운 색이라 카드가 붕 떠 보여.
bg-white/10 backdrop-blur-sm으로 반투명 글라스 느낌으로 바꿔주고,
카드 상단에 각 기능 이모지 추가해줘 (공식단어장 📚, AI단어장 🤖, 테스트 ✏️, 랭킹 🏆).
카드 hover 시 scale-105 효과랑 gap도 좀 더 넓혀줘.
```

**수정 지시 4차 (sector: LandingPage — 리다이렉트 깜빡임):**
```
LandingPage에서 로그인된 상태로 들어오면 랜딩 화면이 잠깐 보였다가 /main으로 이동하는 문제가 있어.
지금 세션 확인이 동기로 되어 있어서 그래.
useEffect 안에서 getSession() async/await로 처리하고, 확인 중에는 로딩 스피너 보여줘.
세션 있으면 /main 리다이렉트, 없으면 랜딩 렌더링하면 돼.
```

**BE:** 해당 없음 (백엔드 작업 없는 정적 페이지)

---

#### SBI-L01 | 회원가입

**FE 구현 프롬프트:**
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase Auth
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-L01 회원가입 FE]
  1. 회원가입 폼 UI (이메일, 비밀번호, 닉네임 입력 필드)
  2. 이메일 인증 안내 화면 (회원가입 완료 후 "인증 이메일을 확인하세요" 안내)

[제약]
- 전공 선택 UI 없음 (로그인 후 H01에서 선택)
- 비밀번호 최소 8자 클라이언트 검증 포함
- 닉네임 중복 검사는 BE API 호출 (onBlur 시 비동기 검사)
- 회원가입 성공 시 이메일 인증 안내 화면으로 전환 (페이지 이동 아님)
```

**수정 지시 1차 (sector: SignupPage — 전체 레이아웃):**
```
SignupPage 폼 레이아웃 고쳐줘.
지금 폼이 화면 전체 너비 차지해서 너무 넓어 보이고, 기본 HTML 스타일 그대로라 촌스러워.
카드 max-w-md 중앙 정렬로 잡고, 배경은 bg-gray-50, 카드에 shadow-lg rounded-2xl p-8 적용해줘.
입력 필드는 border border-gray-300에 focus 시 ring-2 ring-indigo-500 넣고,
카드 상단에 EduLex 타이틀도 추가해줘.
```

**수정 지시 2차 (sector: SignupForm — 닉네임 중복 검사 피드백):**
```
SignupForm에서 닉네임 중복 검사 결과가 콘솔에만 찍히고 화면에 아무것도 안 나와.
그리고 지금 Supabase 직접 쿼리로 만들었는데 FE에서 직접 DB 접근은 안 돼.
BE API GET /api/check-nickname?nickname=... 호출로 바꾸고,
검사 중엔 필드 오른쪽에 스피너, 사용 가능하면 초록 체크 + "사용 가능한 닉네임입니다",
중복이면 빨간 X + "이미 사용 중인 닉네임입니다" 표시해줘.
```

**수정 지시 3차 (sector: SignupForm — 비밀번호 필드 + 버튼 상태):**
```
SignupForm 비밀번호 쪽이랑 버튼 수정해줘.
지금 비밀번호 8자 미만인데도 가입 버튼이 눌려.
그리고 비밀번호 입력할 때 show/hide 토글이 없어서 불편해.
비밀번호 필드 오른쪽에 눈 아이콘 넣어서 토글 되게 하고,
비밀번호 8자 미만이거나 닉네임 중복 확인 안 된 상태면 버튼 disabled에 opacity-50 걸어줘.
```

**BE 구현 프롬프트:**
```
[컨텍스트]
기술스택: Supabase (Auth + DB)
DB 테이블: users (id, email, nickname, major, active_title, star_dust, created_at)
RLS: users 테이블 — 본인만 SELECT/UPDATE 가능

[구현 대상: SBI-L01 회원가입 BE]
  1. Supabase Auth 이메일 인증 연동 (signUp + 이메일 인증 활성화)
  2. 닉네임 중복 검사 API (GET /api/check-nickname?nickname=...)
  3. 사용자 기본 정보 저장 (users 테이블 INSERT, major는 null 허용)

[제약]
- Supabase Auth signUp 후 users 테이블에 트리거 또는 별도 INSERT로 동기화
- 닉네임 중복 검사: users 테이블 SELECT count(*) WHERE nickname = ?
- major 필드는 null 허용 (회원가입 시 전공 선택 없음)
- API 응답 형식: { available: true/false }
```

**수정 지시 1차 (sector: users 트리거 — star_dust 기본값):**
```
users 트리거 INSERT 쪽 수정해줘.
지금 신규 가입하면 star_dust가 null로 들어가.
users 테이블 star_dust 컬럼에 DEFAULT 0 추가하고, 트리거 INSERT 구문에 star_dust = 0 명시해줘.
```

**수정 지시 2차 (sector: check-nickname API — 대소문자 처리):**
```
check-nickname API에서 대소문자 구분 없이 중복 처리가 안 되고 있어.
"EduLex"로 가입한 사람이 있는데 "edulex"로도 가입이 돼버려.
쿼리에 lower() 씌워서 대소문자 무시하게 바꿔줘.
```

---

#### SBI-L02 | 사용자 로그인

**FE 구현 프롬프트:**
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase Auth
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-L02 로그인 FE]
  1. 로그인 폼 UI (이메일/비밀번호 입력)
  2. OAuth 버튼 (Google 소셜 로그인)
  3. 로그인 성공 시 /main으로 리다이렉트

[제약]
- 일반 로그인: supabase.auth.signInWithPassword()
- OAuth: supabase.auth.signInWithOAuth({ provider: 'google' })
- 로그인 실패 시 에러 메시지 한국어로 표시
- 로그인 상태는 AuthContext로 전역 관리
```

**수정 지시 1차 (sector: LoginPage — 전체 레이아웃):**
```
LoginPage 디자인이 SignupPage랑 달라서 이질감 나.
SignupPage처럼 max-w-md 카드 중앙 정렬, shadow-lg rounded-2xl p-8, 배경 bg-gray-50으로 맞춰줘.
```

**수정 지시 2차 (sector: LoginPage — Google 버튼 redirectTo):**
```
LoginPage에서 Google 로그인 누르면 완료 후 빈 화면으로 이동해.
signInWithOAuth에 redirectTo 옵션을 안 넣어서 그래.
options: { redirectTo: `${window.location.origin}/auth/callback` } 추가해줘.
그리고 구글 버튼 디자인도 공식 스타일처럼 흰 배경에 테두리, 구글 로고 아이콘 넣어줘.
```

**BE:** Supabase Auth 공식 문서 패턴 그대로 적용 — 수정 없음

---

#### SBI-L05 | 관리자 로그인 및 권한 부여

**FE 구현 프롬프트:**
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase Auth
라우팅: React Router v6 (PrivateRoute 패턴)

[구현 대상: SBI-L05 관리자 로그인 FE]
  1. 관리자 로그인 페이지 UI (/admin/login 경로, 일반 로그인과 별도)
  2. 관리자 전용 라우트 보호 (role 확인 후 비관리자 접근 차단)

[제약]
- 관리자 확인: users 테이블 role 필드가 'admin'인 경우만 허용
- 비관리자가 /admin 접근 시 /main으로 리다이렉트
- AdminRoute 컴포넌트로 분리하여 재사용 가능하게 구현
```

**수정 지시 1차 (sector: AdminRoute — role 확인 방식):**
```
AdminRoute에서 role을 localStorage에서 읽고 있어.
개발자 도구로 localStorage 값 바꾸면 관리자 페이지 들어올 수 있어서 위험해.
role 확인은 반드시 Supabase DB에서 users 테이블 직접 조회하는 걸로 바꾸고,
localStorage 읽는 코드는 다 지워줘.
```

**수정 지시 2차 (sector: AdminRoute — 로딩 중 깜빡임):**
```
AdminRoute에서 서버 role 조회하는 동안 화면이 깜빡이고, 네트워크 오류 나면 무한 로딩이 돼.
조회 중에는 로딩 스피너 보여주고, 실패하면 그냥 /main으로 보내줘.
isLoading state 써서 조회 끝난 후에 라우트 결정하게 해줘.
```

**BE 구현 프롬프트:**
```
[컨텍스트]
기술스택: Supabase (Auth + DB + RLS)
DB 테이블: users (id, role — 'user' | 'admin')

[구현 대상: SBI-L05 관리자 권한 BE]
  1. 관리자 역할(role) 구분 — users.role 필드 활용
  2. 관리자 전용 API 접근 시 role 검증
  3. Supabase RLS: admin 전용 테이블/작업은 role = 'admin' 조건으로 제한

[제약]
- RLS 정책: official_wordbooks/official_words의 INSERT/UPDATE/DELETE는 role='admin'만 허용
- 일반 사용자가 admin API 직접 호출 시 RLS에서 차단 (클라이언트 role 우회 불가)
- 초기 관리자 계정은 Supabase 콘솔에서 수동으로 role='admin' 설정
```

**수정 지시 1차 (sector: RLS 정책 — role 확인 방식):**
```
RLS 정책에서 auth.jwt() ->> 'role' 방식으로 했는데 지금 환경에서 동작을 안 해.
JWT 커스텀 클레임 설정이 따로 필요한 방식이라서.
users 테이블 서브쿼리 방식으로 바꿔줘:
(SELECT role FROM users WHERE id = auth.uid()) = 'admin'
```

---

#### SBI-H01 | 캐릭터 프리뷰 + 전공 선택 + 칭호 선택

**FE 구현 프롬프트:**
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase
전역 상태: React Context (MajorContext — 선택 전공 상태 전역 공유)
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-H01 캐릭터 프리뷰 + 전공/칭호 선택 FE]
  1. 캐릭터 이미지 표시 컴포넌트
  2. 레벨, 닉네임, 책갈피, 현재 선택 전공·칭호 표시 UI
  3. 전공 선택 UI — 드롭다운 또는 모달 (최대 2개 선택)
  4. 칭호 선택 UI — 보유 칭호 중 1개 선택, 없으면 비활성화
  5. 전공 변경 시 MajorContext 업데이트 → N01 공식 단어장 자동 갱신
  6. 상점 이동 버튼 배치 (버튼만, 페이지 구현 없음)

[제약]
- Tailwind 클래스만 사용
- 전공 최대 2개 선택: 이미 2개 선택 시 추가 선택 비활성화
- 칭호 시스템 Post-MVP: 칭호 목록 없으면 선택 UI 비활성화
- 전공 변경 → MajorContext의 setMajor 호출 필수 (N01 자동 갱신 트리거)
```

**수정 지시 1차 (sector: MajorSelector — 2개 초과 시 피드백):**
```
MajorSelector에서 전공 2개 선택 후에 다른 거 클릭해도 아무 반응이 없어.
비활성화는 되는데 왜 안 되는지 사용자가 몰라.
선택 안 되는 항목에는 opacity-40에 cursor-not-allowed 걸고, hover 시 "전공은 최대 2개까지 선택 가능합니다" 툴팁 보여줘.
선택된 항목은 bg-indigo-100 border-indigo-500에 체크 아이콘 표시해줘.
```

**수정 지시 2차 (sector: MajorSelector — MajorContext 업데이트 누락):**
```
MajorSelector에서 전공 선택하면 로컬 state는 바뀌는데 N01 단어장 목록이 안 바뀌어.
MajorContext setMajor 호출을 빠뜨린 것 같아.
전공 선택 핸들러에서 setMajor(selectedMajors) 호출 꼭 넣어줘.
BE PATCH 호출도 이 시점에 같이 해줘.
```

**수정 지시 3차 (sector: CharacterCard — 레이아웃 구조):**
```
CharacterCard가 캐릭터 이미지, 닉네임, 레벨, 책갈피, 전공이 다 세로로 늘어져 있어.
Figma 디자인이랑 다르고, 캐릭터 이미지도 너무 작아.
왼쪽에 캐릭터 이미지 w-32 h-32, 오른쪽에 텍스트 정보 2단 구조로 바꿔줘.
닉네임 text-xl font-bold, 레벨은 배지 스타일, 책갈피는 ⭐ 아이콘이랑 text-yellow-500으로 강조하고,
전공 태그는 rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 스타일로.
```

**BE:** RLS 정책 적용 확인 후 통과 — 수정 없음

---

#### SBI-H02 | 출석 체크 / 스트릭

**FE 구현 프롬프트:**
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-H02 출석 체크 / 스트릭 FE]
  1. 출석 체크 버튼 UI (클릭 시 출석 API 호출)
  2. 스트릭 시각화 UI (연속 출석일 수 표시)
  3. 당일 출석 완료 상태 표시 (버튼 비활성화)

[제약]
- 당일 출석 여부는 페이지 진입 시 BE API로 확인 (클라이언트 날짜 비교 금지)
- 출석 완료 시 책갈피 수량이 H05 Realtime으로 자동 갱신됨 (별도 처리 불필요)
- 스트릭 데이터는 BE API 응답값 사용
```

**수정 지시 1차 (sector: AttendanceButton — 출석 여부 판단):**
```
AttendanceButton에서 new Date().toLocaleDateString()으로 출석 여부 체크하고 있는데,
서버 시간대랑 다르면 오늘 출석했는데 미출석으로 뜨는 버그 생겨.
클라이언트 날짜 비교 코드 다 지우고, 페이지 진입 시 GET /api/attendance/today 호출해서
{ attended: true/false } 응답으로 버튼 상태 결정하게 바꿔줘.
```

**수정 지시 2차 (sector: AttendanceButton — 출석 완료 피드백):**
```
AttendanceButton 출석 완료 후에 버튼만 비활성화되고 아무 반응이 없어서 허전해.
책갈피를 받은 건지도 모르겠고.
출석 성공하면 버튼 텍스트 "출석 완료 ✓"로 바꾸고 bg-green-500으로 전환해줘.
그리고 "+10 책갈피 획득!" 토스트 알림도 fixed top-4 right-4에 2초 뒤에 사라지게 추가해줘.
```

**BE 구현 프롬프트:**
```
[컨텍스트]
기술스택: Supabase (DB + RLS)
DB 테이블: attendance (id, user_id, date, created_at), users (star_dust), star_dust_logs (id, user_id, change_amount, reason, ref_id, created_at)

[구현 대상: SBI-H02 출석 체크 BE]
  1. 출석 기록 저장 API — attendance 테이블 INSERT (오늘 날짜)
  2. 출석 보상 책갈피 지급 — DB 함수(트랜잭션):
     - users.star_dust += 보상량
     - star_dust_logs INSERT (change_amount=보상량, reason='attendance', ref_id=attendance.id)
  3. 스트릭 계산 로직 — 연속 출석일 수 반환
  4. 당일 출석 여부 조회 API

[제약]
- RLS: attendance 테이블 INSERT는 본인+오늘날짜만 허용 (중복 출석 방지)
- 책갈피 지급은 반드시 단일 트랜잭션으로 처리 (DB RPC 함수로 원자성 보장)
```

**수정 지시 1차 (sector: 출석 보상 로직 — 책갈피 지급 트랜잭션):**
```
출석 보상 책갈피 지급에서 users UPDATE랑 star_dust_logs INSERT를 쿼리 두 번으로 나눠서 하고 있는데,
중간에 logs INSERT 실패하면 책갈피는 지급됐는데 로그가 없는 상태가 돼.
Supabase DB RPC 함수 하나로 묶어서 트랜잭션 처리해줘. 실패하면 전체 롤백되어야 해.
```

---

#### SBI-H04 | PDF → AI 단어장 생성

**FE 구현 프롬프트:**
```
[컨텍스트]
기술스택: React, Tailwind CSS
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-H04 PDF 업로드 바 FE]
  1. 메인 화면 PDF 업로드 입력 바 UI
  2. 업로드 진행 상태 표시 (로딩 스피너 또는 프로그레스 바)
  3. 단어장 2개 보유 시 업로드 바 비활성화

[제약]
- 파일 타입 제한: PDF만 허용 (accept=".pdf")
- 업로드 완료 후 AI 추출 중 로딩 상태 표시
- 단어장 개수는 BE API로 확인 (페이지 진입 시 조회)
- 생성 완료 시 나만의 단어장 목록 자동 갱신
```

**수정 지시 1차 (sector: PdfUploadBar — 비활성화 안내):**
```
PdfUploadBar에서 단어장 2개 있을 때 그냥 회색으로 막혀 있기만 해.
왜 못 올리는지 사용자가 몰라서 헷갈려 하더라.
비활성화 상태일 때 바 위에 ⚠️ 아이콘이랑 "나만의 단어장은 최대 2개까지 만들 수 있어요. 기존 단어장을 삭제하면 새로 만들 수 있습니다." 문구 text-amber-600으로 보여줘.
```

**수정 지시 2차 (sector: PdfUploadBar — 업로드 중 로딩 단계):**
```
PdfUploadBar 업로드 중에 스피너만 있으면 AI가 처리 중인지 오류인지 구분이 안 돼서 사용자가 중간에 나가버려.
단계별로 메시지 바꿔줘:
PDF 전송 중: "PDF를 업로드하는 중..." + 프로그레스 바
AI 추출 중: "AI가 단어를 추출하는 중... (최대 30초 소요)" + 점 세 개 애니메이션
저장 중: "단어장을 저장하는 중..."
완료: "단어장이 생성되었습니다! 🎉" 토스트
```

**BE 구현 프롬프트:**
```
[컨텍스트]
기술스택: Supabase Edge Functions, OpenAI API (GPT-4o)
DB 테이블: user_wordbooks (id, user_id, title, created_at), user_words (id, wordbook_id, english, general_meaning, major_meaning, general_example, major_example)
환경변수: OPENAI_API_KEY

[구현 대상: SBI-H04 PDF→AI 단어장 생성 BE]
  1. PDF 파일 수신 및 텍스트 추출
  2. OpenAI API 호출 — 단어 추출 프롬프트:
     페르소나: "너는 학술 PDF에서 전공 핵심 단어를 추출하는 전문가다."
     출력 형식 (JSON 고정):
     { "words": [{ "english": "...", "general_meaning": "...", "major_meaning": "...", "general_example": "...", "major_example": "..." }] }
     제약: 전공 용어가 아닌 일반 단어 제외, 최대 30개, JSON 외 텍스트 금지
  3. 추출 단어 → user_wordbooks + user_words 저장
     - 저장 전 단어장 개수 검증: 2개 초과 시 에러 반환
     - DB 트리거로도 2개 제한 이중 검증

[제약]
- API 키는 환경변수로만 관리 (코드에 하드코딩 금지)
- DB 레벨 이중 방어: API 검증 실패 시 DB 트리거가 2차 차단
```

**수정 지시 1차 (sector: PDF→단어장 핸들러 — OpenAI 응답 파싱):**
```
PDF→단어장 생성 핸들러에서 OpenAI 응답을 JSON.parse 없이 바로 저장하려고 해서
OpenAI가 JSON 대신 사과 문구 같은 거 반환하면 서버가 500 에러 터져.
response.match(/\{[\s\S]*\}/)로 JSON 블록만 뽑아서 parse하게 하고,
parse 실패하면 400에 "PDF에서 단어를 추출하지 못했습니다. 다시 시도해주세요." 반환해줘.
general_meaning이 null인 경우도 허용하게 저장 로직도 수정해줘.
```

---

#### SBI-H05 | 책갈피 실시간 조회

**FE 구현 프롬프트:**
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase Realtime
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-H05 책갈피 실시간 조회 FE]
  1. 책갈피 수량 표시 UI (메인 화면 상단)
  2. Supabase Realtime 구독 — users.star_dust 컬럼 변경 시 자동 갱신

[제약]
- 구독 채널: users 테이블, 본인 row의 star_dust 변경 이벤트만 구독
- 컴포넌트 unmount 시 구독 해제 (메모리 누수 방지)
- 초기값은 API 조회 후 표시, 이후 Realtime으로 업데이트
```

**수정 지시 1차 (sector: StarDustDisplay — Realtime 구독 필터):**
```
StarDustDisplay에서 users 테이블 전체 구독하고 있어서
다른 사람 책갈피 바뀔 때도 이벤트 받아버려.
filter: `id=eq.${userId}` 조건 추가해서 내 row만 구독하게 해줘.
```

**수정 지시 2차 (sector: StarDustDisplay — 숫자 변경 애니메이션):**
```
StarDustDisplay에서 책갈피가 Realtime으로 갱신될 때 숫자가 그냥 순간 바뀌어 버려서 사용자가 변화를 잘 못 느껴.
이전 값에서 새 값까지 200ms 동안 카운트업 되게 하고,
올라갈 때 잠깐 text-yellow-400으로 색 바뀌었다 원래대로 돌아오게 해줘.
```

**BE:** Supabase 콘솔 Realtime 활성화 + RLS 동작 확인 후 통과

---

#### SBI-N01 | 공식 단어장 조회

**FE 구현 프롬프트:**
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase
전역 상태: MajorContext (H01에서 설정한 선택 전공 상태)
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-N01 공식 단어장 조회 FE]
  1. 공식 단어장 목록 페이지 UI (MajorContext 기반 자동 필터링)
  2. MajorContext 구독 — 전공 변경 시 목록 자동 갱신
  3. 단어 카드 UI (영어 / 일반뜻(optional) / 전공뜻 / 일반예문 / 전공예문)

[제약]
- 전공 선택이 없으면 빈 상태 안내 문구 표시
- general_meaning null 처리: null이면 해당 항목 DOM 자체를 렌더링하지 않음
- 수동 전공 필터 탭 없음 — MajorContext 값만 사용
```

**수정 지시 1차 (sector: WordCard — general_meaning null 렌더링):**
```
WordCard에서 general_meaning이 null이면 빈 문자열로 표시해서
"일반 의미: " 레이블만 덩그러니 남아 있어.
null이면 그 항목 자체를 아예 렌더링하지 마.
{wordData.general_meaning && <div>...</div>} 이런 식으로.
```

**수정 지시 2차 (sector: WordCard — 카드 뒤집기 인터랙션):**
```
WordCard가 지금 정보만 쭉 나열하는 형식이라 학습 효과가 별로야.
영어 단어 보고 뜻 먼저 맞혀볼 수 있게 카드 뒤집기 넣어줘.
앞면엔 영어 단어만 크게 (text-3xl font-bold 중앙), 뒷면엔 뜻이랑 예문.
클릭하면 rotateY(180deg) 뒤집기 효과, duration-500, 카드 높이 h-48 고정.
```

**수정 지시 3차 (sector: OfficialWordBookPage — 빈 상태 UI):**
```
OfficialWordBookPage에서 전공 안 고른 상태면 "전공을 선택해주세요" 텍스트만 덩그러니 있어.
어디서 전공 선택하는지 안내가 없어서 사용자가 헷갈려 해.
🎓 아이콘이랑 "아직 전공을 선택하지 않았어요" 제목, "메인 화면에서 전공을 선택하면 맞춤 단어장을 볼 수 있어요" 부제,
그리고 메인 화면으로 이동하는 버튼 추가해줘.
```

**BE:** 특이사항 없음

---

#### SBI-N02 | 나만의 단어장 조회

**FE 구현 프롬프트:**
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-N02 나만의 단어장 조회 FE]
  1. 페이지 레이아웃: 상단 PDF 업로드 바 + 하단 단어장 카드 목록 (최대 2개)
  2. 단어장 2개 보유 시 업로드 바 비활성화
  3. 단어장 카드 내 삭제 버튼 + 삭제 확인 모달
  4. 단어 카드 조회 UI (읽기 전용, 수정 버튼 없음)

[제약]
- 단어장 개수는 BE API로 확인 (하드코딩 금지)
- 삭제 확인 모달: "정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
- 단어 수정 UI 없음 (MVP에서 읽기 전용)
```

**수정 지시 1차 (sector: UserWordBookCard — 카드 레이아웃):**
```
UserWordBookCard가 세로로 너무 길어서 2개만 있어도 화면이 꽉 차.
카드 상단엔 제목(text-lg font-bold) + 오른쪽에 빨간 삭제 아이콘 버튼,
중단엔 "총 n개 단어"랑 생성일,
하단엔 "학습 시작" 버튼으로 단어 목록 펼치는 토글 구조로 바꿔줘.
단어 목록은 처음엔 접혀 있게.
```

**수정 지시 2차 (sector: DeleteWordBookModal — 모달 디자인):**
```
DeleteWordBookModal이 window.confirm() 쓰고 있어.
브라우저 기본 창이라 EduLex 디자인이랑 완전 달라서 이질감 나.
커스텀 모달로 바꿔줘. bg-black/50 오버레이에 bg-white rounded-2xl shadow-xl 카드,
🗑️ 아이콘이랑 "단어장을 삭제하면 되돌릴 수 없어요" 텍스트,
취소 버튼이랑 빨간 삭제 버튼 두 개.
```

**수정 지시 3차 (sector: UserWordBookCard — 단어 0개 빈 상태):**
```
UserWordBookCard에서 단어장은 있는데 단어가 0개면 그냥 빈 화면이야.
PDF 생성 오류 났을 때 이런 경우가 생기더라고.
단어 0개면 "이 단어장에 단어가 없어요. PDF를 다시 업로드해보세요." 안내랑 삭제 버튼 강조해서 보여줘.
```

**BE 구현 프롬프트:**
```
[컨텍스트]
기술스택: Supabase (DB + RLS)
DB 테이블: user_wordbooks (id, user_id, title, created_at), user_words (id, wordbook_id, ...)

[구현 대상: SBI-N02 나만의 단어장 BE]
  1. 사용자별 단어장 목록 조회 API
  2. 단어 목록 조회 API (wordbook_id 기반, 본인 소속만)
  3. 단어장 삭제 API (cascade 삭제, 본인만)
  4. 단어장 개수 조회 API

[제약]
- RLS: user_wordbooks SELECT/DELETE는 본인만 허용
- CASCADE 삭제: user_wordbooks 삭제 시 user_words도 자동 삭제 (FK CASCADE)
- MVP에서 UPDATE RLS 비활성화
```

**수정 지시 1차 (sector: 단어장 삭제 API — CASCADE 방식):**
```
단어장 삭제 API에서 user_words 먼저 지우고 user_wordbooks 지우는 방식인데,
중간에 실패하면 단어는 사라졌는데 단어장은 남는 문제가 생겨.
FK CASCADE 설정으로 DB 레벨에서 자동 처리되게 바꿔줘:
user_words.wordbook_id REFERENCES user_wordbooks(id) ON DELETE CASCADE
API 쪽 수동 user_words DELETE 코드는 지워도 돼.
```

---

#### SBI-N03 | 테스트 (퀴즈 — Lv1)

**FE 구현 프롬프트:**
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-N03 테스트 FE]
  1. 테스트 시작 화면 (단어장 선택 — 공식/나만의 단어장 목록)
  2. Lv1 퀴즈 UI (뜻 → 영어 4지선다 객관식)
  3. 테스트 결과 화면 (정답률 + 책갈피 획득량 표시)

[제약]
- 문제는 BE API에서 생성하여 반환 (클라이언트 랜덤 생성 금지)
- 정답 제출은 전체 완료 후 일괄 제출
- 정답 검증은 BE에서 처리 (클라이언트에 정답 데이터 노출 금지)
- Lv2~4 UI 없음 (MVP는 Lv1만)
```

**수정 지시 1차 (sector: QuizCard — 보기 선택 피드백):**
```
QuizCard 보기 4개가 그냥 버튼으로만 있어서 내가 뭘 선택했는지 티가 안 나.
선택된 거: bg-indigo-100 border-indigo-500 font-semibold으로 강조하고,
다른 거 클릭하면 이전 거 해제되는 라디오 버튼 동작으로 해줘.
아직 안 고른 문항은 QuizProgressBar에서 회색으로 표시해줘.
```

**수정 지시 2차 (sector: QuizPage — 정답 검증 위치):**
```
QuizPage에서 BE 응답에 correctAnswer 배열이 포함되어 있고 클라이언트가 직접 계산하고 있어.
네트워크 탭에서 응답 보면 정답이 다 보이는 거잖아.
API 응답에서 정답 필드 받는 거랑 사용하는 코드 다 지우고,
제출할 때 선택한 답만 BE로 보내서, BE에서 검증하고 { score, earnedStarDust } 만 돌려받게 해줘.
```

**수정 지시 3차 (sector: QuizResultPage — 결과 화면 디자인):**
```
QuizResultPage 결과 화면이 정답률 숫자만 있어서 너무 밋밋하고 성취감이 없어.
책갈피도 얼마 받았는지 강조가 없어서 보상 효과가 약해.
정답률에 따라 이모지 + 메시지 다르게 해줘 (100%면 🎉 완벽해요!, 70% 이상 👍, 그 이하 💪).
책갈피 획득량은 ⭐ +n 책갈피 획득! text-3xl text-yellow-500 animate-bounce로 크게 강조하고,
다시 테스트 버튼이랑 단어장으로 돌아가기 버튼 추가해줘.
```

**BE 구현 프롬프트:**
```
[컨텍스트]
기술스택: Supabase (DB + RLS)
DB 테이블: test_results (id, user_id, wordbook_id, wordbook_type, score, created_at), users (star_dust), star_dust_logs

[구현 대상: SBI-N03 테스트 BE]
  1. Lv1 문제 생성 API (뜻→영어 4지선다, 정답은 서버 세션에 보관)
  2. 테스트 결과 저장 API (wordbook_id 서버 검증 포함)
  3. 테스트 참여 보상 책갈피 지급 — DB 함수(트랜잭션):
     - users.star_dust += 보상량
     - star_dust_logs INSERT

[제약]
- 문제 생성 시 정답 정보는 서버에만 보관 (클라이언트에 정답 인덱스 미포함)
- 책갈피 지급은 단일 DB 함수(RPC)로 트랜잭션 보장
- wordbook_id 검증: 공식이면 official_wordbooks, 나만의면 user_wordbooks에서 존재 확인
```

**수정 지시 1차 (sector: 문제 생성 API — correctIndex 노출):**
```
문제 생성 API 응답에 correctIndex가 포함되어 있어.
개발자 도구 네트워크 탭에서 응답 보면 정답 다 보이잖아.
API 응답에서 correctIndex 완전히 빼고, 서버 세션에만 정답 보관해.
결과 제출할 때 서버가 직접 대조해서 점수 계산 후 반환하면 돼.
```

---

#### SBI-U04 | 단어장별 학습 진행률

**FE/BE:** 특이사항 없음 — 학습 완료 기준(테스트에서 정답 처리된 단어 집계)을 팀 내 정의 후 재프롬프트로 확정

---

#### SBI-A01 | 공식 단어장 CRUD

**FE/BE:** 특이사항 없음 — RLS 정책이 관리자 CRUD와 일반 사용자 SELECT를 정확히 분리함을 확인

---

### 5-3. FE ↔ BE 통합 전 리뷰 및 리팩토링

FE 개발자와 BE 개발자는 **코드를 합치기 전 스스로 리뷰 및 리팩토링**을 거쳤다.

#### 리팩토링 프롬프트 (공통)
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase
코딩 표준: 컴포넌트 PascalCase, 훅 use 접두사, Tailwind only, src/pages|components|utils|context 폴더 구조

[대상 코드]
(각 개발자의 완성 코드 붙여넣기)

[리뷰 요청]
1. 코딩 표준 위반 사항 확인
2. 불필요한 state / 사용하지 않는 import 확인
3. 컴포넌트 분리 기준 위반 (너무 큰 컴포넌트) 확인
4. 보안 제약 위반 여부 확인 (클라이언트 role/정답 저장 등)

리팩토링이 필요한 경우만 수정 제안할 것. 불필요한 변경은 하지 말 것.
```

#### 통합 전 FE ↔ BE 정보 교환

합치기 전 **수요일·목요일 정기 미팅**에서 다음과 같이 상호 설명하였다:

- **FE → BE**: 컴포넌트 구조, 상태 관리 방식, API 엔드포인트 호출 형태 설명 + 디자인 컨펌
- **BE → FE**: 주요 로직 설명, Supabase 테이블 데이터 저장 양식, API 키 구현 방식 설명

이를 통해 FE와 BE 개발자 모두 상대방의 구현 방식을 이해할 수 있는 수준으로 정보 교환이 이뤄졌다.

---

## 6. Sprint Increment (시연 영상)

*(시연 영상 포함)*

### 완성된 기능 목록 (DoD 기준 통과)

| SBI | 기능명 | AC 체크리스트 | DoD 완료 |
|-----|--------|-------------|---------|
| L00 | 랜딩 페이지 | ✅ | ✅ |
| L01 | 회원가입 (이메일 인증) | ✅ | ✅ |
| L02 | 로그인 (일반 + OAuth) | ✅ | ✅ |
| L05 | 관리자 로그인 및 권한 분리 | ✅ | ✅ |
| H01 | 캐릭터 프리뷰 + 전공 선택 | ✅ | ✅ |
| H02 | 출석 체크 / 스트릭 + 책갈피 보상 | ✅ | ✅ |
| H04 | PDF → AI 단어장 생성 | ⚠️ 부분 완료 | - |
| H05 | 책갈피 실시간 조회 | ✅ | ✅ |
| N01 | 공식 단어장 조회 (전공 연동) | ✅ | ✅ |
| N02 | 나만의 단어장 조회 + 삭제 | ✅ | ✅ |
| N03 | 테스트 Lv1 + 결과 저장 + 보상 | ✅ | ✅ |
| U04 | 단어장별 학습 진행률 | ✅ | ✅ |
| A01 | 공식 단어장 CRUD | ✅ | ✅ |

> 시연 영상에서 확인한 바와 같이, 각 SBI의 AC 체크리스트를 전부 준수하여 구현하였고 DoD 항목도 완료하였다.

---

## 7. Sprint Review 결과

### 미완료 항목: H04 PDF 추출 기능

Sprint Review에서 **PDF 추출 부분이 완료되지 않았음**을 확인하였다.

#### 팀 토의 과정

1. **완료 여부 논의**: PDF → AI 단어장 생성(H04) 중 PDF 텍스트 추출 로직이 예상보다 복잡하여 미완료
2. **MVP 포함 여부 결정**: 이 기능이 다른 영어 단어 웹사이트와의 **차별점**이라는 점을 팀원 전원이 동의
3. **긴급 투입 결정**: 5명 전원이 관련 로직을 각자 조사·구현하여 서로의 코드를 비교 후 완성본 구현

> 칸반 보드를 통해 H04 진행이 막혀있음을 팀 전체가 인지하고 있었기 때문에, Review 단계에서 빠르게 투입 결정이 이뤄질 수 있었다.

---

## 8. Sprint Retrospective

### 잘된 점 (What went well)

- **칸반 보드 활용**: H04 PDF 추출이 막히고 있다는 것을 칸반 보드로 모두가 인지 → Sprint Review에서 전원 빠른 투입 가능
- **AI 버전 관리 + 서기 리뷰 루프**: 회의 결정사항 누락을 방지하는 데 효과적
- **팀A/팀B 병렬 개발**: 의존성 순서를 명확히 한 덕분에 충돌 없이 진행
- **정기 미팅(수·목)**: FE↔BE 상호 이해 수준의 정보 교환으로 통합 오류 감소

### 문제점 (What didn't go well)

| 문제 | 원인 |
|------|------|
| 시험 기간 중 프롬프트 품질 저하 | 팀원 간 컨텍이 부족하고 조급함으로 인해 계획한 `[컨텍스트]-[구현 대상]-[제약]` 구조를 따르지 않고 무작위로 프롬프트 입력 → 오류 증가 |
| PDF 추출 기능 미완료 | 외부 라이브러리 의존성 및 Edge Function 환경 제약을 초기에 충분히 검토하지 않음 |

### 개선 액션 (Action Items)

| 액션 | 담당자 | 기한 |
|------|--------|------|
| 시험 종료 후 H04 PDF 추출 로직 재투입하여 완성 | 팀 전원 | 시험 종료 후 |
| 프롬프트 구조 준수를 팀 내 DoD에 명시적으로 추가 | 서기 | 다음 스프린트 시작 전 |

> **합의 사항:** 시험 기간 중 조급하게 처리한 부분은 시험 종료 후 더 시간을 투자하여 재정비하기로 팀 전원 빠른 합의 완료.
