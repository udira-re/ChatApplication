import { useEffect, useRef } from "react"

import { useChatStore, type Message } from "../store/use_chat_store"
import ChatHeader from "./ChatHeader"
import MessageInput from "./MessageInput"
import MessageSkeleton from "./skeleton/MessageSkeleton"

// Renders each message item
const MessageItem: React.FC<{ message: Message }> = ({ message }) => (
  <div
    className={`flex flex-col ${message.senderId === message.receiverId ? "items-start" : "items-end"}`}
  >
    {message.text && (
      <p className="bg-gray-200 p-2 rounded-md max-w-xs break-words">{message.text}</p>
    )}
    {message.fileUrl && (
      <img
        src={message.fileUrl}
        alt={message.fileName || "file"}
        className="max-w-xs rounded-md mt-1"
      />
    )}
  </div>
)

const ChatContainer: React.FC = () => {
  const { messages, isMessagesLoading, selectedUser } = useChatStore()

  const messageEndRef = useRef<HTMLDivElement | null>(null)

  // Fetch messages and subscribe to real-time updates when selectedUser changes
  useEffect(() => {
    const { subscribeToMessages, unsubscribeFromMessages } = useChatStore.getState()

    subscribeToMessages() // only subscribe, do NOT fetch messages here
    return () => unsubscribeFromMessages()
  }, [])

  // Scroll to bottom whenever messages change
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
        <div ref={messageEndRef} /> {/* Scroll anchor */}
      </div>

      {/* Input pinned at bottom */}
      <div>
        <MessageInput />
      </div>
    </div>
  )
}

export default ChatContainer
