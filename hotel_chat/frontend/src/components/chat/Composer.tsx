// Sticky bottom composer: dead + attach affordance, rounded text input,
// circular navy send button. Static mockup — no state, nothing wired.

import '../../styles/conversation.css'

export function Composer() {
  return (
    <footer className="composer">
      <button type="button" className="composer-attach" aria-label="Attach">
        +
      </button>
      <input className="composer-input" type="text" placeholder="Message" readOnly />
      <button type="button" className="composer-send" aria-label="Send">
        ↑
      </button>
    </footer>
  )
}
