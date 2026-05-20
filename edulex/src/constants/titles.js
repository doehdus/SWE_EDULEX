// ================================================================
// 칭호 시스템 — 카탈로그 / 티어 시각 시스템
// ----------------------------------------------------------------
// 본 파일과 동기화해야 하는 외부 소스:
//   - DB 함수 check_titles_for_user (임계치 매핑)
//   - check_attendance / save_quiz_result / purchase_item RPC
//   ※ 임계치·키 변경 시 마이그레이션도 같이 갱신해야 함 (이중 소스).
// ================================================================

import { LIB } from './theme'

// ── 티어 4단계 ───────────────────────────────────────────────────
// 정렬 인덱스 = 난이도 오름차순.
export const TITLE_TIERS = ['bronze', 'silver', 'gold', 'platinum']

// ── 티어별 시각 토큰 ─────────────────────────────────────────────
// background / border / color 는 인라인 style 로,
// animation 키는 index.css 의 @keyframes 이름을 그대로 참조.
export const TIER_STYLE = {
  bronze: {
    label: '브론즈',
    background: 'linear-gradient(180deg, #b08a5f 0%, #8a6238 100%)',
    border: '1px solid #6b4226',
    color: LIB.ink,
    glow: null,
    animation: null,
    particle: false,
  },
  silver: {
    label: '실버',
    background: 'linear-gradient(180deg, #e0e0e0 0%, #a8a8a8 100%)',
    border: '1px solid #707070',
    color: LIB.ink,
    glow: null,
    animation: null,
    particle: false,
  },
  gold: {
    label: '골드',
    background: `linear-gradient(180deg, ${LIB.goldLight} 0%, ${LIB.gold} 100%)`,
    border: `1px solid ${LIB.gold}`,
    color: LIB.ink,
    glow: '0 0 8px rgba(201,168,76,0.55)',
    animation: 'titleGlow 4s ease-in-out infinite',
    particle: false,
  },
  platinum: {
    label: '플래티넘',
    background: 'linear-gradient(135deg, #f3f8ff 0%, #d6e0f5 45%, #a9b8d8 100%)',
    border: '1px solid #8aa3c8',
    color: LIB.ink,
    glow: '0 0 12px rgba(170,200,255,0.7)',
    animation: 'titleFloat 1.5s ease-in-out infinite',
    particle: true,
  },
}

// ── 칭호 카테고리 ────────────────────────────────────────────────
export const TITLE_CATEGORIES = {
  bookmark_earned: '누적 책갈피',
  bookmark_spent:  '누적 소모',
  attendance:      '출석 일수',
  wordbook:        '단어장 완료',
}

// 카테고리별 잠금 여부 — 잠금 카테고리는 카탈로그에 노출되나 RPC 미연동.
export const LOCKED_CATEGORIES = new Set(['wordbook'])

