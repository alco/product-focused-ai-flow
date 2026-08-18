// frontend/src/routes/_appShell/chat.$chatId.tsx
// Handles every chat-list row: group and DM conversations get the
// message-thread screen (mobile: full phone chrome with a back chevron;
// desktop: bare pane + members aside, both siblings of the sidebar the
// _appShell layout renders). Company/location channels get the
// announcement-feed screen, which only has a mobile design so far — it
// renders the same phone chrome regardless of viewport (known gap, not
// part of this plan's scope).
import { createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Avatar } from '../../components/Avatar'
import { Composer } from '../../components/chat/Composer'
import { ConversationTopBar } from '../../components/chat/ConversationTopBar'
import { GroupTile } from '../../components/chat/GroupTile'
import { MessageList } from '../../components/chat/MessageList'
import { MembersPanel } from '../../components/desktop/MembersPanel'
import { AnnouncementFeed } from '../../components/channel/AnnouncementFeed'
import { ChannelTopbar } from '../../components/channel/ChannelTopbar'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import {
  chatEntryById,
  companyChannel,
  groupChat,
  locationChannel,
  messagesByChatId,
  personById,
} from '../../mock/data'
import type { ChatListEntry } from '../../mock/data'
import { channelFeed } from '../../mock/channel'
import '../../styles/conversation.css'
import '../../styles/channel.css'

export const Route = createFileRoute('/_appShell/chat/$chatId')({
  component: ChatRoute,
})

function ChatRoute() {
  const { chatId } = Route.useParams()
  const isDesktop = useIsDesktop()
  const chat = chatEntryById(chatId)

  if (!chat) {
    return (
      <main className="desktop-main">
        <div className="container" style={{ padding: '3rem' }}>
          Chat not found.
        </div>
      </main>
    )
  }

  if (chat.kind === 'company' || chat.kind === 'location') {
    return <ChannelScreen chat={chat} />
  }

  return <ConversationScreen chat={chat} isDesktop={isDesktop} />
}

function ChannelScreen({ chat }: { chat: ChatListEntry }) {
  const channel = chat.kind === 'company' ? companyChannel : locationChannel
  // Only the location channel has authored posts in the mock data; the
  // company channel is a real, empty inbox rather than fabricated content.
  const posts = chat.kind === 'location' ? channelFeed : []

  return (
    <div className="phone">
      <ChannelTopbar channel={channel} />
      <div className="phone-scroll channel-scroll">
        {posts.length > 0 ? (
          <AnnouncementFeed posts={posts} showAddReaction />
        ) : (
          <p className="text-muted" style={{ padding: '1.5rem' }}>
            No announcements yet.
          </p>
        )}
      </div>
      <footer className="channel-footer">
        <span className="channel-footer-note">◆ Only managers can post</span>
      </footer>
    </div>
  )
}

function ConversationScreen({
  chat,
  isDesktop,
}: {
  chat: ChatListEntry
  isDesktop: boolean
}) {
  const messages = messagesByChatId[chat.id] ?? []
  const isGroup = chat.kind === 'group'
  const other = chat.kind === 'dm' && chat.otherId ? personById(chat.otherId) : undefined

  const avatar: ReactNode = isGroup ? (
    <GroupTile name={chat.name} />
  ) : (
    <Avatar name={chat.name} size={40} />
  )

  const subtitle: ReactNode = isGroup
    ? chat.memberCount
      ? `${chat.memberCount} members`
      : undefined
    : other && (
        <>
          {other.jobTitle} · <span className="presence-dot" /> {other.online ? 'online' : 'offline'}
        </>
      )

  const topbar = (
    <ConversationTopBar
      backTo={isDesktop ? undefined : '/chats'}
      avatar={avatar}
      title={chat.name}
      subtitle={subtitle}
    />
  )

  const transcript =
    messages.length > 0 ? (
      <MessageList messages={messages} showAuthors={isGroup} />
    ) : (
      <p className="text-muted" style={{ padding: '1.5rem' }}>
        No messages yet.
      </p>
    )

  // Full member rosters only exist in the mock data for the one group chat
  // built out in the mockup stage (wedding-ops); other group ids show no
  // members panel rather than a fabricated roster.
  const members =
    isGroup && chat.id === groupChat.id
      ? groupChat.memberIds.map(personById).sort((a, b) => {
          if (a.role !== b.role) return a.role === 'manager' ? -1 : 1
          return a.name.localeCompare(b.name)
        })
      : undefined

  if (!isDesktop) {
    return (
      <div className="phone">
        {topbar}
        <div className="phone-scroll convo-scroll">{transcript}</div>
        <Composer />
      </div>
    )
  }

  return (
    <>
      <main className="desktop-main">
        {topbar}
        <div className="convo-scroll desktop-convo">
          <div className="desktop-transcript">{transcript}</div>
        </div>
        <Composer />
      </main>
      {members && <MembersPanel members={members} />}
    </>
  )
}
