// MessageItem.tsx
import { useAuthStore } from "../store/store"

export type Message = {
  _id: string
  sender: string
  receiver: string
  text?: string
  fileUrl?: string
  fileName?: string
  createdAt: string
  status?: "sent" | "delivered" | "read" | "failed"
  avatar?: string
}

type Props = {
  message: Message
  authUserId: string
}

export default function MessageItem({ message }: Props) {
  const authUser = useAuthStore.getState().authUser?._id
  const isMe = message.sender === authUser
  const senderAvatar = message.avatar || "/avatar.png"

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
          {/* <time>{formatMessageTime(new Date(message.createdAt))}</time> */}
          <time>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
          {isMe && message.status && <span> • {message.status}</span>}
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
