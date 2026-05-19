// LPC(Liberated Pixel Cup) 스프라이트 기반 캐릭터 카탈로그.
// 라이선스/저작자 표기는 저장소 루트 CREDITS.md 및 /public/assets/character/LICENSE.txt 참조.
// 가격(price)은 본 파일이 단일 진실 공급원이며, SH-03 purchase_item RPC 가 미러링 대상.

export const ITEMS = {
  // 공통 (항상 렌더, 구매 불가)
  _body: { layers: [{ z: 10,  src: '/assets/character/common/body.png' }] },
  _head: { layers: [{ z: 100, src: '/assets/character/common/head.png' }] },
  _face: { layers: [{ z: 101, src: '/assets/character/common/face.png' }] },

  // 머리카락 (hair 슬롯 — 필수, 해제 불가)
  bedhead: {
    label: '베드헤드 (머리 1)',
    price: 0,
    layers: [{ z: 120, src: '/assets/character/hair/bedhead.png' }],
  },
  idol: {
    label: '아이돌 (머리 2)',
    price: 3000,
    layers: [{ z: 120, src: '/assets/character/hair/idol.png' }],
  },
  long: {
    label: '롱헤어 (머리 3)',
    price: 3000,
    layers: [{ z: 120, src: '/assets/character/hair/long.png' }],
  },

  // 의상 세트 (outfit 슬롯 — 필수, 해제 불가)
  outfit_basic: {
    label: '기본 세트',
    price: 0,
    layers: [
      { z: 15, src: '/assets/character/outfits/basic/shoes_black.png' },
      { z: 20, src: '/assets/character/outfits/basic/pants.png'       },
      { z: 35, src: '/assets/character/outfits/basic/tshirt.png'      },
    ],
  },
  outfit_formal: {
    label: '정장 세트',
    price: 5000,
    layers: [
      { z: 15, src: '/assets/character/outfits/formal/shoes_brown.png' },
      { z: 20, src: '/assets/character/outfits/formal/fur_pants.png'   },
      { z: 35, src: '/assets/character/outfits/formal/longsleeve.png'  },
      { z: 55, src: '/assets/character/outfits/formal/coat.png'        },
    ],
  },
  outfit_armor: {
    label: '갑옷 세트',
    price: 9000,
    layers: [
      { z: 5,  src: '/assets/character/outfits/armor/cape_back.png'  },
      { z: 15, src: '/assets/character/outfits/armor/armor_feet.png' },
      { z: 20, src: '/assets/character/outfits/armor/armor_legs.png' },
      { z: 50, src: '/assets/character/outfits/armor/chainmail.png'  },
      // 동일 z 정렬용 di 키: plate(0) → shoulders(1) 순.
      { z: 60, src: '/assets/character/outfits/armor/plate.png',     di: 0 },
      { z: 60, src: '/assets/character/outfits/armor/shoulders.png', di: 1 },
      { z: 85, src: '/assets/character/outfits/armor/cape_front.png' },
    ],
  },
  outfit_fashion2: {
    label: '패션 세트 2',
    price: 5000,
    layers: [
      { z: 15, src: '/assets/character/outfits/fashion2/shoes_sky.png'   },
      { z: 20, src: '/assets/character/outfits/fashion2/pantaloons.png'  },
      { z: 35, src: '/assets/character/outfits/fashion2/cardigan.png'    },
      { z: 45, src: '/assets/character/outfits/fashion2/vest.png'        },
    ],
  },

  // 모자 (hat 슬롯 — 선택, 해제 가능)
  bonnie: {
    label: '검은 모자',
    price: 3000,
    layers: [{ z: 130, src: '/assets/character/hats/bonnie.png' }],
  },
  crown: {
    label: '왕관',
    price: 3000,
    layers: [{ z: 130, src: '/assets/character/hats/crown.png' }],
  },

  // 가방 (bag 슬롯 — 선택, 해제 가능)
  backpack: {
    label: '일반 가방',
    price: 3000,
    layers: [{ z: 110, src: '/assets/character/bags/backpack.png' }],
  },
  jetpack: {
    label: '제트팩',
    price: 9000,
    layers: [
      { z: 110, src: '/assets/character/bags/jetpack.png'      },
      { z: 112, src: '/assets/character/bags/jetpack_fins.png' },
    ],
  },

  // 날개 (wings 슬롯 — 선택, 해제 가능)
  bat_wings: {
    label: '박쥐 날개',
    price: 9000,
    layers: [
      { z: 5,   src: '/assets/character/wings/bat_bg.png' },
      { z: 105, src: '/assets/character/wings/bat_fg.png' },
    ],
  },
}

// 카테고리별 아이템 목록
export const SHOP_CATALOG = {
  hair:   ['bedhead', 'idol', 'long'],
  outfit: ['outfit_basic', 'outfit_formal', 'outfit_armor', 'outfit_fashion2'],
  hat:    ['bonnie', 'crown'],
  bag:    ['backpack', 'jetpack'],
  wings:  ['bat_wings'],
}

// 아이템 ID → 슬롯 키 역방향 조회
export const ITEM_SLOT = {
  bedhead: 'hair', idol: 'hair', long: 'hair',
  outfit_basic: 'outfit', outfit_formal: 'outfit',
  outfit_armor: 'outfit', outfit_fashion2: 'outfit',
  bonnie: 'hat', crown: 'hat',
  backpack: 'bag', jetpack: 'bag',
  bat_wings: 'wings',
}

// 해제 불가 슬롯 (항상 무언가 장착되어야 함)
export const MANDATORY_SLOTS = new Set(['hair', 'outfit'])

// 기본 장착 상태 (신규 사용자 초기값)
export const DEFAULT_EQUIPPED = {
  hair: 'bedhead',
  outfit: 'outfit_basic',
  hat: null,
  bag: null,
  wings: null,
}

export const DEFAULT_OWNED = ['bedhead', 'outfit_basic']

// 배경 교체 가능 설계 — 추후 스프라이트 받으면 키 추가.
// null = LIB.parchment fallback.
export const BACKGROUNDS = {
  default: null,
}

// 상점 카드 카테고리별 표시 방향 (0=UP, 1=LEFT, 2=DOWN, 3=RIGHT).
// 가방은 뒷모습(UP), 나머지는 정면(DOWN).
export const CATEGORY_DIRECTION = {
  hair:   2,
  outfit: 2,
  hat:    2,
  bag:    0,
  wings:  2,
}

// 특수효과 아이템 (슬롯 없음 — owned_items 보유 여부만 사용)
export const QUIZ_BOOK_ANIM_ID = 'quiz_book_anim'

export const EFFECT_ITEMS = {
  [QUIZ_BOOK_ANIM_ID]: {
    label: '테스트 책 쌓기/무너지기',
    price: 9000,
    description: '정답 시 책이 쌓이고 오답 시 무너지는 애니메이션',
  },
}
