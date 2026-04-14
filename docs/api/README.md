# 📡 EduLex — API 명세서

> EduLex REST API 명세서 | Supabase Edge Functions 기반

---

## 📌 공통 사항

### Base URL
```
https://<supabase-project-ref>.functions.supabase.co
```

### 인증 헤더
```http
Authorization: Bearer <JWT_TOKEN>
```
> 관리자 전용 엔드포인트는 `role = 'admin'` 토큰 필요

### 응답 공통 구조

**성공**
```json
{
  "data": { ... },
  "error": null
}
```

**실패**
```json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

### HTTP 상태 코드

| 코드 | 의미 |
|------|------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request (유효성 검사 실패) |
| `401` | Unauthorized (인증 필요) |
| `403` | Forbidden (권한 없음) |
| `404` | Not Found |
| `409` | Conflict (중복 데이터) |
| `500` | Internal Server Error |

---

## 🔐 1. 인증 (Auth)

### `POST /auth/signup` — 회원가입

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123!",
  "nickname": "닉네임"
}
```

**Response** `201`
```json
{
  "data": {
    "message": "이메일 인증 링크가 발송되었습니다.",
    "user_id": "uuid"
  }
}
```

**Error Cases**
| 코드 | 상황 |
|------|------|
| `400` | 이메일 형식 오류, 비밀번호 조건 미충족 |
| `409` | 이미 사용 중인 이메일 또는 닉네임 |

---

### `POST /auth/login` — 로그인

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123!"
}
```

**Response** `200`
```json
{
  "data": {
    "access_token": "jwt_token",
    "user": {
      "id": "uuid",
      "nickname": "닉네임",
      "role": "user"
    }
  }
}
```

---

### `POST /auth/login/admin` — 관리자 로그인

**Request Body**
```json
{
  "email": "admin@edulex.com",
  "password": "admin_password"
}
```

**Response** `200`
```json
{
  "data": {
    "access_token": "jwt_token",
    "user": {
      "id": "uuid",
      "nickname": "관리자",
      "role": "admin"
    }
  }
}
```

**Error Cases**
| 코드 | 상황 |
|------|------|
| `403` | 관리자 권한 없음 |

---

## 👤 2. 사용자 (User)

### `GET /users/me` — 내 프로필 조회

> 🔒 인증 필요

**Response** `200`
```json
{
  "data": {
    "id": "uuid",
    "nickname": "닉네임",
    "email": "user@example.com",
    "major": ["computer_science", "mathematics"],
    "active_title": "단어 마스터",
    "star_dust": 150,
    "level": 3
  }
}
```

---

### `PATCH /users/me/major` — 전공 선택 저장

> 🔒 인증 필요

**Request Body**
```json
{
  "major": ["computer_science", "mathematics"]
}
```

**Response** `200`
```json
{
  "data": {
    "major": ["computer_science", "mathematics"]
  }
}
```

**Error Cases**
| 코드 | 상황 |
|------|------|
| `400` | 전공 3개 이상 선택 시 |

---

### `PATCH /users/me/title` — 칭호 선택 저장

> 🔒 인증 필요

**Request Body**
```json
{
  "active_title": "단어 마스터"
}
```

**Response** `200`
```json
{
  "data": {
    "active_title": "단어 마스터"
  }
}
```

---

## 📚 3. 공식 단어장 (Official Wordbook)

### `GET /wordbooks/official` — 공식 단어장 목록 조회

> 🔒 인증 필요

**Query Parameters**

| 파라미터 | 필수 | 설명 |
|----------|:----:|------|
| `major` | ✅ | 전공 코드 (예: `computer_science`) |

**Example**
```
GET /wordbooks/official?major=computer_science
```

**Response** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "컴퓨터과학 핵심 어휘 Vol.1",
      "major": "computer_science",
      "description": "자료구조·알고리즘 핵심 단어",
      "word_count": 50
    }
  ]
}
```

---

### `GET /wordbooks/official/:id/words` — 공식 단어 카드 조회

> 🔒 인증 필요

**Path Parameters**

| 파라미터 | 설명 |
|----------|------|
| `id` | 단어장 UUID |

**Response** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "english": "algorithm",
      "major_meaning": "알고리즘 — 문제 해결을 위한 절차적 명령 집합",
      "general_example": "The algorithm sorts the list efficiently.",
      "major_example": "This sorting algorithm has O(n log n) time complexity.",
      "order_index": 1
    }
  ]
}
```

---

## 📁 4. 나만의 단어장 (User Wordbook)

### `POST /wordbooks/user/upload` — PDF 업로드 → AI 단어장 생성

> 🔒 인증 필요 | Content-Type: `multipart/form-data`

**Request Body**

| 필드 | 타입 | 설명 |
|------|------|------|
| `file` | `File` | PDF 파일 |
| `title` | `string` | 단어장 이름 (선택, 기본값: 파일명) |

**Response** `201`
```json
{
  "data": {
    "wordbook_id": "uuid",
    "title": "운영체제_강의자료.pdf",
    "word_count": 23,
    "words": [
      {
        "english": "process",
        "meaning": "프로세스 — 실행 중인 프로그램의 인스턴스",
        "example": "Each process has its own memory space."
      }
    ]
  }
}
```

**Error Cases**
| 코드 | 상황 |
|------|------|
| `400` | PDF 파일 아닌 경우, 파일 크기 초과 |
| `409` | 단어장 2개 이미 보유 (업로드 불가) |

---

### `GET /wordbooks/user` — 나만의 단어장 목록 조회

> 🔒 인증 필요

**Response** `200`
```json
{
  "data": {
    "count": 1,
    "limit": 2,
    "wordbooks": [
      {
        "id": "uuid",
        "title": "운영체제_강의자료.pdf",
        "source_filename": "운영체제_강의자료.pdf",
        "word_count": 23,
        "created_at": "2026-04-14T10:00:00Z"
      }
    ]
  }
}
```

---

### `GET /wordbooks/user/:id/words` — 나만의 단어 카드 조회

> 🔒 인증 필요

**Response** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "english": "process",
      "meaning": "프로세스 — 실행 중인 프로그램의 인스턴스",
      "example": "Each process has its own memory space.",
      "order_index": 1
    }
  ]
}
```

