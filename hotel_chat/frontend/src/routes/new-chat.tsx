// frontend/src/routes/new-chat.tsx
// Member picker over the directory collection. Creation is an optimistic
// API write (db/mutations createConversation): one selected person makes a
// DM (reusing an existing one via its canonical member pair when present),
// several make a group.
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'
import { useState } from 'react'
import { Avatar } from '../components/Avatar'
import { conversationsCollection, directoryCollection } from '../db/collections'
import { createConversation } from '../db/mutations'
import { onlineMemberIds } from '../db/presence'
import { session } from '../db/session'
import '../styles/session2-screens.css'

export const Route = createFileRoute('/new-chat')({
  component: NewChatScreen,
})

function NewChatScreen() {
  const navigate = useNavigate()
  const { data: members } = useLiveQuery((q) => q.from({ d: directoryCollection }))
  const { data: conversations } = useLiveQuery((q) => q.from({ c: conversationsCollection }))

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')

  const selectedPeople = members.filter((m) => selectedIds.includes(m.id))
  const candidates = members
    .filter((m) => m.id !== session.memberId)
    .sort((a, b) => a.name.localeCompare(b.name))

  const toggle = (id: string) =>
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    )

  const isGroup = selectedIds.length > 1
  const canCreate =
    selectedIds.length === 1 || (isGroup && groupName.trim().length > 0)

  const create = () => {
    if (!canCreate) return
    if (selectedIds.length === 1) {
      // One DM per pair: reuse the existing conversation via its canonical
      // member pair instead of asking the server to create a duplicate.
      const [a, b] = [session.memberId, selectedIds[0]].sort()
      const existing = conversations.find(
        (c) => c.dm_member_a === a && c.dm_member_b === b,
      )
      if (existing) {
        navigate({ to: '/chat/$chatId', params: { chatId: existing.id } })
        return
      }
      const { id, canonicalId } = createConversation({
        kind: 'dm',
        memberIds: selectedIds,
      })
      navigate({ to: '/chat/$chatId', params: { chatId: id } })
      // If the server reports the DM already existed (this dedupe raced or
      // missed), hop over to the real conversation.
      void canonicalId.then((serverId) => {
        if (serverId !== id) {
          navigate({ to: '/chat/$chatId', params: { chatId: serverId } })
        }
      })
    } else {
      const { id } = createConversation({
        kind: 'group',
        name: groupName.trim(),
        memberIds: selectedIds,
      })
      navigate({ to: '/chat/$chatId', params: { chatId: id } })
    }
  }

  return (
    <div className="phone">
      <header className="topbar">
        <Link className="close-x" to="/chats" aria-label="Close">
          ✕
        </Link>
        <h1 className="topbar-title">New chat</h1>
      </header>

      <div className="newchat-scroll">
        <div className="search-field">
          <span className="search-icon" aria-hidden>
            🔍
          </span>
          Search name or role
        </div>

        {selectedIds.length > 0 && (
          <div className="group-strip">
            <div className="section-label">
              {isGroup ? `New group · ${selectedPeople.length} selected` : 'New chat'}
            </div>
            <div className="chip-row">
              {selectedPeople.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  className="chip"
                  onClick={() => toggle(person.id)}
                >
                  <Avatar name={person.name} size={24} />
                  {person.name}
                  <span className="chip-x" aria-hidden>
                    ✕
                  </span>
                </button>
              ))}
            </div>
            {isGroup && (
              <div className="group-name-field">
                <input
                  className="text-input"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name"
                  aria-label="Group name"
                />
              </div>
            )}
          </div>
        )}

        <ul className="people-list">
          {candidates.map((person) => {
            const checked = selectedIds.includes(person.id)
            return (
              <li key={person.id} className="person-row" onClick={() => toggle(person.id)}>
                <span className={`check-circle${checked ? ' checked' : ''}`} aria-hidden>
                  ✓
                </span>
                <span className="presence-wrap">
                  <Avatar name={person.name} size={40} />
                  {onlineMemberIds.has(person.id) && (
                    <span className="presence-dot" aria-hidden />
                  )}
                </span>
                <div className="person-main">
                  <div className="person-name-row">
                    <span className="person-name">{person.name}</span>
                  </div>
                  <div className="person-meta">{person.job_title}</div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="newchat-footer">
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={!canCreate}
          onClick={create}
        >
          {isGroup ? 'Create group chat' : 'Start chat'}
        </button>
      </div>
    </div>
  )
}
