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

// The element that actually scrolls the transcript. On desktop that's the
// overflowing .convo-scroll; on mobile .phone-scroll has overflow-y: auto
// but never overflows (.phone is min-height-sized, so the *document*
// scrolls and the composer is sticky) — an ancestor only counts if it
// really overflows, otherwise fall back to the document's scroller.
// Scrolling that one to its full height lands past the sticky composer's
// flow position, so the last bubble is never hidden behind it.
function findScroller(el: HTMLElement): HTMLElement {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p)
    if ((overflowY === 'auto' || overflowY === 'scroll') && p.scrollHeight > p.clientHeight) {
      return p
    }
  }
  return document.scrollingElement as HTMLElement
}

export function ScrollToLatest({ count }: { count: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const hadContent = useRef(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || count === 0) return
    const scroller = findScroller(el)

    if (!hadContent.current) {
      // First render with messages (collection may fill in after mount).
      hadContent.current = true
      scroller.scrollTop = scroller.scrollHeight
      return
    }

    const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight
    if (distance < FOLLOW_THRESHOLD) {
      scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' })
    }
  }, [count])

  // Content height also changes without the message count changing — webfont
  // metrics settling, reaction chips syncing in — which leaves the initial
  // jump landing short. Re-pin to the bottom on any such growth, under the
  // same near-bottom guard so a reader scrolled up into history is never
  // pulled down.
  useLayoutEffect(() => {
    const el = ref.current
    const content = el?.parentElement
    if (!el || !content) return
    const observer = new ResizeObserver(() => {
      if (!hadContent.current) return
      const scroller = findScroller(el)
      const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight
      if (distance > 0 && distance < FOLLOW_THRESHOLD) {
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' })
      }
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref} aria-hidden />
}