// ── 칭호 카탈로그 ────────────────────────────────────────────────
// 키 = DB user_titles.title_key 와 동일해야 함.
// threshold 의미는 category 별로 다름:
//   bookmark_earned/spent : 누적 책갈피 개수
//   attendance            : 누적 출석 일수
//   wordbook              : 완료한 공식 단어장 수
export const TITLES = {
  // ── 누적 책갈피 (4종) ─────────────────────────────────────────
  bookmark_collector: {
    name: '책갈피 수집가',
    category: 'bookmark_earned',
    tier: 'bronze',
    threshold: 3000,
    description: '누적 책갈피 3,000개 획득',
    icon: 'Bookmark',
  },
  bookmark_hunter: {
    name: '책갈피 사냥꾼',
    category: 'bookmark_earned',
    tier: 'silver',
    threshold: 10000,
    description: '누적 책갈피 10,000개 획득',
    icon: 'Bookmark',
  },
  collection_master: {
    name: '수집의 달인',
    category: 'bookmark_earned',
    tier: 'gold',
    threshold: 27000,
    description: '누적 책갈피 27,000개 획득',
    icon: 'Bookmark',
  },
  collection_king: {
    name: '수집왕',
    category: 'bookmark_earned',
    tier: 'platinum',
    threshold: 54000,
    description: '누적 책갈피 54,000개 획득',
    icon: 'Crown',
  },

  // ── 누적 소모 (4종) ───────────────────────────────────────────
  investor: {
    name: '투자자',
    category: 'bookmark_spent',
    tier: 'bronze',
    threshold: 5000,
    description: '누적 5,000개 책갈피 소모',
    icon: 'TrendingUp',
  },
  wise_spender: {
    name: '현명한 지출자',
    category: 'bookmark_spent',
    tier: 'silver',
    threshold: 10000,
    description: '누적 10,000개 책갈피 소모',
    icon: 'Scale',
  },
  impulse_buyer: {
    name: '지름신',
    category: 'bookmark_spent',
    tier: 'gold',
    threshold: 20000,
    description: '누적 20,000개 책갈피 소모',
    icon: 'Zap',
  },
  white_whale: {
    name: '흰수염고래',
    category: 'bookmark_spent',
    tier: 'platinum',
    threshold: 40000,
    description: '누적 40,000개 책갈피 소모',
    icon: 'Fish',
  },

  // ── 출석 일수 (6종) ───────────────────────────────────────────
  novice_scholar: {
    name: '입문하는 학도',
    category: 'attendance',
    tier: 'bronze',
    threshold: 10,
    description: '누적 출석 10일',
    icon: 'BookOpen',
  },
  diligent_disciple: {
    name: '정진하는 필생',
    category: 'attendance',
    tier: 'bronze',
    threshold: 30,
    description: '누적 출석 30일',
    icon: 'BookOpen',
  },
  deep_scholar: {
    name: '깊이 있는 학자',
    category: 'attendance',
    tier: 'silver',
    threshold: 50,
    description: '누적 출석 50일',
    icon: 'GraduationCap',
  },
  wisdom_sage: {
    name: '지혜의 현자',
    category: 'attendance',
    tier: 'silver',
    threshold: 100,
    description: '누적 출석 100일',
    icon: 'GraduationCap',
  },
  honored_advisor: {
    name: '명예로운 고문',
    category: 'attendance',
    tier: 'gold',
    threshold: 200,
    description: '누적 출석 200일',
    icon: 'Award',
  },
  truth_guardian: {
    name: '진리의 수호자',
    category: 'attendance',
    tier: 'platinum',
    threshold: 365,
    description: '누적 출석 365일',
    icon: 'ShieldCheck',
  },

  // ── 단어장 완료 (4종) ─ ⏸ 보류: 단어장 숙련도 기능 의존 (SBI-T05) ─
  two_world_interpreter: {
    name: '두 세계의 통역사',
    category: 'wordbook',
    tier: 'silver',
    threshold: 2,
    description: '공식 단어장 2개 완료 — 단어장 숙련도 기능 완성 후 활성화',
    icon: 'Languages',
    locked: true,
  },
  trinity_sage: {
    name: '트리니티 세이지',
    category: 'wordbook',
    tier: 'gold',
    threshold: 3,
    description: '공식 단어장 3개 완료 — 단어장 숙련도 기능 완성 후 활성화',
    icon: 'Languages',
    locked: true,
  },
  successor_of_four_gods: {
    name: '사방신의 후계자',
    category: 'wordbook',
    tier: 'platinum',
    threshold: 4,
    description: '공식 단어장 4개 완료 — 단어장 숙련도 기능 완성 후 활성화',
    icon: 'Languages',
    locked: true,
  },
  five_star_sage: {
    name: '오성(五星) 현자',
    category: 'wordbook',
    tier: 'platinum',
    threshold: 5,
    description: '공식 단어장 5개 완료 — 단어장 숙련도 기능 완성 후 활성화',
    icon: 'Stars',
    locked: true,
  },
}

// ── 카테고리별 칭호 키 묶음 (정렬: tier 오름차순, threshold 오름차순) ──
function buildByCategory() {
  const map = Object.fromEntries(Object.keys(TITLE_CATEGORIES).map((k) => [k, []]))
  for (const [key, meta] of Object.entries(TITLES)) {
    map[meta.category].push(key)
  }
  for (const cat of Object.keys(map)) {
    map[cat].sort((a, b) => {
      const ta = TITLE_TIERS.indexOf(TITLES[a].tier)
      const tb = TITLE_TIERS.indexOf(TITLES[b].tier)
      if (ta !== tb) return ta - tb
      return TITLES[a].threshold - TITLES[b].threshold
    })
  }
  return map
}

export const TITLES_BY_CATEGORY = buildByCategory()

// 총 칭호 개수 — 진행도 카운터용.
export const TOTAL_TITLES = Object.keys(TITLES).length

// 잠금 해제된(획득 가능한) 칭호 개수 — wordbook 보류 항목 제외.
export const ACTIVE_TITLES_COUNT = Object.values(TITLES).filter(
  (t) => !LOCKED_CATEGORIES.has(t.category),
).length
