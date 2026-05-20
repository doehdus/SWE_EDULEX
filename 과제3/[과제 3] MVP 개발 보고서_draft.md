# [과제 3] MVP 개발 보고서

**팀명:** [조 이름]
**제출 기한:** 2026년 5월 8일(금) 오후 5시
**파일명:** SE 과제3_[조이름].pptx

---

## 목차

1. 표지
2. AI 활용 방법론 선정 과정
3. Product Backlog
4. Definition of Done (DoD)
5. Sprint Goal
6. Sprint Backlog
7. Prompt 작성을 통한 구현 설명
8. Sprint Increment 설명
9. Sprint Review 결과
10. Sprint Retrospective

---

## 1. AI 활용 방법론 선정 과정

### 1-1. 방법론 조사 배경

팀 전원이 AI를 어떻게 개발에 통합할지 논의하는 과정에서, 최근 개발 커뮤니티와 유튜브에서 활발하게 논의되는 세 가지 방향성을 조사하였다.

| 방법론 | 핵심 개념 | 우리 팀 적합 여부 |
|--------|-----------|-------------------|
| **프롬프트 엔지니어링** | 단일 요청의 품질을 높이는 기법 (역할 부여, Few-shot, Chain-of-thought 등) | ✅ 부분 도입 |
| **컨텍스트 엔지니어링** | AI에게 제공하는 맥락(배경, 구조, 히스토리)을 설계하는 기법 | ✅ 적극 도입 |
| **하네스(Harness) 엔지니어링** | 훅·자동화 파이프라인으로 AI 작업 흐름 자체를 자동화하는 기법 | ⚠️ 제한적 도입 |

### 1-2. 하네스 엔지니어링을 전면 도입하지 않은 이유

하네스 엔지니어링(훅 기반 자동화, 에이전트 파이프라인 등)은 1인 개발 또는 CI/CD가 완전히 갖춰진 환경에서 극대화된다. 우리 팀은 **5인(개발 4 + 서기 1), 변형 스크럼, 2팀 병렬 개발** 구조이므로, 자동화보다 **인간 리뷰 루프를 유지하는 것이 정확성과 팀 소통 측면에서 더 적합하다**고 판단하였다. AI가 자동 생성한 결과물은 반드시 담당 팀원(또는 서기)이 리뷰하는 워크플로를 유지한다.

### 1-3. 우리 팀이 선택한 AI 활용 전략

> **"AI는 초안을 빠르게 생성하고, 사람이 정확성을 보장한다"**

- 컨텍스트 엔지니어링: 백로그·ERD·팀 구조를 사전에 AI에게 주입하여 맥락 일관성 확보
- 프롬프트 엔지니어링: 페르소나 지정 + 단계적 지시로 출력 품질 향상
- 하네스 일부: 버전 태그(`[NEW]`, `[UPD]`, `[DEL]`)를 규칙으로 고정하여 AI가 형식을 이탈하지 않도록 제약

---

## 2. Product Backlog 작성 — AI 버전 관리 프로세스

### 2-1. AI를 통한 버전 관리 방식

Product Backlog와 MVP Sprint Backlog는 회의가 진행될 때마다 AI에게 **회의 결과를 입력하여 버전을 갱신**하였다. 단순히 AI가 작성하는 것이 아니라, **회의 → AI 업데이트 → 서기 리뷰 → 노션 반영**의 4단계 루프를 고수하였다.

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

### 2-2. 버전 이력 요약

#### Product Backlog (v1.0 → v1.4)

| 버전 | 주요 변경 내용 | 트리거 |
|------|---------------|--------|
| v1.0 | 최초 작성 (이미지 원본 백로그 기반) | 1차 팀 회의 |
| v1.1 | PBI 세분화 — 인증·메인·네비게이션·대시보드·관리자 항목 확장 | AI 구체화 제안 + 팀 승인 |
| v1.2 | 회원가입 전공 선택 제거, AI API OpenAI로 명시, MVP 범위 확정 | 2차 팀 회의 결정사항 |
| v1.3 | 나만의 단어장 세부 사양 확정 (최대 2개 제한, 삭제 기능) | 3차 팀 회의 결정사항 |
| v1.4 | ERD 변경 반영 (star_dust_logs, general_meaning 등) | DB 설계 회의 반영 |

#### MVP Sprint Backlog (v1.0 → v1.6)

| 버전 | 주요 변경 내용 |
|------|---------------|
| v1.0–v1.2 | 최초 작성 → SBI 구체화 → 기술스택 명시 |
| v1.3 | 전공 선택 위치 변경, 나만의 단어장 수동 CRUD 제거 |
| v1.4 | 단어장 최대 2개 제한 및 삭제 기능 확정 |
| v1.5 | H04↔N01 팀 교환 (의존성·난이도 균형 재분배) |
| v1.6 | ERD 변경 반영 (트랜잭션, 서버 검증, 보안 강화) |

### 2-3. 서기 리뷰 프로세스

모든 AI 업데이트 이후 **서기**가 아래 항목을 체크하였다:

- [ ] 회의에서 결정한 모든 사항이 백로그에 반영되었는가?
- [ ] 회의에서 논의되지 않은 내용이 AI에 의해 임의로 추가되지 않았는가?
- [ ] 버전 태그(`[NEW]`, `[UPD]`, `[DEL]`)가 실제 변경 내용과 일치하는가?
- [ ] 변경 이력 주석(※ v1.x:)이 정확하게 기록되었는가?

---

## 3. Product Backlog

- 해야 할 모든 것의 우선순위에 따라 정렬된 목록
- 제품에 필요한 모든 기능
  - 프로젝트가 진행되면서, 개선 사항, 버그 수정 등도 포함
- Product Backlog Items (PBI)의 모음
  - ID + Title + User Story + Constraints

*(아래는 v1.4 기준 확정본)*

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

## 4. Definition of Done (DoD)

- 팀이 정의한 DoD 항목 목록
  - 코드가 main branch에 merge됨
  - 테스트 통과
  - 문서화 완료
- 구현이 끝나고, 통과 여부 확인

우리 팀은 AI가 초안을 생성하고 사람이 검토·확정하는 워크플로를 채택했기 때문에, DoD는 **일반 개발 완료 기준**과 **AI 산출물 품질 보증 기준** 두 축으로 구성된다.

### [A] 일반 개발 완료 기준

