import type { ReactionChip } from '../../db/derive'
import '../../styles/conversation.css'

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '🙏', '✅']

/** Small fixed-set emoji strip used by the react affordances. */
export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <div className="emoji-picker" role="menu">
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="emoji-picker-btn"
          onClick={() => onPick(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

export function ReactionChips({
  reactions,
  onReact,
}: {
  reactions: ReactionChip[]
  /** When set, tapping a chip I haven't joined adds my reaction with its emoji. */
  onReact?: (emoji: string) => void
}) {
  return (
    <div className="reaction-row">
      {reactions.map((r) => {
        const clickable = onReact !== undefined && !r.mine
        return (
          <button
            key={r.emoji}
            type="button"
            className={r.mine ? 'reaction-chip mine' : 'reaction-chip'}
            disabled={!clickable}
            onClick={clickable ? () => onReact(r.emoji) : undefined}
          >
            <span>{r.emoji}</span>
            <span className="reaction-count">{r.count}</span>
          </button>
        )
      })}
    </div>
  )
}
