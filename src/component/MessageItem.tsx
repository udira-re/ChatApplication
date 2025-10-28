// MessageItem.tsx
import type { IMessage } from "../api/message"

import { useAuthStore } from "../store/store"
import { formatMessageTime } from "../utillis/utils"

type Props = {
  message: IMessage & { avatar?: string; fileName?: string }
}

export default function MessageItem({ message }: Props) {
  const authUser = useAuthStore.getState().authUser
  const isMe = message.sender === authUser?._id // ✅ always compare senderId
  const senderAvatar = isMe ? authUser?.avatar || "/avatar.png" : message.avatar || "/avatar.png"

  return (
    <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
      {/* Receiver avatar (left side) */}
      {!isMe && (
        <img
          src={
            senderAvatar.startsWith("http")
              ? senderAvatar
              : `${import.meta.env.VITE_API_BASE_URL}${senderAvatar}`
          }
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      )}

      {/* Message bubble */}
      <div
        className={`flex flex-col max-w-xs break-words p-2 rounded-lg ${
          isMe ? "bg-blue-500 text-white rounded-tr-none" : "bg-gray-200 text-black rounded-tl-none"
        }`}
      >
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}

        {message.fileUrl && (
          <img
            src={
              message.fileUrl.startsWith("http")
                ? message.fileUrl
                : `${import.meta.env.VITE_API_BASE_URL}${message.fileUrl}`
            }
            alt={message.fileName || "file"}
            className="rounded-md mt-1 max-w-[200px] object-cover"
          />
        )}

        <div className="flex justify-end items-center mt-1 gap-1 text-xs opacity-70">
          <time>{formatMessageTime(new Date(message.createdAt))}</time>
        </div>
      </div>

      {/* Sender avatar (right side) */}
      {isMe && (
        <img
          src={
            senderAvatar.startsWith("http")
              ? senderAvatar
              : `${import.meta.env.VITE_API_BASE_URL}${senderAvatar}`
          }
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover border"
        />
      )}
    </div>
  )
}
