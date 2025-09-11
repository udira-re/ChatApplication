// /* eslint-disable perfectionist/sort-imports */
// import { useEffect, useRef } from "react"

// import ChatHeader from "./ChatHeader"
// import MessageInput from "./MessageInput"
// import { useAuthStore } from "../store/store"
// import { useChatStore, type Message } from "../store/use_chat_store"
// import { formatMessageTime } from "../utillis/utils"
// import MessageSkeleton from "./skeleton/MessageSkeleton"

// const ChatContainer: React.FC = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//   } = useChatStore()

//   const { authUser } = useAuthStore()

//   const messageEndRef = useRef<HTMLDivElement | null>(null)

//   // Fetch messages and subscribe to real-time updates
//   useEffect(() => {
//     if (!selectedUser?.id) return

//     getMessages(selectedUser.id)
//     subscribeToMessages()

//     return () => unsubscribeFromMessages()
//   }, [selectedUser?.id, getMessages, subscribeToMessages, unsubscribeFromMessages])

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     if (messageEndRef.current && messages.length) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" })
//     }
//   }, [messages])

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     )
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader />

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message: Message) => (
//           <div
//             key={message.id}
//             className={`chat ${message.senderId === authUser?.id ? "chat-end" : "chat-start"}`}
//           >
//             <div className="chat-image avatar">
//               <div className="w-10 h-10 rounded-full border overflow-hidden">
//                 <img
//                   src={
//                     message.senderId === authUser?.id
//                       ? authUser?.profilePic || "/avatar.png"
//                       : selectedUser?.profilePic || "/avatar.png"
//                   }
//                   alt="profile pic"
//                 />
//               </div>
//             </div>

//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(message.createdAt)}
//               </time>
//             </div>

//             <div className="chat-bubble flex flex-col">
//               {message.image && (
//                 <img
//                   src={message.image}
//                   alt="Attachment"
//                   className="sm:max-w-[200px] rounded-md mb-2"
//                 />
//               )}
//               {message.text && <p>{message.text}</p>}
//             </div>
//           </div>
//         ))}

//         {/* Empty div to scroll into view */}
//         <div ref={messageEndRef}></div>
//       </div>

//       <MessageInput />
//     </div>
//   )
// }

// export default ChatContainer

import { useEffect, useRef } from "react"

import { useAuthStore } from "../store/store"
import { useChatStore, type Message } from "../store/use_chat_store"
import { formatMessageTime } from "../utillis/utils"
import ChatHeader from "./ChatHeader"
import MessageInput from "./MessageInput"
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

  const { authUser } = useAuthStore()
  const messageEndRef = useRef<HTMLDivElement | null>(null)

  // Fetch messages and subscribe to real-time updates
  useEffect(() => {
    if (!selectedUser?.id) return

    getMessages(selectedUser.id)
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
          <div
            key={message.id}
            className={`chat ${message.senderId === authUser?.id ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className="w-10 h-10 rounded-full border overflow-hidden">
                <img
                  src={
                    message.senderId === authUser?.id
                      ? authUser?.profilePic || "/avatar.png"
                      : selectedUser?.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>

            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Input pinned at bottom */}
      <div className=" ">
        <MessageInput />
      </div>
    </div>
  )
}

export default ChatContainer