| # | DoD 항목 | 통과 여부 |
|---|---------|---------|
| A1 | 코드가 main branch에 merge됨 | |
| A2 | ESLint/빌드 오류 없음 | |
| A3 | Supabase RLS 정책 적용 및 동작 확인 | |
| A4 | 각 SBI 세부 작업 체크리스트 전체 완료 | |
| A5 | 팀A ↔ 팀B 통합 테스트 통과 | |
| A6 | 서기가 기능이 스프린트 목표와 일치하는지 확인 | |

### [B] AI 산출물 품질 보증 기준

> AI가 생성한 코드·문서는 아래 항목을 모두 통과해야 "완료"로 인정한다.

#### B-1. AI 코드 생성 (SBI 구현 프롬프트)

| # | DoD 항목 | 통과 여부 |
|---|---------|---------|
| B1 | AI가 생성한 코드를 담당자가 직접 실행하여 정상 동작 확인 (실행 없이 merge 금지) | |
| B2 | AI가 프롬프트의 [제약] 조건을 모두 준수했는지 담당자가 항목별로 대조 확인 | |
| B3 | AI가 임의로 추가한 기능·로직이 없는지 확인 (지시하지 않은 코드 존재 시 제거) | |
| B4 | 보안 제약 준수 확인 — 정답 클라이언트 노출 금지, role 클라이언트 저장 금지, API 키 하드코딩 금지 | |
| B5 | AI 리뷰에서 발견된 오류 및 재요청 내용이 최종 코드에 반영되었는지 확인 | |

#### B-2. AI 백로그 버전 관리 (Product Backlog / Sprint Backlog)

| # | DoD 항목 | 통과 여부 |
|---|---------|---------|
| B6 | 서기가 회의 결정사항과 AI 업데이트 결과를 1:1 대조하여 누락·추가 없음을 확인 | |
| B7 | 버전 태그(`[NEW]` `[UPD]` `[DEL]`)가 실제 변경 내용과 일치하는지 확인 | |
| B8 | AI가 지시하지 않은 항목을 임의로 수정·삭제하지 않았는지 확인 | |
| B9 | 변경 이력 주석(`※ v1.x:`)이 각 PBI/SBI에 정확히 기록되었는지 확인 | |

#### B-3. AI 활용 기록 (과제 제출 요건)

| # | DoD 항목 | 통과 여부 |
|---|---------|---------|
| B10 | 각 SBI의 실제 사용 프롬프트가 보고서 7-4절에 기록되었는지 확인 | |
| B11 | AI 오류 사례 및 재요청 내용이 해당 SBI 리뷰 항목에 기록되었는지 확인 | |
| B12 | 적용 기법(컨텍스트 엔지니어링 / 프롬프트 엔지니어링 / 하네스)이 프롬프트별로 명시되었는지 확인 | |

---

## 5. Sprint Goal

> **"사용자가 EduLex에 가입하고, 전공 기반 공식 단어장과 AI가 생성한 나만의 단어장으로 학습을 시작하며, 퀴즈를 통해 암기 수준을 점검하고 책갈피 보상을 받을 수 있다"**

*단순 기능 목록이 아닌, 사용자가 경험하는 가치 흐름으로 정의하였다.*

---

## 6. Sprint Backlog

**Sprint 기간:** 1주 (병렬 개발 — 팀A: FE1+BE1 / 팀B: FE1+BE1)
**MVP 선택:** High 전부 + Medium 일부 (총 12개 PBI)

### 팀 분배 (v1.5 기준)

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

### 세부 작업 체크리스트 방식 채택 근거

스크럼에서 SBI의 완료 기준을 정의하는 방법으로 **Acceptance Criteria(AC)** 를 쓰는 것이 일반적이다. AC는 "사용자/PO 관점에서 기능이 완료됐는지 판단하는 조건"으로, 검증 중심의 서술 방식이다.

그러나 우리 팀은 AC 대신 **FE/BE 세부 작업 체크리스트** 방식을 선택하였다. 그 이유는 다음과 같다.

- **병렬 개발 환경**: 팀A/팀B가 동시에 진행하므로, FE와 BE 작업을 명확히 분리하여 담당자가 즉시 확인할 수 있는 체크리스트가 협업에 더 적합하다.
- **AI 프롬프트 입력 효율**: 세부 작업 목록을 그대로 프롬프트의 `[구현 대상]` 블록에 붙여넣어 AI에게 전달할 수 있어, AC처럼 검증 문장으로 재작성하는 과정이 불필요하다.
- **DoD와의 역할 분리**: 기능의 완료 판단(검증)은 DoD 항목 4~6번(체크리스트 전체 완료 + 통합 테스트 + 서기 확인)이 담당하므로, SBI 레벨에서는 AC보다 작업 단위 체크리스트가 중복 없이 역할을 수행한다.

---

## 7. Prompt 작성을 통한 구현 설명

### 7-1. AI 활용 영역 전체 개요

| 활용 영역 | AI 도구 | 담당자 | 리뷰어 |
|-----------|--------|--------|--------|
| Product Backlog 버전 관리 | Claude / ChatGPT | 팀 전체 (회의 후 입력) | 서기 |
| Sprint Backlog 버전 관리 | Claude / ChatGPT | 팀 전체 (회의 후 입력) | 서기 |
| OpenAI API 프롬프트 (PDF→단어장) | GPT-4o | BE 담당자 (팀A) | FE 담당자 (팀A) |
| 컴포넌트/페이지 코드 초안 생성 | Claude | 각 개발자 | 팀 내 상대방 |
| Supabase RLS 정책 설계 | Claude | BE 담당자 | BE 담당자 상호 리뷰 |

모든 AI 출력물은 **담당자가 생성 → 검토 → 확정** 순서를 거친다.

---

### 7-2. Product Backlog 버전 관리 프롬프트

#### 적용 기법

- **컨텍스트 엔지니어링**: 현재 백로그 전체 + 버전 태그 규칙 + 변경 이력 형식을 AI에게 먼저 주입
- **프롬프트 엔지니어링**: 페르소나("너는 EduLex 팀의 스크럼 마스터야") + 변경 제약 조건 명시
- **하네스 일부**: 버전 태그 형식(`[NEW]`, `[UPD]`, `[DEL]`, `※ v1.x:`)을 규칙으로 고정

#### 실제 프롬프트 구조 (v1.2 업데이트 시 예시)

