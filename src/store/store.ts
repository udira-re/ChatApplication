// src/store/store.ts
import toast from "react-hot-toast"
import { create } from "zustand"

import { getUserProfile, loginUser, logOutUser, registerUser } from "../api/auth"
import {
  getAllFriends,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  type Friend,
} from "../api/friends"
import { updateProfile as apiUpdateProfile, type UpdateProfileResponse } from "../api/profile"
import { handleApiError } from "../utillis/handle-api-error"

export type AuthUser = {
  id: string
  username: string
  fullName: string
  email: string
}

export type Profile = {
  phone: string
  bio: string
  avatar: string
  notifications: boolean
  status: string
  createdAt: string
  updatedAt: string
  friendRequestsSent: string[]
  friendRequestsReceived: string[]
  user: AuthUser
}

type AuthState = {
  authUser: AuthUser | null
  profile: Profile | null
  onlineUsers: string[]
  socketConnected: boolean
  socket: WebSocket | null

  isRegister: boolean
  isLogging: boolean
  isCheckingAuth: boolean
  isUpdatingProfile: boolean

  allFriends: Friend[] | null
  friendRequests: Friend[] | null
  isFetchingFriends: boolean
  isFetchingRequests: boolean

  // actions
  setIsCheckingAuth: (value: boolean) => void
  register: (data: {
    username: string
    fullName: string
    email: string
    password: string
  }) => Promise<void>
  login: (data: { email: string; password: string }) => Promise<void>
  logOut: () => Promise<void>
  fetchProfile: () => Promise<Profile | null>
  updateProfile: (formData: FormData) => Promise<Profile | null>

  fetchAllFriends: () => Promise<void>
  fetchFriendRequests: () => Promise<void>
  acceptRequest: (senderId: string) => Promise<void>
  rejectRequest: (senderId: string) => Promise<void>

  connectSocket: () => void
  disconnectSocket: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  profile: null,
  onlineUsers: [],
  socketConnected: false,
  socket: null,

  isRegister: false,
  isLogging: false,
  isCheckingAuth: true,
  isUpdatingProfile: false,

  allFriends: null,
  friendRequests: null,
  isFetchingFriends: false,
  isFetchingRequests: false,

  setIsCheckingAuth: (value) => set({ isCheckingAuth: value }),

  // Register
  register: async (data) => {
    set({ isRegister: true })
    try {
      const res = await registerUser(data)
      sessionStorage.setItem("accessToken", res.accessToken)
      sessionStorage.setItem("refreshToken", res.refreshToken)
      set({ authUser: res.user })
      get().connectSocket()
    } finally {
      set({ isRegister: false })
    }
  },

  // Login
  login: async (data) => {
    set({ isLogging: true, isCheckingAuth: true })
    try {
      const res = await loginUser(data)
      sessionStorage.setItem("accessToken", res.accessToken)
      sessionStorage.setItem("refreshToken", res.refreshToken)
      set({ authUser: res.user })
      get().connectSocket()
    } catch (err) {
      handleApiError(err)
      throw err
    } finally {
      set({ isLogging: false, isCheckingAuth: false })
    }
  },

  // Logout
  logOut: async () => {
    const user = get().authUser
    if (!user) return
    try {
      const refresh = sessionStorage.getItem("refreshToken")
      if (refresh) await logOutUser(refresh)
    } finally {
      sessionStorage.removeItem("accessToken")
      sessionStorage.removeItem("refreshToken")
      get().disconnectSocket()
      set({ authUser: null, profile: null })
    }
  },

  // Fetch profile
  fetchProfile: async () => {
    set({ isCheckingAuth: true })
    try {
      const profileData = await getUserProfile()

      if (!profileData || !profileData.user) {
        toast.error("Profile data incomplete")
        return null
      }

      set({ profile: profileData, authUser: profileData.user })
      return profileData
    } catch (err) {
      handleApiError(err)
      return null
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  // Update profile
  updateProfile: async (formData: FormData) => {
    set({ isUpdatingProfile: true })
    try {
      const updatedProfile: UpdateProfileResponse = await apiUpdateProfile(formData)
      if (updatedProfile && updatedProfile.data) {
        set({ profile: updatedProfile.data, authUser: updatedProfile.data.user })
        return updatedProfile.data
      }
      return null
    } catch (err) {
      handleApiError(err)
      return null
    } finally {
      set({ isUpdatingProfile: false })
    }
  },

  // Fetch friends list
  fetchAllFriends: async () => {
    set({ isFetchingFriends: true })
    try {
      const friends: Friend[] = await getAllFriends()
      set({ allFriends: Array.isArray(friends) ? friends : [] })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isFetchingFriends: false })
    }
  },

  // Fetch friend requests
  fetchFriendRequests: async () => {
    set({ isFetchingRequests: true })
    try {
      const requests: Friend[] = await getFriendRequests()
      set({ friendRequests: Array.isArray(requests) ? requests : [] })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isFetchingRequests: false })
    }
  },

  acceptRequest: async (senderId: string) => {
    try {
      await acceptFriendRequest(senderId)
      toast.success("Friend request accepted!")
      get().fetchFriendRequests()
      get().fetchAllFriends()
    } catch (err) {
      handleApiError(err)
    }
  },

  rejectRequest: async (senderId: string) => {
    try {
      await rejectFriendRequest(senderId)
      toast.success("Friend request rejected!")
      get().fetchFriendRequests()
    } catch (err) {
      handleApiError(err)
    }
  },

  // ✅ Real Socket Connection
  connectSocket: () => {
    const { socketConnected } = get()
    const authUser = get().authUser
    if (socketConnected || !authUser) return

    try {
      const socketUrl = `${import.meta.env.VITE_SOCKET_URL}?userId=${authUser.id}`
      const socket = new WebSocket(socketUrl)

      socket.onopen = () => {
        set({ socket, socketConnected: true })
        // console.log("✅ WebSocket connected:", socketUrl)
      }

      socket.onclose = () => {
        set({ socket: null, socketConnected: false })
        // console.log("🔴 WebSocket disconnected")
      }

      socket.onerror = (err) => {
        // console.error("⚠️ WebSocket error:", err)
      }

      // Optional: handle server pings or online user updates
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === "ONLINE_USERS") {
            set({ onlineUsers: data.users })
          }
        } catch {
          // ignore malformed data
        }
      }
    } catch (err) {
      handleApiError(err)
      // console.error("❌ Failed to connect socket:", err)
    }
  },

  disconnectSocket: () => {
    const socket = get().socket
    if (socket) {
      socket.close()
      set({ socket: null })
    }
    set({ socketConnected: false, onlineUsers: [] })
    // console.log("🔌 Socket disconnected")
  },
}))
