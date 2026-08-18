import { createFileRoute } from '@tanstack/react-router'
import { groupChat, groupMessages } from '../../mock/data'
import { ConversationTopBar } from '../../components/chat/ConversationTopBar'
import { GroupTile } from '../../components/chat/GroupTile'
import { MessageList } from '../../components/chat/MessageList'
import { Composer } from '../../components/chat/Composer'

export const Route = createFileRoute('/mobile/chat-group')({
  component: ChatGroupScreen,
})

function ChatGroupScreen() {
  return (
    <div className="phone">
      <ConversationTopBar
        backHref="/mobile/chats"
        avatar={<GroupTile name={groupChat.name} />}
        title={groupChat.name}
        subtitle={`${groupChat.memberIds.length} members`}
      />
      <div className="phone-scroll convo-scroll">
        <MessageList messages={groupMessages} showAuthors />
      </div>
      <Composer />
    </div>
  )
}
