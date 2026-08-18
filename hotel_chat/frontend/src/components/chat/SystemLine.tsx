import '../../styles/conversation.css'

export function SystemLine({ text }: { text: string }) {
  return <div className="system-line">{text}</div>
}
