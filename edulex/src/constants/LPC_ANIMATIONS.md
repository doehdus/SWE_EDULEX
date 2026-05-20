# LPC 스프라이트 — 추가 가능한 애니메이션 목록

## 시트 사양

- 파일 크기: **832 × 3456 px**
- 프레임 크기: **64 × 64 px**
- 컬럼: 13, 행: 54
- 레이아웃: LPC Universal Spritesheet v3 호환
- 방향 순서 (행 0~3 단위): **UP → LEFT → DOWN → RIGHT** (`WALK_Y = [512, 576, 640, 704]` 와 동일)

## 현재 사용 중

| 모션 | y 시작 | 행 수 | 프레임 수 | 비고 |
|---|---|---|---|---|
| **walk** | 512 | 4 (방향당 1) | 9 | `CharacterCanvas.WALK_Y`, idle 호흡은 frame 0↔1 |

## 사용 가능한 추가 모션

LPC Universal 표준 행 배치 (자산이 모든 행을 포함하지 않을 수 있어 도입 전 PNG 인스펙터로 검증 필요):

| 모션 | y 시작 | 행 수 | 프레임 수 | 권장 사용처 |
|---|---|---|---|---|
| **spellcast** | 0 | 4 | 7 | 정답 제출 / 레벨업 이펙트 |
| **thrust** | 256 | 4 | 8 | 적중 / 강조 인터랙션 |
| walk | 512 | 4 | 9 | (현재 사용) |
| **slash** | 768 | 4 | 6 | 단어 삭제 / 오답 표시 |
| **shoot** | 1024 | 4 | 13 | 활쏘기 — 단발 이벤트 강조 |
| **hurt** | 1280 | 1 (DOWN 만) | 6 | 오답 / 책갈피 차감 |
| **climb** | 1344 | 4 | 6 | 단계 상승 / 진척도 컷씬 |
| **idle (true)** | 1600 | 4 | 2 | 정식 idle (현재는 walk 0↔1 핑퐁 대체) |
| **jump** | 1856 | 4 | 5 | 도전 모드 진입 |
| **sit** | 2112 | 4 | 3 | 학습 / 책 읽는 자세 |
| **emote** | 2368 | 4 | 3 | 박수 / 인사 등 보조 표현 |
| **run** | 2624 | 4 | 8 | walk 의 빠른 변형 — 콤보 / 스트릭 강조 |
| **combat_idle** | 2880 | 4 | 2 | 전투 대기 — 퀴즈 직전 텐션 연출 |
| **backslash** | 3136 | 4 | 13 | 후방 베기 — slash 와 짝 |
| **halfslash** | 3392 | 1 | 7 | 짧은 베기 |

> 프레임 수와 행 존재 여부는 LPC v3 표준값이며, 실제 PNG 의 빈 행 여부는 도입 시 확인이 필요합니다.

## 도입 가이드

새 모션 추가 절차:

1. `constants/character.js` 에 행 오프셋 상수 추가 — 예시:
   ```js
   export const ANIM_ROWS = {
     spellcast:    [0, 64, 128, 192],
     thrust:       [256, 320, 384, 448],
     walk:         [512, 576, 640, 704],
     slash:        [768, 832, 896, 960],
     shoot:        [1024, 1088, 1152, 1216],
     hurt:         [1280],
     climb:        [1344, 1408, 1472, 1536],
     idle:         [1600, 1664, 1728, 1792],
     jump:         [1856, 1920, 1984, 2048],
     sit:          [2112, 2176, 2240, 2304],
     emote:        [2368, 2432, 2496, 2560],
     run:          [2624, 2688, 2752, 2816],
     combat_idle:  [2880, 2944, 3008, 3072],
     backslash:    [3136, 3200, 3264, 3328],
     halfslash:    [3392],
   }
   export const ANIM_FRAMES = {
     spellcast: 7, thrust: 8, walk: 9, slash: 6, shoot: 13,
     hurt: 6, climb: 6, idle: 2, jump: 5, sit: 3, emote: 3,
     run: 8, combat_idle: 2, backslash: 13, halfslash: 7,
   }
   ```

2. `CharacterCanvas` 에 `animation` prop 추가 — `WALK_Y` 하드코딩 제거하고 `ANIM_ROWS[animation][direction]` 으로 분기.

3. `CharacterStage` / 상위 컨텐츠에서 이벤트 시점에 `animation` 을 일시 전환 후 사이클 종료 시 `idle` 로 복귀 (one-shot 패턴).

## 제약 / 참고 사항

- **방향 단일 모션 (`hurt`, `halfslash`)**: 4방향이 모두 없으므로 단일 행만 사용. 방향 전환은 좌우 반전(CSS scaleX(-1))으로 보강 가능하나 LPC 규격상 권장되지 않음.
- **레이어 동기화**: 모션 추가 시 `_body`/`_head`/`_face`/장착 아이템의 PNG 가 동일 시트에 같은 행을 가지고 있어야 합성 가능. 일부 아이템(예: 가방·날개) 은 모션별 정합성이 떨어질 수 있어 시각 점검 필요.
- **속도 튜닝**: 각 모션의 자연스러운 프레임 간격은 다름 — `walk` 120ms, `run` ~80ms, `idle/combat_idle` ~700ms, `spellcast/shoot` 사이클 길이에 맞춰 단발(one-shot) 처리 권장.
