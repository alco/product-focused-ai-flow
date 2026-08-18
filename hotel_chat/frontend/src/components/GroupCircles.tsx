// Group-chat avatar: a group of member circles, all on the same baseline
// but overlapping (each member keeps their deterministic Avatar tint).
// Groups with more than 3 members render two overlapping circles, a middle
// ellipsis, then the last member's circle. Renders in a fixed square box so
// list rows stay aligned with the 44px DM avatars.

import { nameTint } from './Avatar'
import '../styles/app.css'

interface Circle {
  name: string
  left: number
}

export function GroupCircles({ names, box = 44 }: { names: string[]; box?: number }) {
  const overflow = names.length > 3
  const size = Math.round(box * (overflow ? 0.34 : 0.45))
  const span = box - size

  let circles: Circle[]
  let ellipsisCenter: number | null = null
  if (overflow) {
    // Two overlapping circles · middle ellipsis · the last member's circle.
    const second = Math.round(box * 0.16)
    circles = [
      { name: names[0], left: 0 },
      { name: names[1], left: second },
      { name: names[names.length - 1], left: span },
    ]
    ellipsisCenter = Math.round((second + size + span) / 2)
  } else {
    circles = names.map((name, i) => ({
      name,
      left: names.length === 1 ? Math.round(span / 2) : Math.round((span * i) / (names.length - 1)),
    }))
  }

  return (
    <span className="group-circles" style={{ width: box, height: box }} aria-hidden>
      {circles.map((c, i) => (
        <span key={i} className="group-circle" style={{ left: c.left, zIndex: i + 1 }}>
          <span
            className="avatar-circle"
            style={{ width: size, height: size, background: nameTint(c.name) }}
          />
        </span>
      ))}
      {ellipsisCenter !== null && (
        <span className="group-circles-ellipsis" style={{ left: ellipsisCenter }}>
          …
        </span>
      )}
    </span>
  )
}
