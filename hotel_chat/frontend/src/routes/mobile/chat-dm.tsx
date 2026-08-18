import { createFileRoute } from '@tanstack/react-router'
import { dmChat, dmMessages, personById } from '../../mock/data'
import { Avatar } from '../../components/Avatar'
import { ConversationTopBar } from '../../components/chat/ConversationTopBar'
import { MessageList } from '../../components/chat/MessageList'
import { Composer } from '../../components/chat/Composer'

export const Route = createFileRoute('/mobile/chat-dm')({
  component: ChatDmScreen,
})

function ChatDmScreen() {
  const other = personById(dmChat.otherId)
  return (
    <div className="phone">
      <ConversationTopBar
        backHref="/mobile/chats"
        avatar={<Avatar name={other.name} size={40} />}
        title={other.name}
        subtitle={
          <>
            {other.jobTitle} · <span className="presence-dot" /> online
          </>
        }
      />
      <div className="phone-scroll convo-scroll">
        <MessageList messages={dmMessages} />
      </div>
      <Composer />
    </div>
  )
}
