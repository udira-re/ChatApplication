import { Users, Plus, X } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

import { createGroupAPI } from "../api/message"
import { useAuthStore } from "../store/store"
import { useChatStore } from "../store/use_chat_store"
import { handleApiError } from "../utillis/handle-api-error"
import SearchBar from "./reuseable/SearchBar"

type User = {
  _id: string
  name: string
  avatar?: string
  lastMessage?: string
}

const SidebarSkeleton = () => (
  <div className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col animate-pulse">
    <div className="border-b border-base-300 w-full p-5">
      <div className="h-6 w-24 bg-base-300 rounded"></div>
    </div>
    <div className="flex-1 flex flex-col gap-3 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 bg-base-300 rounded"></div>
      ))}
    </div>
  </div>
)

const Sidebar: React.FC = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore()
  const { onlineUsers } = useAuthStore()
  const navigate = useNavigate()

  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showGroupList, setShowGroupList] = useState(false)
  const [friends] = useState<User[]>([]) // <-- friends list
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [groupName, setGroupName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // ✅ Fetch all users for sidebar contacts
  useEffect(() => {
    getUsers()
  }, [getUsers])

  // ✅ Fetch all friends for group creation

  const mappedUsers: User[] = users.map((user) => ({
    _id: user.id,
    name: user.name,
    avatar: user.avatar,
    lastMessage: user.lastMessage || "",
  }))

  const filteredUsers: User[] = mappedUsers
    .filter((user) => (showOnlineOnly ? onlineUsers.includes(user._id) : true))
    .filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleFriendSelect = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    )
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Enter a group name")
      return
    }
    if (selectedFriends.length === 0) {
      toast.error("Select at least one friend")
      return
    }

    try {
      setIsCreating(true)
      const { group } = await createGroupAPI(groupName, selectedFriends)
      toast.success("Group created successfully!")

      // auto-open group chat
      setSelectedUser({
        _id: group._id,
        name: group.name,
        avatar: "/group-avatar.png",
        isGroup: true,
      } as never)

      setShowGroupList(false)
      setSelectedFriends([])
      setGroupName("")
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsCreating(false)
    }
  }

  if (isUsersLoading) return <SidebarSkeleton />

  return (
    <aside className="h-full w-32 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>
          <span
            className="text-xs text-zinc-500 underline hover:text-blue-400 cursor-pointer"
            onClick={() => navigate("/friends")}
          >
            View All
          </span>
        </div>

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length} online)</span>
        </div>

        <div className="mt-3 flex items-center gap-2 relative">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search friends..."
            className="flex-1"
          />
          <button
            className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            onClick={() => setShowGroupList((prev) => !prev)}
            title="Create Group"
          >
            {showGroupList ? <X className="size-4" /> : <Plus className="size-4" />}
          </button>

          {/* 🧩 Group Creation Dropdown */}
          {showGroupList && (
            <div className="absolute top-12 left-0 w-full bg-base-200 border border-base-300 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center gap-3 p-2 hover:bg-base-300 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => handleFriendSelect(friend._id)}
                      className="checkbox checkbox-sm"
                    />
                    <img
                      src={
                        friend.avatar
                          ? `${import.meta.env.VITE_API_BASE_URL}${friend.avatar}`
                          : "/default-avatar.png"
                      }
                      alt={friend.name}
                      className="size-8 rounded-full object-cover"
                    />
                    <span className="text-sm truncate">{friend.name}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-zinc-500 p-3">No friends available</div>
              )}

              {/* Group name + create button */}
              <div className="p-3 border-t border-base-300 flex flex-col gap-2">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="input input-sm input-bordered w-full"
                />
                <button
                  onClick={handleCreateGroup}
                  disabled={isCreating}
                  className="btn btn-primary btn-sm"
                >
                  {isCreating ? "Creating..." : "Create Group"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🧑‍💻 Users list */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user as never)}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
              selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
            }`}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={
                  user.avatar
                    ? `${import.meta.env.VITE_API_BASE_URL}${user.avatar}`
                    : "/default-avatar.png"
                }
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
              )}
            </div>

            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.name}</div>
              {user.lastMessage && (
                <div className="text-sm text-zinc-400 truncate">{user.lastMessage}</div>
              )}
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            {showOnlineOnly ? "No online users" : "No contacts"}
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