```
[시스템 컨텍스트]
너는 EduLex 팀의 스크럼 마스터 역할로 Product Backlog를 관리한다.
아래는 현재 백로그(v1.1)의 전체 내용이다.

[버전 태그 규칙]
  [---] 기존 유지 / [UPD] 내용 수정 / [NEW] 신규 추가 / [DEL] 삭제

[현재 백로그 전체 내용 — v1.1]
  (product_backlog.txt 전체 텍스트 붙여넣기)

[회의 결과 — 오늘 결정 사항]
1. [L01] 회원가입 시 전공 선택 제거 → 로그인 후 캐릭터 하단(H01)에서 선택
2. [H01] 캐릭터 하단 전공 선택(최대 2개) + 칭호 선택 기능 추가
3. [H04] AI API: GEMINI에서 OpenAI GPT로 변경
4. [N01] H01 전공 선택 변경 시 자동 갱신 연동 Constraints 추가
5. [N02] 수동 단어 추가/수정/삭제 제거 → PDF→AI 생성 조회 전용
6. [N03] MVP는 Lv1(뜻→영어 객관식)만 진행 / Lv2~4 Post-MVP
7. [U05] 우선순위 High → Low 이동 (MVP에서 불필요)

[지시]
위 결정 사항을 반영하여 백로그를 v1.2로 업데이트해라.
- 변경된 PBI에는 반드시 버전 태그([UPD]/[NEW]/[DEL])를 붙일 것
- 변경 이력 섹션에 v1.2 항목을 추가할 것
- 회의에서 논의되지 않은 항목은 절대 수정하지 말 것
- ※ v1.2: 주석 형식으로 각 PBI 하단에 변경 이유를 기록할 것
```

#### 버전별 주요 프롬프트 입력 (Product Backlog v1.0 → v1.4)

| 버전 | 회의 결정사항 요약 (프롬프트 입력 내용) |
|------|--------------------------------------|
| v1.0 | 이미지 원본 백로그 텍스트 변환 + PBI 형식(ID/Title/User Story/Constraints/우선순위) 통일 요청 |
| v1.1 | "L01~L06 인증 항목 세분화, H01~H08 메인 화면 확장, N01~N07 네비게이션 확장, A01~A06 관리자 확장 — 각 항목 구체화 후 우선순위 재분류 요청" |
| v1.2 | "L01 전공 선택 제거 / H01 전공+칭호 선택 추가 / H04 OpenAI로 변경 / N01 연동 Constraints 추가 / N02 수동 CRUD 제거 / N03 Lv1만 MVP / U05 Low 이동" |
| v1.3 | "N02 나만의 단어장: 최대 2개 제한 + 삭제 기능 MVP 포함 + 페이지 레이아웃(상단 PDF 업로드 바 → 하단 단어장 카드 목록) 확정" |
| v1.4 | "ERD 변경 반영: H02 star_dust_logs 트랜잭션 Constraints 추가 / N01 general_meaning 표시 추가 / N03 star_dust_logs 트랜잭션 + wordbook_id 서버 검증 추가 / H01 칭호 시스템 Post-MVP 명시" |

#### 리뷰 후 발견된 AI 오류 사례 및 수정

- v1.2 업데이트 시 AI가 L01 전공 선택 Constraints를 완전 삭제한 것을 서기가 발견 → "전공 선택은 로그인 후 H01에서 진행"이라는 설명을 유지하도록 재요청

---

### 7-3. MVP Sprint Backlog 버전 관리 프롬프트

#### 적용 기법

- **컨텍스트 엔지니어링**: Product Backlog 확정본 + 현재 Sprint Backlog 전체 + 팀 분배 구조를 AI에게 주입
- **프롬프트 엔지니어링**: SBI 형식(As a ~ I want ~ So that ~) + 세부 작업 체크리스트 구조 고정
- **하네스 일부**: `[SBI-XXX]` ID 형식, `[ ] FE/BE -` 체크리스트 형식을 규칙으로 고정

#### 실제 프롬프트 구조 (v1.5 팀 분배 재조정 시 예시)

```
[시스템 컨텍스트]
너는 EduLex 팀의 스크럼 마스터로 MVP Sprint Backlog를 관리한다.
기술스택: React, Tailwind CSS, Supabase / AI-PDF→단어장: OpenAI API (GPT)
Sprint 기간: 1주, 팀A(FE1+BE1) / 팀B(FE1+BE1) 병렬 개발

[SBI 형식 규칙]
  [SBI-XXX] 기능명
  - User Story: As a ..., I want to ..., So that ...
  - 세부 작업:
      [ ] FE - ...
      [ ] BE - ...
  - 우선순위: High/Medium

[현재 Sprint Backlog 전체 내용 — v1.4]
  (mvp_sprint_backlog.txt 전체 텍스트 붙여넣기)

[회의 결과 — 오늘 결정 사항]
팀 분배 재조정:
- H04(PDF→AI 단어장 생성)를 팀B에서 팀A로 이동
  이유: OpenAI 외부 API 작업은 인증 기반 위의 독립 작업 — 팀A 인프라 담당에 적합
- N01(공식 단어장 조회)을 팀A에서 팀B로 이동
  이유: H01 전공 선택 전역 상태와 공유해야 함 — 같은 팀이 담당해야 연동 충돌 없음
- 각 팀 내 개발 단계(1~4단계) 명시 추가

[지시]
위 결정 사항을 반영하여 Sprint Backlog를 v1.5로 업데이트해라.
- 변경된 SBI에는 ※ v1.5 변경: 주석을 추가할 것
- 팀 분배 섹션을 단계별(1~4단계)로 재정리할 것
- 기존 SBI 세부 작업 내용은 변경하지 말 것
```

#### 버전별 주요 프롬프트 입력 (MVP Sprint Backlog v1.0 → v1.7)

