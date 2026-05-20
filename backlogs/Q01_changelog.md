# SBI-Q01 변경 이력
담당자: 차지원 (jiwon051130@naver.com)
SBI: 테스트 단어 수 선택
브랜치: 101-feature/n03-5-word-level-system

---

## v1.0 — 2026-05-19 (FE 구현)

### 배경
Post-MVP Sprint Backlog `3. sprint_backlog` v1.2 기준.
테스트 시작 전 단어 목록을 "전체" 또는 "절반" 중 선택해 학습 분량을 조절하는 기능 구현.
N03-5 단어 레벨 시스템 완성 이후 후속 UX 개선 작업.
BE는 `save_quiz_result` RPC가 `p_total = questions.length` 를 그대로 받는 구조라 가변 문제 수를 이미 지원 → **FE 전용 변경**.

### 변경 파일

#### FE
| 파일 | 변경 내용 |
|---|---|
| `edulex/src/pages/QuizPage.jsx` | 하기 참조 |

**QuizPage.jsx 주요 변경:**

| 항목 | 내용 |
|---|---|
| `buildQuestions` 시그니처 변경 | `(allWords)` → `(pool, source)` 로 분리. `pool` = 출제 단어, `source` = 오답 보기 생성 원본 |
| 10문제 캡 제거 | `shuffle(allWords).slice(0, Math.min(10, allWords.length))` → `shuffle(pool)` (캡 없음) |
| `wordCountMode` 상태 신규 | `'all'` \| `'half'` (기본값 `'all'`) |
| `startQuiz` 풀 슬라이싱 로직 | `wordCountMode === 'half'` 시 `shuffle(allWords).slice(0, Math.ceil(n/2))` 적용 |
| 최소 단어 체크 변경 | `allWords.length < 4` alert 제거 → `allWords.length === 0` 시 NoWordsModal 표시 |
| `SelectView` Step 3 UI 신규 | "전체 / 절반" 토글 버튼 (wood/gold 테마, Step 2 아래 배치) |
| `SelectView` props 확장 | `wordCountMode`, `onWordCountModeChange` 추가 |

### 설계 결정 사항

**오답 보기 소스:** `source = allWords` (레벨 필터가 적용된 전체 레벨 단어)
- 절반 모드에서 pool이 줄어도 오답 보기는 해당 레벨 전체 단어에서 생성
- 다른 레벨 단어는 보기에 섞이지 않음

**최소 단어 수 제한 제거:**
- 기존: 4개 미만 시 alert → 퀴즈 불가
- 변경: 1개 이상이면 퀴즈 진행 (보기 수가 줄어들더라도 허용)
- 0개 시에만 NoWordsModal 표시

**10문제 캡 제거:**
- 기존: 단어 수와 무관하게 항상 최대 10문제
- 변경: 단어 풀 크기 = 문제 수 (전체 30단어 → 30문제, 절반 15단어 → 15문제)

---

## 최종 배포 상태 (2026-05-19)

| 항목 | 상태 |
|---|---|
| Supabase 프로젝트 | `jiprhynqysjkbrhnstkt` (개발용, 차지원) |
| BE 변경 | 없음 (기존 `save_quiz_result` 8-param RPC 그대로 사용) |
| `QuizPage.jsx` | 구현 완료 |

---

## 스프린트 백로그 반영 (`3. sprint_backlog`)

| 항목 | 상태 |
|---|---|
| SBI-Q01 | 구현 완료 |

---

## 최종 세부 작업 목록

범례: `[x]` 원래 계획대로 구현  `[+]` 백로그에 없던 추가 구현  `[~]` 방식 변경/통합  `[ ]` 미구현(불필요 판정)

### FE

```
[x] 테스트 시작 화면에 "전체 / 절반" 선택 UI 추가 (Lv1~Lv4 공통 적용)
    구현: QuizPage.jsx SelectView — Step 3 · 단어 수 선택 (2-column 토글 버튼)

[x] 선택에 따라 단어 목록 슬라이싱 처리 (절반 선택 시 무작위 절반)
    구현: QuizPage.jsx startQuiz — shuffle(allWords).slice(0, Math.ceil(n/2))

[~] 테스트 단어 수 파라미터 처리 (절반 시 Math.ceil(total/2))
    변경: BE RPC 파라미터 수정 없이 FE pool 슬라이싱으로 처리
    사유: save_quiz_result가 p_total = questions.length를 받는 구조라 BE 수정 불필요

[+] buildQuestions 10문제 캡 제거
    구현: QuizPage.jsx buildQuestions — Math.min(10, ...) 제거, 풀 전체 출제
    사유: "학습 분량 조절" 목적 상 캡이 있으면 전체/절반 선택이 의미 없어짐

[+] buildQuestions 파라미터 분리 (pool / source)
    구현: QuizPage.jsx buildQuestions(pool, source)
    사유: 절반 모드에서 pool이 작아도 오답 보기를 레벨 전체 단어에서 생성하기 위함

[+] 최소 단어 수 제한 완화 (4개 → 1개 이상)
    구현: QuizPage.jsx startQuiz — allWords.length < 4 alert 제거, === 0 시 NoWordsModal
    사유: 1개 단어로도 퀴즈 진행 가능하도록 허용 (보기 수 감소 허용)
```

### BE

```
[ ] 테스트 단어 수 파라미터 처리
    판정: FE pool 슬라이싱으로 해결 — BE 별도 작업 불필요
```
