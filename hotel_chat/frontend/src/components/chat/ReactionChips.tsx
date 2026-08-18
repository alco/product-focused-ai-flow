import type { Reaction } from '../../mock/data'
import '../../styles/conversation.css'

export function ReactionChips({ reactions }: { reactions: Reaction[] }) {
  return (
    <div className="reaction-row">
      {reactions.map((r) => (
        <span key={r.emoji} className={r.mine ? 'reaction-chip mine' : 'reaction-chip'}>
          <span>{r.emoji}</span>
          <span className="reaction-count">{r.count}</span>
        </span>
      ))}
    </div>
  )
}
