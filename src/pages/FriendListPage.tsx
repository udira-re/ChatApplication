import { useEffect, useState } from "react"
import toast from "react-hot-toast"

// eslint-disable-next-line import/order
import type { Friend } from "../api/friends"

import {
  getAllFriends,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../api/friends"

const FriendListPage = () => {
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends")
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [friendsRes, requestsRes] = await Promise.all([getAllFriends(), getFriendRequests()])
      setFriends(friendsRes.data || [])
      setFriendRequests(requestsRes.data || [])
    } catch (err) {
      toast.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (id: string) => {
    try {
      await acceptFriendRequest(id)
      toast.success("Friend request accepted!")
      setFriendRequests((prev) => prev.filter((r) => r.id !== id))
      fetchData()
    } catch {
      toast.error("Failed to accept request")
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectFriendRequest(id)
      toast.success("Friend request rejected!")
      setFriendRequests((prev) => prev.filter((r) => r.id !== id))
    } catch {
      toast.error("Failed to reject request")
    }
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex gap-4 border-b mb-4">
        <button
          onClick={() => setActiveTab("friends")}
          className={`pb-2 ${
            activeTab === "friends" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"
          }`}
        >
          All Friends
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-2 ${
            activeTab === "requests" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"
          }`}
        >
          Friend Requests
        </button>
      </div>

      {/* Friends List */}
      {activeTab === "friends" && (
        <>
          {friends.length === 0 ? (
            <div>No friends found</div>
          ) : (
            <ul className="space-y-2">
              {friends.map((f) => (
                <li key={f.id} className="border p-3 rounded-md hover:bg-gray-100">
                  {f.name} ({f.email})
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Friend Requests */}
      {activeTab === "requests" && (
        <>
          {friendRequests.length === 0 ? (
            <div>No pending requests</div>
          ) : (
            <ul className="space-y-2">
              {friendRequests.map((req) => (
                <li
                  key={req.id}
                  className="border p-3 rounded-md flex justify-between items-center hover:bg-gray-100"
                >
                  <div>
                    {req.name} ({req.email})
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

export default FriendListPage
