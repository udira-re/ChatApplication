import { Check, CheckCheck, XCircle } from "lucide-react"

import type { Message } from "../store/use_chat_store"

import { useAuthStore } from "../store/store"
import { formatMessageTime } from "../utillis/utils"

const MessageStatusIcon = ({ status }: { status: Message["status"] }) => {
  switch (status) {
    case "sent":
      return <Check className="w-4 h-4 text-gray-400" />
    case "delivered":
      return <CheckCheck className="w-4 h-4 text-gray-400" />
    case "read":
      return <CheckCheck className="w-4 h-4 text-blue-500" />
    case "failed":
      return <XCircle className="w-4 h-4 text-red-500" />
    default:
      return null
  }
}

type Props = {
  message: Message & { avatar?: string } // optional avatar for sender
}

export default function MessageItem({ message }: Props) {
  const authUser = useAuthStore.getState().authUser
  const profile = useAuthStore.getState().profile
  const isMe = message.senderId === authUser?.id

  const senderAvatar = isMe ? profile?.avatar || "/avatar.png" : message.avatar || "/avatar.png"

  return (
    <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <div className="chat-image avatar">
          <div className="w-10 h-10 rounded-full border overflow-hidden">
            <img src={senderAvatar} alt="profile pic" />
          </div>
        </div>
      )}

      <div
        className={`chat-bubble flex flex-col max-w-xs break-words p-2 rounded-lg ${
          isMe ? "bg-blue-100 text-right" : "bg-gray-100"
        }`}
      >
        {message?.avatar && (
          <img
            src={message?.avatar}
            alt="Attachment"
            className="sm:max-w-[200px] rounded-md mb-2"
          />
        )}
        {message.text && <p>{message.text}</p>}

        <div className="flex justify-end items-center mt-1 gap-1 text-xs opacity-70">
          <time>{formatMessageTime(message.createdAt)}</time>
          {isMe && <MessageStatusIcon status={message.status} />}
        </div>
      </div>

      {isMe && (
        <div className="chat-image avatar">
          <div className="w-10 h-10 rounded-full border overflow-hidden">
            <img src={profile?.avatar || "/avatar.png"} alt="profile pic" />
          </div>
        </div>
      )}
    </div>
  )
}
