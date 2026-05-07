# EduLex — Project Context for AI

## Tech Stack (고정 — 변경 제안 금지)

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Routing | react-router-dom v7 |
| 전역 상태 | React Context → Redux Toolkit (도입 예정) |
| Backend | Supabase (Auth, PostgreSQL, Realtime, Edge Functions) |
| AI / NLP | Groq API (llama-3.3-70b), TF-IDF, Claude AI |
| PDF 처리 | pdfjs-dist v5 |
| Icons | lucide-react |
| Language | JavaScript (JSX), no TypeScript |

> Supabase는 유일한 백엔드. Firebase, Prisma, Express 등 제안 금지.  
> TypeScript, Zustand 도입 제안 금지.

### 전역 상태 규칙

현재 전역 상태는 `AuthContext` / `MajorContext` 2개로만 관리한다.

- RTK 도입 전: Context 2개 유지, Redux 패턴(useSelector, useDispatch) 코드 작성 금지
- RTK 도입 후: 새 전역 상태는 RTK slice로만 추가, Context 신규 추가 금지
- RTK 도입 조건: 비동기 상태를 여러 컴포넌트가 공유 / Context re-render 성능 이슈 / 상태 로직 분산
- RTK 도입 시: `createSlice` + `createAsyncThunk` 패턴, Supabase 쿼리는 thunk 내부에서만

---

## Database (Supabase)

### 테이블

```
users             (id, email, nickname, major text[], active_title, bookmark int, level int)
attendance        (user_id, date)
user_wordbooks    (id, user_id, title, updated_at)
user_words        (id, user_id, wordbook_id, english, meanings jsonb)
official_wordbooks(id, title, major)
official_words    (id, wordbook_id, english, general_meaning, major_meaning)
quiz_results      (id, user_id, wordbook_id, score, created_at)
word_progress     (id, user_id, word_id, is_completed)
bookmark_logs     (id, user_id, word_id, created_at)
```

### RPC / Edge Functions

| Identifier | 용도 |
|---|---|
| `check_attendance` (RPC) | 오늘 출석 여부 조회 |
| `save_quiz_result` (RPC) | 퀴즈 결과 저장 |
| `/functions/v1/generate-word-info` | 단어 정보 AI 생성 |
| `/functions/v1/create-wordbook-from-pdf` | PDF → 단어장 생성 |

---

## Architecture

### 폴더 역할

| 폴더 | 역할 | 배치 기준 |
|---|---|---|
| `pages/` | 라우트 단위 뷰. hook + component 조합만 | URL에 직접 대응 |
| `components/` | 재사용 UI 블록 | 2곳 이상에서 사용 |
| `components/ui/` | 상태 없는 원자 UI | props만으로 완결 |
| `hooks/` | 데이터 패칭 + 비즈니스 로직 | Supabase 쿼리, side effect 포함 시 |
| `context/` | 앱 전역 공유 상태 | 트리 전체에 필요한 값 |
| `utils/` | 순수 함수, 외부 클라이언트 초기화 | React 비의존 로직 |
| `constants/` | 불변 값, 디자인 토큰 | 컴포넌트에 하드코딩 금지 값 |

### 컴포넌트 분리 기준

아래 중 하나라도 해당하면 분리한다:

1. 파일 200줄 초과 또는 JSX 블록 50줄 초과
2. 동일 UI가 2곳 이상 반복
3. 데이터 패칭 + 렌더링이 같은 함수에 혼재 → hook으로 추출
4. 로컬 상태가 부모와 무관

분리 방향: 로직 → `hooks/use페이지명.js` / UI 블록 → `components/기능명.jsx` / 원자 UI → `components/ui/컴포넌트명.jsx`

### High Cohesion / Low Coupling

**High Cohesion** — 각 모듈은 단일 도메인만 담당한다:
- hook은 하나의 도메인(출석, 퀴즈, 북마크)만 다룬다
- 상수(팔레트, 전공 목록, 설정값)는 `constants/theme.js` 한 곳에만 존재한다
- 페이지 컴포넌트는 hook + component 조합 역할만 한다

**Low Coupling** — 모듈 간 의존을 최소화한다:
- `page → hook` 단방향. hook이 특정 페이지를 import하는 역방향 금지
- Supabase 호출은 hook 내부에서만. 페이지/컴포넌트 직접 호출 금지
- `components/ui/` 원자 컴포넌트에 Supabase 또는 Context 의존 금지
- props 전달 depth 3단계 초과 시 Context 또는 RTK로 올린다
- Supabase 클라이언트는 `utils/supabase.js` 단일 인스턴스만 import

---

## Naming Conventions

| 대상 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 파일 | `PascalCase.jsx` | `CharacterPreview.jsx` |
| 훅 파일 | `useCamelCase.js` | `useMainPage.js` |
| 이벤트 핸들러 | `handle + 동사 + 대상` | `handleMajorSelect` |
| 훅 반환 상태 | `명사` / `set + 명사` | `wordbooks` / `setWordbooks` |
| 훅 반환 함수 | `동사 + 명사` | `fetchWordbooks` |
| 상수 (파일 스코프) | `UPPER_SNAKE_CASE` | `MAX_WORDBOOKS` |
| Context value 키 | `camelCase` | `selectedMajors` |
| DB 컬럼 참조 | snake_case 그대로 | `bookmark`, `bookmark_logs` |
| Supabase RPC | `snake_case` | `check_attendance` |
| CSS 클래스 | Tailwind 유틸리티만, BEM 금지 | `text-sm font-bold` |

---

## Coding Standards

- 모듈 크기: 200줄 이하 권장, 300줄 초과 시 반드시 분리
- 변수는 반드시 초기화 (`useState(null)`, undefined 방치 금지)
- `useEffect` 의존성 배열 빠짐없이 명시 (exhaustive-deps 준수)
- Supabase 쿼리는 `{ data, error }` 구조 분해 후 `if (error)` 처리
- 비동기 함수는 `async/await` 사용, `.then().catch()` 혼용 금지
- 색상은 `theme.js`의 `LIB` 팔레트만 참조, 하드코딩 hex 금지
- 전공 목록은 `constants/theme.js`의 `MAJORS` 배열만 참조, 하드코딩 금지
- 새 상수는 `constants/theme.js`에 추가, 컴포넌트 파일 최상단 정의 금지
- 주석은 WHY가 비자명한 경우에만 작성. 기본 2줄 이하, 필요 시 더 길게 — 단 줄바꿈으로 스크롤 가독성 유지

---

## Security

- 퀴즈 정답 배열을 JSX state나 props로 노출 금지
- `users.role`을 클라이언트 변수/Context에 저장 금지 → DB 조회로만 검증
- `users.bookmark` 클라이언트에서 직접 증감 금지 → RPC or Edge Function 경유
- API 키 코드에 하드코딩 금지 → `.env.local`
- Supabase Realtime 구독 시 `useEffect` cleanup에서 반드시 구독 해제

---

