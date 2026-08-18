// Deterministic per-name tints for conversation UI.
// Mirrors the hashing idea in components/Avatar.tsx (which stays untouched):
// same input name → same tint, everywhere, forever.

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Brand-adjacent saturated tones for author names above group-chat bubbles.
// Dark enough for small semibold text on white/stone surfaces.
const authorTones = [
  '#0d9488', // teal-600
  '#0369a1', // sky-700
  '#c2410c', // deepened coral
  '#4f46e5', // indigo-600
  '#12876c', // brand teal-green
]

export function authorColor(name: string): string {
  return authorTones[hashName(name) % authorTones.length]
}
