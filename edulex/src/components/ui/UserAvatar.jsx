import { ICONS } from '../../constants/icons'

export default function UserAvatar({ iconIndex = 1, size = 24 }) {
  const src = ICONS[(iconIndex - 1) % ICONS.length]

  return (
    <img
      src={src}
      alt={`icon${iconIndex}`}
      className="rounded-full flex-shrink-0 object-cover"
      style={{ width: size, height: size }}
    />
  )
}