---

### `DELETE /wordbooks/user/:id` — 나만의 단어장 삭제

> 🔒 인증 필요

**Response** `200`
```json
{
  "data": {
    "message": "단어장이 삭제되었습니다.",
    "deleted_id": "uuid"
  }
}
```

> ⚠️ 단어장 삭제 시 소속 단어(`user_words`) cascade 삭제

---

### `GET /wordbooks/user/count` — 단어장 개수 조회

> 🔒 인증 필요

**Response** `200`
```json
{
  "data": {
    "count": 1,
    "limit": 2,
    "can_upload": true
  }
}
```

---

## 🧪 5. 테스트 (Quiz)

### `GET /test/questions` — Lv1 문제 생성

> 🔒 인증 필요

**Query Parameters**

| 파라미터 | 필수 | 설명 |
|----------|:----:|------|
| `wordbook_id` | ✅ | 단어장 UUID |
| `wordbook_type` | ✅ | `official` \| `user` |
| `level` | ❌ | 테스트 레벨 (default: `1`) |

**Response** `200`
```json
{
  "data": [
    {
      "question_id": "uuid",
      "question": "다음 뜻에 해당하는 영어 단어를 고르세요.\n프로세스 — 실행 중인 프로그램의 인스턴스",
      "options": ["process", "thread", "memory", "kernel"],
      "answer_index": 0
    }
  ]
}
```

---

### `POST /test/results` — 테스트 결과 저장

> 🔒 인증 필요

**Request Body**
```json
{
  "wordbook_id": "uuid",
  "wordbook_type": "official",
  "level": 1,
  "total_count": 10,
  "correct_count": 8
}
```

**Response** `201`
```json
{
  "data": {
    "result_id": "uuid",
    "accuracy": 80.00,
    "reward": {
      "star_dust": 10,
      "message": "테스트 완료! 별가루 10개를 획득했습니다."
    }
  }
}
```

---

## 📅 6. 출석 (Attendance)

### `POST /attendance` — 출석 체크

> 🔒 인증 필요

**Response** `201`
```json
{
  "data": {
    "checked_at": "2026-04-14",
    "streak_count": 5,
    "reward": {
      "star_dust": 5,
      "message": "출석 완료! 별가루 5개를 획득했습니다."
    }
  }
}
```

**Error Cases**
| 코드 | 상황 |
|------|------|
| `409` | 오늘 이미 출석 체크 완료 |

---

## ⚙️ 7. 관리자 (Admin)

> 🔒 `role = 'admin'` 토큰 필요

### `GET /admin/wordbooks` — 공식 단어장 전체 조회

**Response** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "컴퓨터과학 핵심 어휘 Vol.1",
      "major": "computer_science",
      "word_count": 50,
      "created_at": "2026-04-01T00:00:00Z"
    }
  ]
}
```

---

### `POST /admin/wordbooks` — 공식 단어장 생성

**Request Body**
```json
{
  "title": "컴퓨터과학 핵심 어휘 Vol.2",
  "major": "computer_science",
  "description": "네트워크·운영체제 핵심 단어"
}
```

**Response** `201`
```json
{
  "data": {
    "id": "uuid",
    "title": "컴퓨터과학 핵심 어휘 Vol.2"
  }
}
```

---

### `POST /admin/wordbooks/:id/words` — 공식 단어 추가

**Request Body**
```json
{
  "words": [
    {
      "english": "deadlock",
      "major_meaning": "교착 상태 — 두 프로세스가 서로의 자원을 기다리며 무한 대기",
      "general_example": "The system entered a deadlock state.",
      "major_example": "Deadlock occurs when mutual exclusion, hold and wait, no preemption, and circular wait all hold."
    }
  ]
}
```

**Response** `201`
```json
{
  "data": {
    "added_count": 1
  }
}
```

---

### `PATCH /admin/wordbooks/:wordbook_id/words/:word_id` — 공식 단어 수정

**Request Body**
```json
{
  "major_meaning": "교착 상태 (수정된 설명)",
  "general_example": "Updated example sentence."
}
```

**Response** `200`
```json
{
  "data": {
    "id": "uuid",
    "english": "deadlock"
  }
}
```

---

### `DELETE /admin/wordbooks/:id` — 공식 단어장 삭제

**Response** `200`
```json
{
  "data": {
    "message": "단어장이 삭제되었습니다.",
    "deleted_id": "uuid"
  }
}
```

---

## ⭐ 8. 별가루 (Star Dust)

### Supabase Realtime 구독

> Supabase Realtime 채널 구독으로 `users.star_dust` 컬럼 변경 시 실시간 반영

```javascript
// 클라이언트 예시
const channel = supabase
  .channel('star-dust')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'users',
    filter: `id=eq.${userId}`
  }, (payload) => {
    setStarDust(payload.new.star_dust)
  })
  .subscribe()
```
