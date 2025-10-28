import { X } from "lucide-react"
import React from "react"

import { useAuthStore } from "../store/store"
import { useChatStore } from "../store/use_chat_store"

const ChatHeader: React.FC = () => {
  const { selectedUser, setSelectedUser } = useChatStore()
  const { onlineUsers } = useAuthStore()

  if (!selectedUser) return null // safeguard if no user is selected

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={
                  selectedUser?.avatar
                    ? `${import.meta.env.VITE_API_BASE_URL}${selectedUser.avatar}`
                    : "profile"
                }
                alt={selectedUser?.fullName}
                className="w-8 h-8 rounded-full"
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.name}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser.id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  )
}

export default ChatHeader