| 버전 | 스프린트 | 회의 결정사항 요약 (프롬프트 입력 내용) |
|------|---------|--------------------------------------|
| v1.0 | 초기 | "Product Backlog High 항목 기반으로 MVP Sprint Backlog 초안 작성 — SBI 형식(As a/I want to/So that + FE/BE 세부 작업 체크리스트)으로 작성" |
| v1.1 | 초기 | "기술스택 명시 추가 (React/Tailwind/Supabase/OpenAI API) / H04 GEMINI → OpenAI GPT 변경 반영" |
| v1.2 | 초기 | "SBI 세부 작업 구체화 + 팀A/팀B 초안 분배 작성 — FE/BE 세부 체크리스트 항목 상세화 요청" |
| v1.3 | 1차 | "L01 전공 선택 제거 / H01 전공+칭호 선택 추가 / N01 H01 연동 / N02 수동 CRUD 제거 / N03 Lv1만 / U05 MVP 제외 + 팀 분배 재조정" |
| v1.4 | 1차 | "N02 세부 사양 확정: 단어장 최대 2개 제한(2개 시 업로드 바 비활성화) + 단어장 삭제 기능(cascade) + 페이지 레이아웃(상단 업로드 바 → 하단 카드 목록)" |
| v1.5 | 1차 | "팀 분배 재조정: H04 팀B→팀A 이동(OpenAI 독립 작업) / N01 팀A→팀B 이동(H01 전공 상태 공유) / 각 팀 1~4단계 개발 순서 명시" |
| v1.6 | 1차 | "ERD 변경 반영: H01 칭호 시스템 Post-MVP 명시 / H02 star_dust_logs 트랜잭션 세부 작업 추가 / H04 단어장 2개 제한 이중 검증(API+DB) / N01 general_meaning 표시 / N02 Post-MVP 확장 예정 / N03 star_dust_logs + wordbook_id 서버 검증 / 통합 테스트 체크리스트 보안 항목 추가" |
| v1.7 | 1차 | "L00 랜딩 페이지 SBI 신규 추가 (REQ-004 반영): 히어로 섹션/출시배경/장점소개/사용방법 섹션 FE 구현 + 로그인 상태 리다이렉트 처리 / 팀A 1단계에 배치" |

#### 리뷰 후 발견된 AI 오류 사례 및 수정

- **v1.3 팀 분배 재조정 시**: AI가 N02(나만의 단어장)의 세부 작업에서 수동 단어 추가/수정 체크리스트 항목을 삭제 지시 없이도 임의로 제거함 → "수동 CRUD 제거는 N02 Constraints에만 반영하고, 이미 작성된 세부 작업 항목은 그대로 유지하되 취소선 처리하라"고 재요청
- **v1.5 팀 분배 재조정 시**: H04와 N01의 팀 이동만 지시했으나 AI가 팀B의 개발 단계 번호를 임의로 재배열하여 H02가 1단계로 올라오는 오류 발생 → "H01이 팀A 인증 완료 후 시작해야 하므로 팀B 1단계는 H01 고정"임을 명시하여 재요청
- **v1.6 ERD 반영 시**: AI가 star_dust_logs 트랜잭션 세부 작업을 H02와 N03 양쪽에 추가해야 함에도 N03에만 추가하고 H02는 누락함 → 서기가 H02 출석 보상 흐름과 N03 테스트 보상 흐름이 동일한 트랜잭션 패턴임을 확인 후 H02 세부 작업에도 동일하게 추가하도록 재요청

---

### 7-4. SBI별 구현 프롬프트 상세

> 아래는 각 SBI를 구현할 때 FE/BE 담당자가 실제로 작성·사용한 프롬프트 구조와 적용 기법, 리뷰 결과를 기록한 것이다.
> 공통 컨텍스트(기술스택, 파일 구조, Supabase 클라이언트 경로 등)는 모든 프롬프트에 사전 주입되었으며, 각 SBI별 차이점만 별도 기술한다.
컨텍스트: 기술스택 (React, Tailwind CSS, Supabase 등)
Supabase 클라이언트 경로 (src/utils/supabase.js)
라우터 정보 (React Router v6)

핵심 패턴:
[컨텍스트] → [구현 대상] → [제약] 3-블록 구조
세부 작업은 Sprint Backlog 체크리스트를 그대로 붙여넣기
제약 블록에 보안 요건(클라이언트 정답 노출 금지, role localStorage 금지 등)과 기술 제약(Tailwind만, 특정 API 패턴) 명시
트랜잭션/보안이 중요한 SBI(H02, N03)는 프롬프트 엔지니어링 (트랜잭션 보장 명시) 기법 추가
---



#### SBI-L00 | 랜딩 페이지

**FE:**

- 적용 기법: 컨텍스트 엔지니어링, 구조화 출력
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: React, Tailwind CSS
라우터: React Router v6
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-L00 랜딩 페이지]
세부 작업:
  1. 히어로 섹션 UI (슬로건 + 로그인/회원가입 CTA 버튼)
  2. 출시 배경 섹션 (전공 어휘 문제 + 게이미피케이션 근거)
  3. 장점·소개 섹션 (주요 기능 카드: 공식 단어장, AI 단어장, 테스트, 랭킹)
  4. 사용 방법 섹션 (회원가입 → 전공 선택 → 학습 단계별 안내)
  5. 로그인/회원가입 페이지 라우팅 연결
  6. 로그인 상태에서 랜딩 접근 시 /main으로 리다이렉트

[제약]
- Tailwind 클래스만 사용 (별도 CSS 파일 없음)
- 백엔드 API 호출 없음 (정적 콘텐츠 + 라우팅만)
- 로그인 상태 확인은 Supabase Auth의 getSession() 사용
- 각 섹션은 독립 컴포넌트로 분리 (LandingHero, LandingBackground, LandingFeatures, LandingGuide)
```
- 리뷰: AI가 리다이렉트 로직을 useEffect 내 getSession 비동기 처리 없이 동기로 작성하여, 초기 렌더 시 깜빡임 발생 → useEffect + async/await 패턴으로 수정 요청

**BE:** (해당 없음 — 백엔드 작업 없는 정적 페이지)

---

#### SBI-L01 | 회원가입

**FE:**

- 적용 기법: 컨텍스트 엔지니어링, 프롬프트 엔지니어링 (단계적 지시)
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase Auth
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-L01 회원가입 FE]
세부 작업:
  1. 회원가입 폼 UI (이메일, 비밀번호, 닉네임 입력 필드)
  2. 이메일 인증 안내 화면 (회원가입 완료 후 "인증 이메일을 확인하세요" 안내)

[제약]
- 전공 선택 UI 없음 (로그인 후 H01에서 선택)
- 비밀번호 최소 8자 클라이언트 검증 포함
- 닉네임 중복 검사는 BE API 호출 (입력 완료 후 onBlur 시 비동기 검사)
- 회원가입 성공 시 이메일 인증 안내 화면으로 전환 (페이지 이동 아님)
```
- 리뷰: AI가 닉네임 중복 검사를 Supabase 직접 쿼리로 구현 → "BE API 엔드포인트 호출로 변경, Supabase 직접 접근은 FE에서 하지 않는다"고 재요청

**BE:**

