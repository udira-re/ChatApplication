import { LoaderCircleIcon } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import toast from "react-hot-toast"

import { getAllUser, getAllFriends } from "../api/friends"
import ChatContainer from "../component/ChatContainer"
import { useAuthStore } from "../store/store"
import { useChatStore } from "../store/use_chat_store"
import { handleApiError } from "../utillis/handle-api-error"

type UserType = {
  _id: string
  user: {
    _id: string
    fullName: string
    email: string
  }
  avatar?: string | null
  requestSent?: boolean
}

type Friend = {
  _id: string
  fullName: string
  email: string
}

const FriendListPage: React.FC = () => {
  const authStore = useAuthStore()
  const authUser = authStore.authUser
  const chatStore = useChatStore()

  const [activeTab, setActiveTab] = useState<"all" | "friends" | "requests">("all")
  const [allUsers, setAllUsers] = useState<UserType[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)

  // Ref to prevent double fetch in Strict Mode
  const hasFetched = useRef(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersRes, friendsRes] = await Promise.all([getAllUser(), getAllFriends()])

      let users: UserType[] = usersRes.users || []

      const requestUserIds: string[] = authStore.profile?.friendRequestsReceived || []
      const missingUsers: UserType[] = requestUserIds
        .filter((id) => !users.find((u) => u.user._id === id))
        .map((id) => ({
          _id: id,
          user: { _id: id, fullName: "Unknown User", email: "Unknown" },
          avatar: null,
        }))
      users = [...users, ...missingUsers]

      setAllUsers(users)

      const friendsList: Friend[] = Array.isArray(friendsRes.friends) ? friendsRes.friends : []
      setFriends(friendsList)
    } catch (err) {
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const init = async () => {
      if (!authStore.profile) {
        await authStore.fetchProfile()
      }
      await fetchData()
    }
    init()
  }, [])

  // Send friend request
  const handleSendRequest = async (receiverId: string) => {
    if (!authUser) return
    try {
      await authStore.sendFriendRequest(receiverId)
      setAllUsers((prev) =>
        prev.map((u) => (u.user._id === receiverId ? { ...u, requestSent: true } : u))
      )
      toast.success("Friend request sent!")
    } catch (err) {
      handleApiError(err)
    }
  }

  // Accept request
  const handleAccept = async (userId: string) => {
    try {
      await authStore.acceptRequest(userId)
      await authStore.fetchProfile()
    } catch (err) {
      handleApiError(err)
    }
  }

  // Reject request
  const handleReject = async (userId: string) => {
    try {
      await authStore.rejectRequest(userId)
      await authStore.fetchProfile()
    } catch (err) {
      handleApiError(err)
    }
  }

  // Open chat with friend
  const handleMessageClick = (friend: Friend) => {
    chatStore.setSelectedUser({
      id: friend._id,
      name: friend.fullName,
    })
  }

  if (loading)
    return (
      <div className="p-4 justify-center">
        <LoaderCircleIcon />{" "}
      </div>
    )

  return (
    <div className="p-4 flex gap-4">
      <div className="flex-1">
        {/* Tabs */}
        <div className="flex gap-4 border-b mb-4">
          {(["all", "friends", "requests"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${
                activeTab === tab ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"
              }`}
            >
              {tab === "all" ? "All Users" : tab === "friends" ? "Friends" : "Friend Requests"}
            </button>
          ))}
        </div>

        {/* All Users Tab */}
        {activeTab === "all" && (
          <ul className="space-y-2">
            {allUsers
              .filter((u) => u.user._id !== authUser?._id)
              .map((u) => {
                const isFriend = friends.some((f) => f._id === u.user._id)
                const requestSent =
                  u.requestSent || authStore.profile?.friendRequestsSent?.includes(u.user._id)
                return (
                  <li
                    key={u._id}
                    className="border p-3 rounded-md flex justify-between items-center hover:bg-gray-100"
                  >
                    <div>
                      <img
                        src={
                          u.avatar ? `${import.meta.env.VITE_API_BASE_URL}${u.avatar}` : "profile"
                        }
                        alt={u.user.fullName}
                        className="w-8 h-8 rounded-full mr-2 inline-block"
                      />
                      {u.user.fullName} ({u.user.email})
                    </div>
                    {!isFriend && (
                      <button
                        onClick={() => handleSendRequest(u.user._id)}
                        disabled={!!requestSent}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                      >
                        {requestSent ? "Request Sent" : "Send Request"}
                      </button>
                    )}
                  </li>
                )
              })}
          </ul>
        )}

        {/* Friends Tab */}
        {activeTab === "friends" && (
          <ul className="space-y-2">
            {friends.length > 0 ? (
              friends
                .filter((f) => f._id !== authUser?._id)
                .map((f) => (
                  <li
                    key={f._id}
                    className="border p-3 rounded-md flex justify-between items-center hover:bg-gray-100"
                  >
                    <div>
                      <div className="font-medium">{f.fullName}</div>
                      <div className="text-sm text-gray-500">{f.email}</div>
                    </div>
                    <button
                      onClick={() => handleMessageClick(f)}
                      className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 cursor-pointer"
                    >
                      Message
                    </button>
                  </li>
                ))
            ) : (
              <div>No friends yet</div>
            )}
          </ul>
        )}

        {/* Friend Requests Tab */}
        {activeTab === "requests" && (
          <ul className="space-y-2">
            {authStore.profile?.friendRequestsReceived?.length ? (
              authStore.profile.friendRequestsReceived
                .filter((reqUserId) => reqUserId !== authUser?._id)
                .map((reqUserId) => {
                  const user = allUsers.find((u) => u.user._id === reqUserId)
                  const displayUser: UserType = user || {
                    _id: reqUserId,
                    user: { _id: reqUserId, fullName: "Unknown User", email: "Unknown" },
                    avatar: null,
                  }

                  return (
                    <li
                      key={displayUser._id}
                      className="border p-3 rounded-md flex justify-between items-center hover:bg-gray-100"
                    >
                      <div>
                        <img
                          src={
                            displayUser.avatar
                              ? `${import.meta.env.VITE_API_BASE_URL}${displayUser.avatar}`
                              : ""
                          }
                          alt={displayUser.user.fullName}
                          className="w-8 h-8 rounded-full mr-2 inline-block"
                        />
                        {displayUser.user.fullName} ({displayUser.user.email})
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(displayUser.user._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(displayUser.user._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  )
                })
            ) : (
              <div>No pending requests</div>
            )}
          </ul>
        )}
      </div>

      {/* ChatContainer */}
      {chatStore.selectedUser && <ChatContainer />}
    </div>
  )
}

export default FriendListPage
