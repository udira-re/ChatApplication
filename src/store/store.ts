import { create } from "zustand"

import { getUserProfile, loginUser, logOutUser, registerUser } from "../api/auth"
import { updateProfile } from "../api/profile"
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
}
type AuthState = {
  authUser: AuthUser | null
  profile: Profile | null
  onlineUsers: string[]
  socketConnected: boolean
  socketInterval: number | null

  isRegister: boolean
  isLogging: boolean
  isCheckingAuth: boolean
  isUpdatingProfile: boolean
  setIsCheckingAuth: (value: boolean) => void

  register: (data: {
    username: string
    fullName: string
    email: string
    password: string
  }) => Promise<void>
  login: (data: { email: string; password: string }) => Promise<void>
  logOut: () => Promise<void>
  fetchProfile: () => Promise<void>
  updateProfile: (formData: FormData) => Promise<void>

  connectSocket: () => void
  disconnectSocket: () => void
  socket: WebSocket | null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  profile: null,
  onlineUsers: [],
  socketConnected: false,
  socketInterval: null,

  isRegister: false,
  isLogging: false,
  isCheckingAuth: true,
  isUpdatingProfile: false,

  setIsCheckingAuth: (value: boolean) => set({ isCheckingAuth: value }),
  socket: null,

  // ✅ Register
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

  // ✅ Login
  login: async (data) => {
    set({ isLogging: true, isCheckingAuth: true })
    try {
      const res = await loginUser(data)
      sessionStorage.setItem("accessToken", res.accessToken)
      sessionStorage.setItem("refreshToken", res.refreshToken)
      set({ authUser: res.user })
    } catch (err) {
      handleApiError(err)
      throw err
    } finally {
      set({ isLogging: false, isCheckingAuth: false })
    }
  },

  // ✅ Logout
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
      set({ authUser: null })
    }
  },

  // ✅ Fetch profile
  fetchProfile: async () => {
    set({ isCheckingAuth: true })
    try {
      const user = await getUserProfile()
      // set({ authUser: user })
      return user
    } catch (err) {
      handleApiError(err)
      set({ authUser: null })
      return null
    } finally {
      set({ isCheckingAuth: false })
    }
  },
  // ✅ Update profile with FormData
  updateProfile: async (formData: FormData) => {
    set({ isUpdatingProfile: true })
    try {
      const updatedUser = await updateProfile(formData)
      set({ authUser: updatedUser })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isUpdatingProfile: false })
    }
  },

  // ✅ Mock socket connect
  connectSocket: () => {
    set({ socketConnected: true })
    const mockUsers = ["Alice", "Bob", "Charlie", "Daisy", "Eve"]
    let i = 0
    const interval = window.setInterval(() => {
      set({ onlineUsers: mockUsers.slice(0, (i % mockUsers.length) + 1) })
      i++
    }, 3000)
    set({ socketInterval: interval })
  },

  // ✅ Mock socket disconnect
  disconnectSocket: () => {
    const { socketInterval } = get()
    if (socketInterval) clearInterval(socketInterval)
    set({ socketConnected: false, onlineUsers: [], socketInterval: null })
  },
}))