- 적용 기법: 컨텍스트 엔지니어링, 구조화 출력 (API 엔드포인트 형식 고정)
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: Supabase (Auth + DB)
DB 테이블: users (id, email, nickname, major, active_title, star_dust, created_at)
RLS: users 테이블 — 본인만 SELECT/UPDATE 가능

[구현 대상: SBI-L01 회원가입 BE]
세부 작업:
  1. Supabase Auth 이메일 인증 연동 (signUp + 이메일 인증 활성화)
  2. 닉네임 중복 검사 API (GET /api/check-nickname?nickname=...)
  3. 사용자 기본 정보 저장 (users 테이블 INSERT, major는 null 허용)

[제약]
- Supabase Auth signUp 호출 후 users 테이블에 트리거 또는 별도 INSERT로 동기화
- 닉네임 중복 검사: users 테이블 SELECT count(*) WHERE nickname = ?
- major 필드는 null 허용 (회원가입 시 전공 선택 없음)
- API 응답 형식: { available: true/false }
```
- 리뷰: Supabase Auth 트리거로 users 테이블 자동 INSERT 구현했으나, star_dust 기본값 0 설정 누락 → DEFAULT 0 추가하도록 수정 요청

---

#### SBI-L02 | 사용자 로그인

**FE:**

- 적용 기법: 컨텍스트 엔지니어링, 프롬프트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase Auth
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-L02 로그인 FE]
세부 작업:
  1. 로그인 폼 UI (이메일/비밀번호 입력)
  2. OAuth 버튼 (Google 소셜 로그인)
  3. 로그인 성공 시 /main으로 리다이렉트

[제약]
- 일반 로그인: supabase.auth.signInWithPassword()
- OAuth: supabase.auth.signInWithOAuth({ provider: 'google' })
- 로그인 실패 시 에러 메시지 한국어로 표시
- 로그인 상태는 AuthContext로 전역 관리
```
- 리뷰: AI가 OAuth 버튼 클릭 시 redirectTo 옵션을 누락 → Supabase OAuth 흐름에서 콜백 URL 설정 필요하다고 보완 요청

**BE:**

- 적용 기법: 컨텍스트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: Supabase Auth
JWT 세션 관리: Supabase 내장 세션 (access_token, refresh_token)

[구현 대상: SBI-L02 로그인 BE]
세부 작업:
  1. Supabase Auth 일반 로그인 연동 (signInWithPassword)
  2. OAuth(Google) 연동 — Supabase 콘솔 Provider 설정 + 콜백 URL 등록
  3. 로그인 세션 관리 (JWT — Supabase 자동 처리, refresh 정책 확인)

[제약]
- 별도 세션 서버 구현 없음 — Supabase Auth JWT 그대로 사용
- OAuth 콜백 URL: {SITE_URL}/auth/callback
- Google Cloud Console에서 Authorized redirect URI 등록 필요
```
- 리뷰: 특이사항 없음 — Supabase 공식 문서 패턴 그대로 적용되어 별도 수정 없음

---

#### SBI-L05 | 관리자 로그인 및 권한 부여

**FE:**

- 적용 기법: 컨텍스트 엔지니어링, 프롬프트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase Auth
라우팅: React Router v6 (PrivateRoute 패턴)

[구현 대상: SBI-L05 관리자 로그인 FE]
세부 작업:
  1. 관리자 로그인 페이지 UI (일반 로그인 폼과 별도 페이지, /admin/login 경로)
  2. 관리자 전용 라우트 보호 (role 확인 후 비관리자 접근 차단)

[제약]
- 관리자 확인: users 테이블 role 필드가 'admin'인 경우만 허용
- 비관리자가 /admin 접근 시 /main으로 리다이렉트
- AdminRoute 컴포넌트로 분리하여 재사용 가능하게 구현
```
- 리뷰: AI가 관리자 role 확인을 클라이언트 localStorage에서 읽도록 구현 → "반드시 서버(Supabase)에서 role을 조회해야 한다, 클라이언트 단 role 확인은 보안 취약점"이라고 재요청

**BE:**

- 적용 기법: 컨텍스트 엔지니어링, 프롬프트 엔지니어링 (보안 제약 명시)
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: Supabase (Auth + DB + RLS)
DB 테이블: users (id, role — 'user' | 'admin')

[구현 대상: SBI-L05 관리자 권한 BE]
세부 작업:
  1. 관리자 역할(role) 구분 — users.role 필드 활용
  2. 관리자 전용 API 접근 시 role 검증
  3. Supabase RLS: admin 전용 테이블/작업은 role = 'admin' 조건으로 제한

[제약]
- Supabase RLS 정책: official_wordbooks/official_words의 INSERT/UPDATE/DELETE는 role='admin'만 허용
- 일반 사용자가 admin API 직접 호출 시 RLS에서 차단 (클라이언트 role 우회 불가)
- 초기 관리자 계정은 Supabase 콘솔에서 수동으로 role='admin' 설정
```
- 리뷰: RLS 정책에서 auth.uid()로 users 테이블 role 조회 서브쿼리 방식이 맞는지 검토 → Supabase 공식 패턴(auth.jwt() ->> 'role' 방식 vs users 테이블 서브쿼리 방식) 비교 후 users 테이블 서브쿼리 방식 채택

---

#### SBI-H01 | 캐릭터 프리뷰 + 전공 선택 + 칭호 선택

**FE:**

- 적용 기법: 컨텍스트 엔지니어링, 프롬프트 엔지니어링 (전역 상태 연동 명시)
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase
전역 상태: React Context (MajorContext — 선택 전공 상태 전역 공유)
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-H01 캐릭터 프리뷰 + 전공/칭호 선택 FE]
세부 작업:
  1. 캐릭터 이미지 표시 컴포넌트
  2. 레벨, 닉네임, 책갈피, 현재 선택 전공·칭호 표시 UI
  3. 전공 선택 UI — 드롭다운 또는 모달 (최대 2개 선택)
  4. 칭호 선택 UI — 보유 칭호 중 1개 선택, 없으면 비활성화
  5. 전공 변경 시 MajorContext 업데이트 → N01 공식 단어장 자동 갱신
  6. 상점 이동 버튼 배치 (버튼만, 페이지 구현 없음)

[제약]
- Tailwind 클래스만 사용
- 전공 최대 2개 선택: 이미 2개 선택 시 추가 선택 비활성화
- 칭호 시스템 Post-MVP: MVP에서는 칭호 목록 없으면 선택 UI 비활성화
- 전공 변경 → MajorContext 값 변경 → N01 컴포넌트가 Context 구독하여 자동 갱신
```
- 리뷰: AI가 전공 선택을 로컬 state로만 관리하고 Context 업데이트를 누락 → "MajorContext의 setMajor를 반드시 호출해야 N01이 자동 갱신된다"고 재요청

