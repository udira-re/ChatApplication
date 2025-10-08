import api from "./api"

export type Friend = {
  id: string
  name: string
  email: string
  avatar?: string
}

// ✅ Get all friends
export const getAllFriends = async () => {
  const res = await api.get("/api/user/friends")
  return res.data
}

// ✅ Get all friend requests
export const getFriendRequests = async () => {
  const res = await api.get("/api/user/friends/requests")
  return res.data
}

// ✅ Accept friend request
export const acceptFriendRequest = async (senderId: string) => {
  const res = await api.post("/api/user/friends/accept", { senderId })
  return res.data
}

// ✅ Reject friend request
export const rejectFriendRequest = async (senderId: string) => {
  const res = await api.post("/api/user/friends/reject", { senderId })
  return res.data
}
