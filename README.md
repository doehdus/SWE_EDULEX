<div align="center">

# 📚 EduLex

### 전공 어휘 학습 웹 플랫폼

**Education + Lexicon** | 전공 수업·원서를 읽는 대학생을 위한 게이미피케이션 기반 단어 학습 서비스

<br/>

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI_API-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

[![GitHub](https://img.shields.io/badge/GitHub_Projects-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/)
[![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://figma.com/)
[![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)](https://notion.so/)
[![VS Code](https://img.shields.io/badge/Visual_Studio_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)

</div>

---

## 📌 목차

1. [Vision & Goal](#-vision--goal)
2. [기술 스택](#-기술-스택)
3. [협업 규약](#-협업-규약)
4. [커밋 메시지 규칙](#-커밋-메시지-규칙)
5. [폴더 구조](#-폴더-구조)
6. [MVP Sprint Backlog](#-mvp-sprint-backlog)
7. [DB 설계서 (ERD)](#-db-설계서-erd)
8. [API 명세서](#-api-명세서)
9. [WBS](#-wbs)
10. [Post-MVP](#-post-mvp)

---

## 🎯 Vision & Goal

> 🏫 **Vision** — 전공 어휘에 특화된 교육 플랫폼으로, 단순 단어장이 아닌 체계적·과학적 교육 방법론 기반의 학습 도구를 제공한다.

| 항목 | 내용 |
|------|------|
| **대상** | 전공 수업/원서를 읽는 대학생 |
| **핵심 가치** | 게이미피케이션 요소(별가루, 캐릭터, 칭호, 스트릭)로 지속적 학습 동기 부여 |
| **목표** | 전통 방식 대비 **140%에 근접한 암기 성공률** 달성 |

---

## 🛠 기술 스택

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

### Backend / Database
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

### AI
![OpenAI](https://img.shields.io/badge/OpenAI_GPT-412991?style=flat-square&logo=openai&logoColor=white)
![Claude](https://img.shields.io/badge/Claude_AI-D97757?style=flat-square&logo=anthropic&logoColor=white)

### Design & Collaboration
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=flat-square&logo=figma&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=flat-square&logo=visual-studio-code&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)
![Notion](https://img.shields.io/badge/Notion-000000?style=flat-square&logo=notion&logoColor=white)

| 구분 | 기술 | 용도 |
|------|------|------|
| Frontend | React + Tailwind CSS | UI/UX 구현 |
| Backend/DB | Supabase (Auth, Realtime, PostgreSQL) | 인증, 실시간 동기화, 데이터 저장 |
| AI | OpenAI API (GPT) | PDF → 단어 자동 추출 |
| AI 보조 | Claude AI | 개발 보조 |
| 디자인 | Figma | 프로토타입 및 UI 설계 |
| 협업 | GitHub Projects, Notion, KakaoTalk | 스프린트 관리, 문서화, 소통 |

---

## 🤝 협업 규약

### 팀 구성

| 팀 | 구성 | 담당 영역 |
|----|------|-----------|
| **팀A** | FE1 + BE1 | 기반 인프라 + 외부 API |
| **팀B** | FE1 + BE1 | UX/게임화 + 단어장 소비 |
| **서기** | 1명 | Kanban 감독, 팀 라벨 관리, 발표 자료 준비 |

### 브랜치 전략

```
main              ← 배포 브랜치 (직접 push 금지 🚫)
└── develop       ← 통합 브랜치 (feature → develop merge)
    ├── feat/fe-{기능명}    예: feat/fe-signup
    └── feat/be-{기능명}    예: feat/be-db-schema
```

> - `new branch` 생성 후 개발 시작
> - `develop`까지만 merge — **`main` 직접 push 금지**
> - FE·BE 각자 독립 개발 → F+B 결합 → 통합 검증

### 워크플로우 (GitHub Kanban)

```
📋 In Progress  →  ✅ Done  →  🔍 Review & Retrospection
```

| 단계 | 설명 |
|------|------|
| **In Progress** | new branch 생성 후 개발 시작 |
| **Done** | FE·BE 기능 비교 실행 후 결합 완료 |
| **Review & Retrospection** | 통합 검증 및 회고 |

---

## 📝 커밋 메시지 규칙

```
<type>/<scope>: <제목>

[선택] 본문 설명
```

| type | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `style` | 코드 포맷팅 (기능 변경 없음) |
| `refactor` | 코드 리팩토링 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드 설정, 패키지 관리 |

**예시**
```bash
feat/fe: 회원가입 폼 UI 구현
feat/be: Supabase Auth 이메일 인증 연동
fix/fe: 전공 선택 드롭다운 초기화 버그 수정
docs: API 명세서 업데이트
```

---

## 📁 폴더 구조

```
edulex/
├── frontend/                   # ⚛️  React + Tailwind CSS
│   ├── public/
│   └── src/
│       ├── components/         # 공통 컴포넌트
│       ├── pages/              # 페이지 단위 컴포넌트
│       │   ├── auth/           # 회원가입, 로그인
│       │   ├── main/           # 메인 화면
│       │   ├── wordbook/       # 공식/나만의 단어장
│       │   ├── test/           # 퀴즈 테스트
│       │   ├── dashboard/      # 사용자 대시보드
│       │   └── admin/          # 관리자 페이지
│       ├── context/            # 전역 상태 (전공 선택 등)
│       ├── hooks/              # 커스텀 훅
│       ├── lib/                # Supabase 클라이언트, API 유틸
│       └── assets/             # 이미지, 아이콘
│
├── backend/                    # 🗄️  Supabase Edge Functions
│   ├── functions/              # 서버리스 함수
│   │   ├── auth/
│   │   ├── wordbook/
│   │   ├── test/
│   │   └── admin/
│   └── supabase/
│       ├── migrations/         # DB 마이그레이션
│       └── seed/               # 초기 데이터
│
└── docs/                       # 📄 산출물 문서
    ├── erd/                    # DB 설계서 (ERD)
    ├── api/                    # API 명세서
    └── wbs/                    # WBS
```

---

## 🚀 MVP Sprint Backlog

> **Sprint 기간**: 1주 (병렬 개발) | **MVP 범위**: High 전부 + Medium 일부 (총 12개 PBI)

### Sprint Goal

> 💡 사용자가 계정을 생성하고 로그인한 뒤, 전공을 선택하여 공식 단어장을 조회하고,  
> PDF를 업로드해 AI가 자동 생성한 나만의 단어장으로 Lv1 퀴즈를 풀고 별가루 보상을 받을 수 있다.

---

### 🅰️ 팀A — 기반 인프라 + 외부 API

| 단계 | SBI ID | 기능 | 우선순위 |
|:----:|--------|------|:-------:|
| 1️⃣ | `SBI-L01` | 회원가입 (이메일 인증, 닉네임/비밀번호) | 🔴 High |
| 2️⃣ | `SBI-L02` | 사용자 로그인 (일반 + OAuth) | 🔴 High |
| 2️⃣ | `SBI-L05` | 관리자 로그인 및 권한 부여 | 🔴 High |
| 3️⃣ | `SBI-A01` | 공식 단어장 데이터 CRUD | 🔴 High |
| 3️⃣ | `SBI-H04` | PDF → AI 단어장 생성 바 (OpenAI API) | 🔴 High |
| 4️⃣ | `SBI-H05` | 별가루 실시간 조회 (Supabase Realtime) | 🔴 High |

### 🅱️ 팀B — UX/게임화 + 단어장 소비

| 단계 | SBI ID | 기능 | 우선순위 |
|:----:|--------|------|:-------:|
| 1️⃣ | `SBI-H01` | 캐릭터 프리뷰 + 전공 선택(최대 2개) + 칭호 선택 | 🟡 Medium |
| 2️⃣ | `SBI-H02` | 출석 체크 / 스트릭 | 🟡 Medium |
| 2️⃣ | `SBI-N01` | 공식 단어장 조회 (전공 상태 연동) | 🔴 High |
| 3️⃣ | `SBI-N02` | 나만의 단어장 조회 (최대 2개, 삭제 포함) | 🔴 High |
| 4️⃣ | `SBI-N03` | 테스트 퀴즈 Lv1 (뜻→영어 4지선다) | 🔴 High |
| 4️⃣ | `SBI-U04` | 단어장별 학습 진행률 | 🟡 Medium |

> ⚠️ 팀B는 팀A의 인증(L01/L02) 완료 후 1단계 시작 | `SBI-N02`는 팀A의 H04 완료 후 연동

---

### ✅ 통합 테스트 체크리스트

- [ ] 팀A ↔ 팀B API 연동 확인 (인증 토큰, 사용자 데이터 공유)
- [ ] H01 전공 선택 → N01 공식 단어장 자동 갱신 연동 확인
- [ ] 별가루 지급 흐름 전체 테스트 (출석 → H05 실시간 반영, 테스트 참여 → 지급)
- [ ] PDF 업로드 → OpenAI API 추출 → 단어장 생성 E2E 테스트
- [ ] 퀴즈 Lv1 동작 및 결과 저장 확인
- [ ] 관리자 권한 분리 보안 테스트
- [ ] Supabase Realtime 동기화 확인

---

## 🗃️ DB 설계서 (ERD)

> 상세 내용: [docs/erd/README.md](docs/erd/README.md)

**주요 테이블**

| 테이블 | 설명 |
|--------|------|
| `users` | 사용자 정보 (닉네임, major, active_title, star_dust) |
| `official_wordbooks` | 공식 단어장 |
| `official_words` | 공식 단어 (영어, 전공뜻, 일반예문, 전공예문) |
| `user_wordbooks` | 나만의 단어장 (최대 2개) |
| `user_words` | 나만의 단어 (PDF→AI 추출) |
| `attendance` | 출석 기록 및 스트릭 |
| `test_results` | 테스트 결과 (정답률, 별가루 지급) |

---

## 📡 API 명세서

> 상세 내용: [docs/api/README.md](docs/api/README.md)

**주요 엔드포인트 요약**

| Method | Endpoint | 설명 |
|:------:|----------|------|
| `POST` | `/auth/signup` | 회원가입 |
| `POST` | `/auth/login` | 로그인 |
| `GET` | `/users/me` | 사용자 프로필 조회 |
| `PATCH` | `/users/me/major` | 전공 선택 저장 |
| `GET` | `/wordbooks/official?major=` | 전공 기반 공식 단어장 조회 |
| `GET` | `/wordbooks/official/:id/words` | 공식 단어 카드 조회 |
| `POST` | `/wordbooks/user/upload` | PDF 업로드 → AI 단어장 생성 |
| `GET` | `/wordbooks/user` | 나만의 단어장 목록 조회 |
| `DELETE` | `/wordbooks/user/:id` | 나만의 단어장 삭제 (cascade) |
| `GET` | `/test/questions?wordbook=` | Lv1 문제 생성 |
| `POST` | `/test/results` | 테스트 결과 저장 |
| `POST` | `/attendance` | 출석 체크 |
| `GET` | `/admin/wordbooks` | 관리자 — 공식 단어장 관리 |

---

## 📊 WBS

> 상세 내용: [docs/wbs/README.md](docs/wbs/README.md)

| 단계 | 작업 | 담당 |
|------|------|:----:|
| 분석·설계 | 요구사항 정의, Backlog 작성, ERD 설계, Figma 프로토타입 | 전체 |
| Sprint 1단계 | L01 회원가입 / H01 캐릭터+전공 선택 | 팀A / 팀B |
| Sprint 2단계 | L02·L05 로그인 / H02·N01 출석·공식단어장 | 팀A / 팀B |
| Sprint 3단계 | A01·H04 단어장CRUD·PDF→AI / N02 나만의단어장 | 팀A / 팀B |
| Sprint 4단계 | H05 별가루 Realtime / N03·U04 테스트·진행률 | 팀A / 팀B |
| 통합·테스트 | API 연동, E2E 테스트, 보안 검증 | 전체 |
| 마감 | 발표 자료(pptx), 시연 영상 | 서기 + 전체 |

---

## 🔮 Post-MVP (향후 계획)

| 기능 | SBI ID |
|------|--------|
| Lv2~Lv4 테스트 (영어→뜻, 주관식, 빈칸채우기) | — |
| 오답 노트 | `SBI-U05` |
| 커뮤니티 — 정보 공유 / 단어장 공유 | `N04`, `N05` |
| 랭킹 조회 | `N06` |
| 상점 페이지 | `H06` |
| Q&A 게시판 | `N07`, `A04` |
| 관리자 — DB 모니터링, 전공별 사용자 시각화 | `A05`, `A06` |

---

<div align="center">

Copyright 2026 EduLex Team. All rights reserved.

</div>