**BE:**

- 적용 기법: 컨텍스트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: Supabase (DB + RLS)
DB 테이블: users (id, major, active_title, star_dust, level, nickname)

[구현 대상: SBI-H01 BE]
세부 작업:
  1. 사용자 프로필 조회 API (전공, 칭호, 레벨, 책갈피, 닉네임 포함)
  2. 전공 선택 저장/수정 API — users.major 필드 UPDATE
  3. 칭호 선택 저장 API — users.active_title 필드 UPDATE

[제약]
- RLS: users 테이블 UPDATE는 본인(auth.uid() = id)만 허용
- major 필드: 전공 코드 배열 또는 콤마 구분 문자열 (DB 스키마 확인 후 일치시킬 것)
- 칭호 선택은 보유 칭호 목록 조회 후 검증 (Post-MVP 칭호 테이블 없으면 active_title만 UPDATE)
```
- 리뷰: 특이사항 없음 — RLS 정책 적용 확인 후 통과

---

#### SBI-H02 | 출석 체크 / 스트릭

**FE:**

- 적용 기법: 컨텍스트 엔지니어링, 프롬프트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-H02 출석 체크 / 스트릭 FE]
세부 작업:
  1. 출석 체크 버튼 UI (클릭 시 출석 API 호출)
  2. 스트릭 시각화 UI (연속 출석일 수 표시, 풀이 레벨에 따라 진하기)
  3. 당일 출석 완료 상태 표시 (버튼 비활성화)

[제약]
- 당일 출석 여부는 페이지 진입 시 BE API로 확인
- 출석 완료 시 책갈피 수량이 H05 Realtime으로 자동 갱신됨 (별도 처리 불필요)
- 스트릭 데이터는 BE API 응답값 사용
```
- 리뷰: AI가 출석 상태를 클라이언트 날짜 비교로만 확인하려 함 → "당일 출석 여부는 반드시 서버 DB 조회 결과로 판단해야 한다"고 재요청

**BE:**

- 적용 기법: 컨텍스트 엔지니어링, 프롬프트 엔지니어링 (트랜잭션 보장 명시)
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: Supabase (DB + RLS)
DB 테이블: attendance (id, user_id, date, created_at), users (star_dust), star_dust_logs (id, user_id, change_amount, reason, ref_id, created_at)

[구현 대상: SBI-H02 출석 체크 BE]
세부 작업:
  1. 출석 기록 저장 API — attendance 테이블 INSERT (오늘 날짜)
  2. 출석 보상 책갈피 지급 — DB 함수(트랜잭션)로 구현:
     - users.star_dust += 보상량
     - star_dust_logs INSERT (change_amount=보상량, reason='attendance', ref_id=attendance.id)
  3. 스트릭 계산 로직 — 연속 출석일 수 반환
  4. 당일 출석 여부 조회 API

[제약]
- RLS: attendance 테이블 INSERT는 본인+오늘날짜만 허용 (중복 출석 방지)
- 책갈피 지급은 반드시 단일 트랜잭션으로 처리 (users 업데이트 + 로그 INSERT 원자성)
- DB 함수(Supabase rpc)로 트랜잭션 보장
```
- 리뷰: AI가 책갈피 지급을 두 번의 개별 UPDATE/INSERT로 구현 → "단일 DB 함수(RPC)로 트랜잭션 처리해야 한다, 중간 실패 시 롤백 보장이 필요하다"고 재요청

---

#### SBI-H04 | PDF → AI 단어장 생성

**FE:**

- 적용 기법: 컨텍스트 엔지니어링, 프롬프트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: React, Tailwind CSS
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-H04 PDF 업로드 바 FE]
세부 작업:
  1. 메인 화면 PDF 업로드 입력 바 UI
  2. 업로드 진행 상태 표시 (로딩 스피너 또는 프로그레스 바)
  3. 단어장 2개 보유 시 업로드 바 비활성화

[제약]
- 파일 타입 제한: PDF만 허용 (accept=".pdf")
- 업로드 완료 후 AI 추출 중 로딩 상태 표시
- 단어장 개수는 BE API로 확인 (페이지 진입 시 조회)
- 생성 완료 시 나만의 단어장 목록 자동 갱신
```
- 리뷰: 특이사항 없음

**BE:**

- 적용 기법: 컨텍스트 엔지니어링, 프롬프트 엔지니어링 (OpenAI API 프롬프트 설계), Few-shot
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: Supabase Edge Functions (또는 별도 서버), OpenAI API (GPT-4o)
DB 테이블: user_wordbooks (id, user_id, title, created_at), user_words (id, wordbook_id, english, general_meaning, major_meaning, general_example, major_example)
환경변수: OPENAI_API_KEY

[구현 대상: SBI-H04 PDF→AI 단어장 생성 BE]
세부 작업:
  1. PDF 파일 수신 및 텍스트 추출
  2. OpenAI API 호출 — 단어 추출 프롬프트:
     페르소나: "너는 학술 PDF에서 전공 핵심 단어를 추출하는 전문가다."
     입력: [추출된 PDF 텍스트]
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
- 리뷰: AI가 OpenAI 응답을 파싱 없이 바로 저장하려 함 → "JSON 파싱 실패 시 에러 핸들링 추가 + general_meaning이 null인 경우 허용"하도록 재요청

---

#### SBI-H05 | 책갈피 실시간 조회

**FE:**

- 적용 기법: 컨텍스트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase Realtime
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-H05 책갈피 실시간 조회 FE]
세부 작업:
  1. 책갈피 수량 표시 UI (메인 화면 상단)
  2. Supabase Realtime 구독 — users.star_dust 컬럼 변경 시 자동 갱신

[제약]
- 구독 채널: users 테이블, 본인 row의 star_dust 변경 이벤트만 구독
- 컴포넌트 unmount 시 구독 해제 (메모리 누수 방지)
- 초기값은 API 조회 후 표시, 이후 Realtime으로 업데이트
```
- 리뷰: AI가 channel filter 없이 users 테이블 전체를 구독 → "filter: `id=eq.${userId}` 조건 추가해야 본인 row만 구독된다"고 재요청

**BE:**

- 적용 기법: 컨텍스트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: Supabase (DB + Realtime)
DB 테이블: users (star_dust)

[구현 대상: SBI-H05 책갈피 실시간 BE]
세부 작업:
  1. Supabase Realtime 설정 확인 — users 테이블 Realtime 활성화
  2. star_dust 컬럼 변경 시 클라이언트로 이벤트 전파 확인

[제약]
- Supabase 콘솔에서 users 테이블 Replication 활성화 필요
- RLS 적용 상태에서도 Realtime 이벤트가 본인 row만 전달되는지 확인
```
- 리뷰: Supabase RLS 활성화 시 Realtime 이벤트 필터링 동작 확인 → 별도 테스트 후 정상 작동 확인

