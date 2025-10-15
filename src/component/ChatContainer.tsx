import { useEffect, useRef } from "react"

import { useChatStore, type Message } from "../store/use_chat_store"
import ChatHeader from "./ChatHeader"
import MessageInput from "./MessageInput"
import MessageItem from "./MessageItem"
import MessageSkeleton from "./skeleton/MessageSkeleton"

const ChatContainer: React.FC = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore()

  const messageEndRef = useRef<HTMLDivElement | null>(null)

  // Fetch messages and subscribe to real-time updates
  useEffect(() => {
    if (!selectedUser?.id) return

    // getMessages(selectedUser.id)
    subscribeToMessages()

    return () => unsubscribeFromMessages()
  }, [selectedUser?.id, getMessages, subscribeToMessages, unsubscribeFromMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    )
  }

  if (!selectedUser) return null

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <ChatHeader />

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: Message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        <div ref={messageEndRef} /> {/* scroll anchor */}
      </div>

      {/* Input pinned at bottom */}
      <div>
        <MessageInput />
      </div>
    </div>
  )
}

export default ChatContainer
