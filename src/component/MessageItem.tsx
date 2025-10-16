// MessageItem.tsx
import type { IMessage } from "../api/message"

import { useAuthStore } from "../store/store"
import { formatMessageTime } from "../utillis/utils"

type Props = {
  message: IMessage & { avatar?: string; fileName?: string }
}

export default function MessageItem({ message }: Props) {
  const authUser = useAuthStore.getState().authUser
  const isMe = message.sender === authUser?._id
  const senderAvatar = isMe ? authUser?.avatar || "/avatar.png" : message.avatar || "/avatar.png"
  // Debug console
  // console.log("---- MessageItem ----")
  // console.log("Message ID:", message.id)
  // console.log("Message sender:", message.sender)
  // console.log("Message receiver:", message.receiver)
  // console.log("Message text:", message.text)
  // console.log("Auth user ID:", authUser?._id)
  // console.log("isMe:", isMe)
  // console.log("Avatar used:", message.avatar)
  // console.log("--------------------")
  return (
    <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
      {/* Left avatar for received messages */}
      {!isMe && (
        <img
          src={senderAvatar}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border"
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
            src={message.fileUrl}
            alt={message.fileName || "file"}
            className="rounded-md mt-1 max-w-[200px] object-cover"
          />
        )}

        <div className="flex justify-end items-center mt-1 gap-1 text-xs opacity-70">
          <time>{formatMessageTime(new Date(message.createdAt))}</time>
        </div>
      </div>

      {/* Right avatar for sent messages */}
      {isMe && (
        <img
          src={authUser?.avatar || "/avatar.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border"
        />
      )}
    </div>
  )
}