---

#### SBI-N01 | 공식 단어장 조회

**FE:**

- 적용 기법: 컨텍스트 엔지니어링 (MajorContext 구독 명시)
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase
전역 상태: MajorContext (H01에서 설정한 선택 전공 상태)
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-N01 공식 단어장 조회 FE]
세부 작업:
  1. 공식 단어장 목록 페이지 UI (현재 선택 전공 기반 자동 필터링)
  2. MajorContext 구독 — 전공 변경 시 목록 자동 갱신
  3. 단어 카드 UI (영어 / 일반뜻(optional) / 전공뜻 / 일반예문 / 전공예문)
     - general_meaning이 null이면 해당 항목 표시 생략

[제약]
- 전공 선택이 없으면 빈 상태 안내 문구 표시
- general_meaning null 처리: 조건부 렌더링 (null이면 항목 자체를 렌더링 안 함)
- 수동 전공 필터 탭 없음 — MajorContext 값만 사용
```
- 리뷰: AI가 general_meaning을 항상 렌더링하고 null일 때 빈 문자열 표시 → "null이면 해당 항목 DOM 자체를 렌더링하지 말 것"으로 재요청

**BE:**

- 적용 기법: 컨텍스트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: Supabase (DB + RLS)
DB 테이블: official_wordbooks (id, major, title), official_words (id, wordbook_id, english, general_meaning, major_meaning, general_example, major_example)

[구현 대상: SBI-N01 공식 단어장 BE]
세부 작업:
  1. 전공 기반 공식 단어장 목록 조회 API (쿼리 파라미터: major)
  2. 단어 카드 데이터 조회 API (wordbook_id 기반)

[제약]
- RLS: official_wordbooks/official_words는 로그인 사용자 전체 SELECT 허용 (로그인 필수)
- major 파라미터 미전달 시 전체 목록 반환 또는 빈 배열 반환 (정책 결정 후 명시)
- general_meaning은 null 가능 — API 응답에서 null 그대로 반환
```
- 리뷰: 특이사항 없음

---

#### SBI-N02 | 나만의 단어장 조회

**FE:**

- 적용 기법: 컨텍스트 엔지니어링, 프롬프트 엔지니어링 (2개 제한 로직 명시)
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-N02 나만의 단어장 조회 FE]
세부 작업:
  1. 페이지 레이아웃: 상단 PDF 업로드 바 + 하단 단어장 카드 목록 (최대 2개)
  2. 단어장 2개 보유 시 업로드 바 비활성화
  3. 단어장 카드 내 삭제 버튼 + 삭제 확인 모달
  4. 단어 카드 조회 UI (읽기 전용, 수정 버튼 없음)

[제약]
- 단어장 개수는 BE API로 확인 (하드코딩 금지)
- 삭제 확인 모달: "정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
- 단어 수정 UI 없음 (MVP에서 읽기 전용)
- 삭제 완료 후 목록 자동 갱신
```
- 리뷰: 특이사항 없음

**BE:**

- 적용 기법: 컨텍스트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: Supabase (DB + RLS)
DB 테이블: user_wordbooks (id, user_id, title, created_at), user_words (id, wordbook_id, english, general_meaning, major_meaning, general_example, major_example)

[구현 대상: SBI-N02 나만의 단어장 BE]
세부 작업:
  1. 사용자별 단어장 목록 조회 API (user_wordbooks, 본인만)
  2. 단어 목록 조회 API (wordbook_id 기반, 본인 단어장 소속만)
  3. 단어장 삭제 API (단어장 + 소속 단어 cascade 삭제, 본인만)
  4. 단어장 개수 조회 API (2개 초과 방지 검증용)

[제약]
- RLS: user_wordbooks SELECT/DELETE는 본인(auth.uid() = user_id)만 허용
- CASCADE 삭제: user_wordbooks 삭제 시 user_words도 자동 삭제 (FK CASCADE 설정)
- MVP에서 title UPDATE RLS 비활성화 (UPDATE 정책 없음)
- 개수 조회 API 응답: { count: number }
```
- 리뷰: AI가 CASCADE 삭제를 API 레벨에서 수동으로 구현 → "FK CASCADE 설정으로 DB 레벨에서 처리하는 것이 더 안전하다"고 재요청

---

#### SBI-N03 | 테스트 (퀴즈 — Lv1)

**FE:**

- 적용 기법: 컨텍스트 엔지니어링, 프롬프트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-N03 테스트 FE]
세부 작업:
  1. 테스트 시작 화면 (단어장 선택 — 공식/나만의 단어장 목록)
  2. Lv1 퀴즈 UI (뜻 → 영어 4지선다 객관식)
  3. 테스트 결과 화면 (정답률 표시 + 책갈피 획득량 표시)

[제약]
- 문제는 BE API에서 생성하여 반환 (클라이언트 랜덤 생성 금지)
- 정답 제출은 문항별이 아닌 전체 완료 후 일괄 제출
- 결과 화면: 정답률(%) + 획득 책갈피 수량 표시
- Lv2~4 UI 없음 (MVP는 Lv1만)
```
- 리뷰: AI가 정답 여부를 클라이언트에서 계산 → "정답 검증은 BE에서 처리해야 한다, 클라이언트에 정답 데이터 노출 금지"로 재요청

**BE:**

- 적용 기법: 컨텍스트 엔지니어링, 프롬프트 엔지니어링 (트랜잭션 + 보안 검증 명시)
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: Supabase (DB + RLS)
DB 테이블: test_results (id, user_id, wordbook_id, wordbook_type, score, created_at), users (star_dust), star_dust_logs (id, user_id, change_amount, reason, ref_id, created_at)

[구현 대상: SBI-N03 테스트 BE]
세부 작업:
  1. Lv1 문제 생성 API — 뜻→영어 4지선다:
     - 선택된 단어장에서 단어 무작위 선택
     - 오답 3개는 다른 단어장에서 무작위 선택
  2. 테스트 결과 저장 API:
     - wordbook_type에 따라 wordbook_id 존재 여부 서버 검증
     - test_results INSERT (본인만)
  3. 테스트 참여 보상 책갈피 지급 — DB 함수(트랜잭션):
     - users.star_dust += 보상량
     - star_dust_logs INSERT (change_amount=보상량, reason='test_reward', ref_id=test_results.id)

[제약]
- 문제 생성 시 정답 정보는 서버에서 세션/임시 저장, 클라이언트에 정답 미포함
- RLS: test_results INSERT는 본인만 허용
- 책갈피 지급은 단일 DB 함수(RPC)로 트랜잭션 보장
- wordbook_id 검증: 공식 단어장이면 official_wordbooks, 나만의 단어장이면 user_wordbooks에서 존재 확인
```
- 리뷰: AI가 문제 생성 시 정답 인덱스를 API 응답에 포함 → "정답 인덱스를 클라이언트에 노출하면 치팅 가능, 서버 세션에만 보관해야 한다"고 재요청

