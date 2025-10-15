import api from "./api"

export type Friend = {
  _id: string
  fullName: string
  email: string
  userName: string
}

// ✅ Get all friends
export const getAllFriends = async () => {
  const res = await api.get("/api/user/friends")
  return res.data
}

// Get all Users
export const getAllUser = async () => {
  const res = await api.get("/api/user")
  return res.data
}

// ✅ Send friend request
export const SendFriendRequests = async (receiverId: string) => {
  const res = await api.post("/api/user/friends/request", { receiverId })
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
