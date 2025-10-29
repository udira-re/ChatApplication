import { useEffect, useRef } from "react"

import { useAuthStore } from "../store/store"
import { useChatStore, type Message } from "../store/use_chat_store"
import ChatHeader from "./ChatHeader"
import MessageInput from "./MessageInput"
import MessageItem from "./MessageItem"
import MessageSkeleton from "./skeleton/MessageSkeleton"

const ChatContainer: React.FC = () => {
  const { messages, isMessagesLoading, selectedUser } = useChatStore()
  const authUserId = useAuthStore.getState().authUser?._id || ""
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const messageEndRef = useRef<HTMLDivElement | null>(null)

  // Subscribe to real-time messages
  useEffect(() => {
    const { subscribeToMessages, unsubscribeFromMessages } = useChatStore.getState()
    subscribeToMessages()
    return () => unsubscribeFromMessages()
  }, [])

  // Scroll to bottom **only on first load of messages**
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [messages.length]) // run only when messages load initially

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
      <ChatHeader />
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: Message) => (
          <MessageItem key={message._id || message._id} message={message} authUserId={authUserId} />
        ))}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  )
}

export default ChatContainer