---

#### SBI-U04 | 단어장별 학습 진행률

**FE:**

- 적용 기법: 컨텍스트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase
Supabase 클라이언트: src/utils/supabase.js

[구현 대상: SBI-U04 학습 진행률 FE]
세부 작업:
  1. 단어장별 진행률 표시 UI (프로그레스 바 + % 수치)

[제약]
- 진행률 데이터는 BE API에서 수신 (학습 완료 단어 수 / 전체 단어 수)
- 소수점 버림으로 정수 % 표시
```
- 리뷰: 특이사항 없음

**BE:**

- 적용 기법: 컨텍스트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: Supabase (DB)
DB 테이블: user_wordbooks, user_words, test_results (학습 완료 기준 정의 필요)

[구현 대상: SBI-U04 학습 진행률 BE]
세부 작업:
  1. 단어장별 진행률 계산 API:
     - 전체 단어 수: user_words COUNT
     - 학습 완료 단어 수: 해당 단어가 테스트에서 정답 처리된 횟수 기준 (또는 별도 학습 완료 플래그 기준)

[제약]
- 학습 완료 기준을 팀 내 정의 후 쿼리에 반영 (예: 테스트에서 1회 이상 정답 처리)
- RLS: 본인 단어장 데이터만 조회 가능
```
- 리뷰: 학습 완료 기준이 DB 스키마에 명확하지 않아 팀 내 정의 후 재프롬프트 — "테스트에서 정답 처리된 단어를 word_id 기준으로 집계"하는 방식으로 확정

---

#### SBI-A01 | 공식 단어장 데이터 CRUD

**FE:**

- 적용 기법: 컨텍스트 엔지니어링, 프롬프트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: React, Tailwind CSS, Supabase
라우팅: /admin 하위 경로 (AdminRoute로 접근 제한)

[구현 대상: SBI-A01 관리자 공식 단어장 CRUD FE]
세부 작업:
  1. 관리자 공식 단어장 관리 페이지 UI
     - 단어 목록 테이블 (전공별 필터 포함)
     - 단어 추가 폼 (영어/일반뜻/전공뜻/예문)
     - 단어 수정 인라인 또는 모달 폼
     - 단어 삭제 버튼 (확인 모달)

[제약]
- /admin 경로는 AdminRoute로 role='admin' 확인 후 접근 허용
- 일반 사용자 UI와 완전히 분리된 별도 페이지
```
- 리뷰: 특이사항 없음

**BE:**

- 적용 기법: 컨텍스트 엔지니어링
- 실제 프롬프트 구조:
```
[컨텍스트]
기술스택: Supabase (DB + RLS)
DB 테이블: official_wordbooks (id, major, title), official_words (id, wordbook_id, english, general_meaning, major_meaning, general_example, major_example)

[구현 대상: SBI-A01 공식 단어장 CRUD BE]
세부 작업:
  1. 공식 단어장 CRUD API (official_wordbooks, official_words)
     - CREATE: 단어장 추가 + 단어 추가
     - READ: 전공별 목록 조회
     - UPDATE: 단어 수정
     - DELETE: 단어장 삭제 (cascade) / 단어 삭제
  2. 관리자 권한 검증 미들웨어 (RLS 적용)

[제약]
- RLS: official_words INSERT/UPDATE/DELETE는 role='admin'인 사용자만 허용
- 일반 사용자는 SELECT만 가능
- 관리자 권한 우회 시 RLS에서 자동 차단
```
- 리뷰: 특이사항 없음 — RLS 정책이 관리자 CRUD와 일반 사용자 SELECT를 정확히 분리함을 확인

---

## 8. Sprint Increment 설명

*(시연 영상 포함)*

### 완성된 기능 목록 (DoD 기준 통과)

| SBI | 기능명 | 완료 여부 |
|-----|--------|---------|
| L01 | 회원가입 (이메일 인증) | |
| L02 | 로그인 (일반 + OAuth) | |
| L05 | 관리자 로그인 및 권한 분리 | |
| H01 | 캐릭터 프리뷰 + 전공 선택 | |
| H02 | 출석 체크 / 스트릭 + 책갈피 보상 | |
| H04 | PDF → AI 단어장 생성 | |
| H05 | 책갈피 실시간 조회 | |
| N01 | 공식 단어장 조회 (전공 연동) | |
| N02 | 나만의 단어장 조회 + 삭제 | |
| N03 | 테스트 Lv1 + 결과 저장 + 보상 | |
| U04 | 단어장별 학습 진행률 | |
| A01 | 공식 단어장 CRUD | |

---

## 9. Sprint Review 결과

### 피드백 (사용자 / 팀 내부)

| 피드백 | 분류 | 조치 |
|--------|------|------|
| | 기능 개선 | |
| | 버그 | |
| | UX | |

### 백로그 변경

| 항목 | 변경 내용 |
|------|---------|
| 새로 추가된 PBI | |
| 우선순위 변경 | |

---

## 10. Sprint Retrospective

### 잘된 점 (What went well)

- AI 버전 관리 + 서기 리뷰 루프가 회의 결정사항 누락을 방지하는 데 효과적이었음
- 팀A/팀B 병렬 개발이 의존성 순서를 명확히 한 덕분에 충돌 없이 진행됨

### 문제점 (What didn't go well)

| 문제 | 원인 |
|------|------|
| | |

### 개선 액션 (Action Items)

| 액션 | 담당자 | 기한 |
|------|--------|------|
| | | |
