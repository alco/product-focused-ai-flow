// frontend/src/routes/_appShell/chat.$chatId.tsx
// Handles every chat-list row: group and DM conversations get the
// message-thread screen (mobile: full phone chrome with a back chevron;
// desktop: full-width top bar over a transcript column + members aside,
// all next to the sidebar the _appShell layout renders).
// Company/location channels get the
// announcement-feed screen (mobile: phone chrome; desktop: a bare pane with
// the feed in a readable centered column).
// Everything renders from the collections via useConversation.
import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'
import type { ReactNode } from 'react'
import { Avatar } from '../../components/Avatar'
import { Composer } from '../../components/chat/Composer'
import { ConversationTopBar } from '../../components/chat/ConversationTopBar'
import { GroupTile } from '../../components/chat/GroupTile'
import { MessageList } from '../../components/chat/MessageList'
import { MembersPanel } from '../../components/desktop/MembersPanel'
import { TopbarNav } from '../../components/desktop/TopbarNav'
import { AnnouncementFeed } from '../../components/channel/AnnouncementFeed'
import { ChannelTopbar } from '../../components/channel/ChannelTopbar'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import { useConversation } from '../../hooks/useConversation'
import { locationsCollection } from '../../db/collections'
import { conversationTitle } from '../../db/derive'
import { onlineMemberIds } from '../../db/presence'
import { session } from '../../db/session'
import '../../styles/conversation.css'
import '../../styles/channel.css'

export const Route = createFileRoute('/_appShell/chat/$chatId')({
  component: ChatRoute,
})

function ChatRoute() {
  const { chatId } = Route.useParams()
  const isDesktop = useIsDesktop()
  const data = useConversation(chatId)

  if (!data.conversation) {
    if (!data.isReady) return null
    return (
      <main className="desktop-main">
        <div className="container" style={{ padding: '3rem' }}>
          Chat not found.
        </div>
      </main>
    )
  }

  const isChannel =
    data.conversation.kind === 'company_channel' || data.conversation.kind === 'location_channel'
  if (isChannel) {
    return <ChannelScreen data={data} isDesktop={isDesktop} />
  }

  return <ConversationScreen data={data} isDesktop={isDesktop} />
}

type ConversationData = ReturnType<typeof useConversation>

function ChannelScreen({ data, isDesktop }: { data: ConversationData; isDesktop: boolean }) {
  const conversation = data.conversation!
  const { data: locations } = useLiveQuery((q) => q.from({ l: locationsCollection }))

  // Audience line = who the channel reaches (its roster), per the shape docs.
  const scopeName =
    conversation.kind === 'location_channel'
      ? (locations.find((l) => l.id === conversation.location_id)?.name ?? conversation.name)
      : session.companyName
  const audience = `Everyone at ${scopeName} · ${data.roster.length} people`

  const feed =
    data.messages.length > 0 ? (
      <AnnouncementFeed
        posts={data.messages}
        reactions={data.reactions}
        membersById={data.membersById}
        showAddReaction
      />
    ) : (
      <p className="text-muted" style={{ padding: '1.5rem' }}>
        No announcements yet.
      </p>
    )

  const footer = (
    <footer className="channel-footer">
      <span className="channel-footer-note">◆ Only managers can post</span>
    </footer>
  )

  if (!isDesktop) {
    return (
      <div className="phone">
        <ChannelTopbar channel={{ name: conversation.name ?? '', audience }} backTo="/chats" />
        <div className="phone-scroll channel-scroll">{feed}</div>
        {footer}
      </div>
    )
  }

  return (
    <main className="desktop-main">
      <ChannelTopbar
        channel={{ name: conversation.name ?? '', audience }}
        actions={<TopbarNav />}
      />
      <div className="channel-scroll desktop-convo">
        <div className="desktop-feed">{feed}</div>
      </div>
      {footer}
    </main>
  )
}

function ConversationScreen({
  data,
  isDesktop,
}: {
  data: ConversationData
  isDesktop: boolean
}) {
  const conversation = data.conversation!
  const isGroup = conversation.kind === 'group'
  const title = conversationTitle(conversation, data.roster, data.membersById, session.memberId)

  const otherId = conversation.kind === 'dm'
    ? data.roster.find((r) => r.member_id !== session.memberId)?.member_id
    : undefined
  const other = otherId ? data.membersById.get(otherId) : undefined

  const avatar: ReactNode = isGroup ? (
    <GroupTile name={title} />
  ) : (
    <Avatar name={title} size={40} />
  )

  const subtitle: ReactNode = isGroup
    ? data.roster.length > 0
      ? `${data.roster.length} members`
      : undefined
    : other && (
        <>
          {other.job_title} · <span className="presence-dot" />{' '}
          {onlineMemberIds.has(other.id) ? 'online' : 'offline'}
        </>
      )

  const topbar = (
    <ConversationTopBar
      backTo={isDesktop ? undefined : '/chats'}
      avatar={avatar}
      title={title}
      subtitle={subtitle}
      actions={isDesktop ? <TopbarNav /> : undefined}
    />
  )

  const transcript =
    data.messages.length > 0 ? (
      <MessageList
        messages={data.messages}
        reactions={data.reactions}
        membersById={data.membersById}
        showAuthors={isGroup}
      />
    ) : (
      <p className="text-muted" style={{ padding: '1.5rem' }}>
        No messages yet.
      </p>
    )

  if (!isDesktop) {
    return (
      <div className="phone">
        {topbar}
        <div className="phone-scroll convo-scroll">{transcript}</div>
        <Composer />
      </div>
    )
  }

  // The top bar spans the whole content area; the members panel starts
  // immediately below it, alongside the transcript + composer column.
  return (
    <main className="desktop-main">
      {topbar}
      <div className="desktop-body">
        <div className="desktop-chat-col">
          <div className="convo-scroll desktop-convo">
            <div className="desktop-transcript">{transcript}</div>
          </div>
          <Composer />
        </div>
        {isGroup && data.rosterMembers.length > 0 && (
          <MembersPanel members={data.rosterMembers} />
        )}
      </div>
    </main>
  )
}
