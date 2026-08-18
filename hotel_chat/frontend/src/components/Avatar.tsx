// Initials avatar with a deterministic tint per name, from brand accent tints.

const tints = [
  { bg: 'var(--sky-200)' },
  { bg: '#fef3c7' }, // amber-100 — lime stays reserved for the official signature
  { bg: '#ccfbf1' }, // teal-100
  { bg: '#fed7cf' }, // coral tint
  { bg: '#e0e7ff' }, // indigo-100
  { bg: '#e7e5e4' }, // stone-200
]

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const tint = tints[hashName(name) % tints.length]
  return (
    <span
      className="avatar-circle"
      style={{
        width: size,
        height: size,
        background: tint.bg,
        fontSize: size * 0.36,
      }}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  )
}
