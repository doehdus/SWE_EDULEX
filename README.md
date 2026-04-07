# 📘 EduLex (에듀렉스)
> **AI 기반 전공 어휘 마스터 플랫폼**
> "단순한 암기를 넘어, 과학적인 방법론으로 당신의 전공 지식을 완성합니다."

---

## 🛠 기술 스택 (Tech Stack)
현재 프로젝트에 적용된 핵심 기술들입니다.
* **Framework**: `Next.js 15 (App Router)`
* **Language**: `TypeScript`
* **Styling**: `Tailwind CSS`, `React`
* **Database & Auth**: `Supabase`
* **AI Service**: `OpenAI API`, `Gemini` 
* **Data Fetching**: `React Query`

## 🛠 Tools & Environment

### Development & Design
![VS Code](https://img.shields.io/badge/Visual_Studio_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)

### Collaboration & Management
![GitHub](https://img.shields.io/badge/GitHub_Projects-181717?style=for-the-badge&logo=github&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)

---

## 🤝 프로젝트 관리 및 협업 규약

### 1. Project Board & Sprint 운영
우리 팀은 **GitHub Project Board**를 통해 모든 업무를 관리합니다.
* **Sprint 시작**: 모든 작업은 **Issue**로 먼저 등록한 후, Board의 `Todo` 섹션에 추가합니다.
* **작업 진행**: 작업을 시작하면 해당 카드를 `In Progress`로 옮기고 브랜치를 생성합니다.
* **검토 및 완료**: PR(Pull Request) 생성 시 `Review` 단계로 이동하며, 최종 머지(Merge) 시 `Done`으로 이동합니다.

### 2. 커밋 메시지 규칙 (Commit Convention)
**형식**: `타입: 상세 내용 (작성자)`

| 타입 | 설명 | 예시 |
| :--- | :--- | :--- |
| **Feat** | 새로운 기능 추가 | `Feat: AI 단어 추출 API 연결 (김도연)` |
| **Fix** | 버그 수정 | `Fix: Navbar 경로 에러 수정 (김광현)` |
| **Design** | UI 디자인 및 CSS 변경 | `Design: 메인 페이지 Hero 섹션 수정 (조민정)` |
| **Refactor** | 코드 리팩토링 | `Refactor: useWords 훅 로직 개선 (차지원)` |
| **Comment** | 주석 추가 및 변경 | `Comment: AI 서비스 함수 주석 추가 (황희)` |
| **Rename** | 파일/폴더명 및 경로 변경 | `Rename: navbar.tsx 소문자로 변경 (김도연)` |
| **Remove** | 파일 삭제 | `Remove: 사용하지 않는 이미지 자원 삭제 (김광현)` |

---

## 📂 폴더 구조 (Project Structure) / 예상
프로젝트의 확장성을 고려한 현재 디렉토리 구조입니다.
```text
src/
 ├── app/                 # Next.js 페이지 라우팅 및 레이아웃
 │    ├── (auth)/         # 로그인/회원가입 그룹
 │    ├── (main)/         # 대시보드 및 서비스 메인 기능 그룹
 │    ├── layout.tsx      # 전역 레이아웃
 │    └── page.tsx        # 메인 랜딩 페이지 (로그아웃 상태)
 ├── components/          # 공통 컴포넌트
 │    ├── layout/         # Navbar, Footer 등
 │    ├── ui/             # Button, Input 등 기초 UI
 │    └── word/           # 단어 학습 관련 전용 컴포넌트
 ├── hooks/               # useWords 등 API 통신 및 상태 관리 훅
 ├── services/            # aiService 등 외부 API 호출 로직
 ├── lib/                 # supabase 설정 및 유틸리티 함수
 └── types/               # TypeScript 인터페이스 및 타입 정의
.
.
.

⚙️ 시작 가이드 (Getting Started)
# 1. 저장소 복제
git clone [https://github.com/your-repo/swe_edulex.git](https://github.com/your-repo/swe_edulex.git)

# 2. 필수 패키지 설치
npm install

# 3. 환경 변수 설정
# .env.local 파일을 생성하고 아래 키를 입력하세요.
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
OPENAI_API_KEY=your_openai_key

# 4. 개발 서버 실행
npm run dev
