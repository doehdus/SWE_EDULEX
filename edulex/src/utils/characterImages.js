// 캐릭터 스프라이트 이미지 모듈-스코프 캐시.
// preloadAllCharacterImages 로 미리 로드 후, CharacterCanvas 가 getImage 로 동기 조회한다.

const imageCache = {}

export function preloadAllCharacterImages(items) {
  const srcs = new Set()
  Object.values(items).forEach((item) => {
    item.layers.forEach((l) => srcs.add(l.src))
  })

  return Promise.all(
    [...srcs].map(
      (src) =>
        new Promise((resolve) => {
          if (imageCache[src]) return resolve()
          const img = new Image()
          img.onload = () => {
            imageCache[src] = img
            resolve()
          }
          // 실패해도 resolve — 렌더 시 해당 레이어만 skip.
          img.onerror = () => resolve()
          img.src = src
        }),
    ),
  )
}

export function getImage(src) {
  return imageCache[src] || null
}
