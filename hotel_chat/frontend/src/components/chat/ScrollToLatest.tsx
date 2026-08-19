// Invisible anchor at the bottom of a transcript's scroll content that keeps
// the newest messages in view: jumps the scroll container to the bottom when
// the conversation's messages first render, then follows new messages with a
// smooth scroll — but only while already near the bottom, so it never yanks
// the user out of reading history. Mount it with `key={conversationId}` so
// switching conversations gets a fresh initial jump.

import { useLayoutEffect, useRef } from 'react'

// How close (px) to the bottom still counts as "following the conversation".
// Measured after the new message has been laid out, so it must absorb one
// message bubble's height on top of any small scroll drift.
const FOLLOW_THRESHOLD = 240

function scrollParent(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p)
    if (overflowY === 'auto' || overflowY === 'scroll') return p
  }
  return null
}

export function ScrollToLatest({ count }: { count: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const hadContent = useRef(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || count === 0) return
    const scroller = scrollParent(el)
    if (!scroller) return

    if (!hadContent.current) {
      // First render with messages (collection may fill in after mount).
      hadContent.current = true
      scroller.scrollTop = scroller.scrollHeight
      return
    }

    const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight
    if (distance < FOLLOW_THRESHOLD) {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [count])

  return <div ref={ref} aria-hidden />
}
