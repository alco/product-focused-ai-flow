import '../../styles/conversation.css'

export function DayDivider({ label }: { label: string }) {
  return (
    <div className="day-divider">
      <span className="day-divider-pill">{label}</span>
    </div>
  )
}
