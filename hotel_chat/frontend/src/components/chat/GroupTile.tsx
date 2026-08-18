// Squared tinted tile avatar for group conversations.

import '../../styles/conversation.css'
import { tileTint } from './palette'

function tileInitials(name: string): string {
  const words = name.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w))
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function GroupTile({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span
      className="group-tile"
      style={{ width: size, height: size, background: tileTint(name), fontSize: size * 0.34 }}
      aria-hidden
    >
      {tileInitials(name)}
    </span>
  )
}
