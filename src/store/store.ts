// import toast from "react-hot-toast"
// import { create } from "zustand"

// import { getUserProfile, loginUser, logOutUser, registerUser } from "../api/auth"
// import {
//   getAllFriends,
//   acceptFriendRequest,
//   rejectFriendRequest,
//   SendFriendRequests,
//   type Friend,
// } from "../api/friends"
// import { updateProfile as apiUpdateProfile, type UpdateProfileResponse } from "../api/profile"
// import { handleApiError } from "../utillis/handle-api-error"

// // Types
// export type AuthUser = {
//   _id: string
//   username: string
//   fullName: string
//   email: string
//   notifications?: boolean
//   avatar?: string
// }

// export type ProfileUser = {
//   phone: string
//   bio: string
//   avatar: string
//   status: string
//   createdAt: string
//   updatedAt: string
//   friendRequestsSent: string[]
//   friendRequestsReceived: string[]
// }

// export type UserData = {
//   user: AuthUser
//   profile: ProfileUser
// }

// type AuthState = {
//   authUser: AuthUser | null
//   profile: ProfileUser | null
//   onlineUsers: string[]
//   socketConnected: boolean
//   socket: WebSocket | null

//   isRegister: boolean
//   isLogging: boolean
//   isCheckingAuth: boolean
//   isUpdatingProfile: boolean

//   allFriends: Friend[] | null
//   friendRequests: Friend[] | null
//   isFetchingFriends: boolean

//   setIsCheckingAuth: (value: boolean) => void
//   setAuthUser: (user: AuthUser | null) => void

//   register: (data: {
//     username: string
//     fullName: string
//     email: string
//     password: string
//   }) => Promise<void>
//   login: (data: { email: string; password: string }) => Promise<void>
//   logOut: () => Promise<void>
//   fetchProfile: () => Promise<UserData | null>
//   updateProfile: (formData: FormData) => Promise<UserData | null>

//   fetchAllFriends: () => Promise<void>
//   fetchFriendRequests: () => Promise<void>
//   acceptRequest: (senderId: string) => Promise<void>
//   rejectRequest: (senderId: string) => Promise<void>
//   sendFriendRequest: (receiverId: string) => Promise<void>

//   connectSocket: () => void
//   disconnectSocket: () => void
// }

// // Load authUser from sessionStorage
// const storedUser = sessionStorage.getItem("authUser")
// const initialUser = storedUser ? JSON.parse(storedUser) : null

// export const useAuthStore = create<AuthState>((set, get) => ({
//   authUser: initialUser,
//   profile: null,
//   onlineUsers: [],
//   socketConnected: false,
//   socket: null,

//   isRegister: false,
//   isLogging: false,
//   isCheckingAuth: true,
//   isUpdatingProfile: false,

//   allFriends: null,
//   friendRequests: null,
//   isFetchingFriends: false,

//   setIsCheckingAuth: (value) => set({ isCheckingAuth: value }),

//   setAuthUser: (user) => {
//     if (user) sessionStorage.setItem("authUser", JSON.stringify(user))
//     else sessionStorage.removeItem("authUser")
//     set({ authUser: user })
//   },

//   register: async (data) => {
//     set({ isRegister: true })
//     try {
//       const res = await registerUser(data)
//       sessionStorage.setItem("accessToken", res.accessToken)
//       sessionStorage.setItem("refreshToken", res.refreshToken)

//       const user: AuthUser = {
//         _id: res.user._id,
//         username: res.user.username,
//         fullName: res.user.fullName,
//         email: res.user.email,
//       }

//       get().setAuthUser(user)
//       get().connectSocket()
//     } catch (err) {
//       handleApiError(err)
//       throw err
//     } finally {
//       set({ isRegister: false })
//     }
//   },

//   login: async (data) => {
//     set({ isLogging: true, isCheckingAuth: true })
//     try {
//       const res = await loginUser(data)
//       sessionStorage.setItem("accessToken", res.accessToken)
//       sessionStorage.setItem("refreshToken", res.refreshToken)

//       const apiUser = res.user as {
//         _id?: string
//         id?: string
//         username: string
//         fullName: string
//         email: string
//       }

//       const user: AuthUser = {
//         _id: apiUser._id || apiUser.id || "", // fallback to empty string if missing
//         username: apiUser.username,
//         fullName: apiUser.fullName,
//         email: apiUser.email,
//       }

//       get().setAuthUser(user)
//       get().connectSocket() // now _id exists, socket will connect
//     } catch (err) {
//       handleApiError(err)
//       throw err
//     } finally {
//       set({ isLogging: false, isCheckingAuth: false })
//     }
//   },

//   logOut: async () => {
//     try {
//       const refresh = sessionStorage.getItem("refreshToken")
//       if (refresh) await logOutUser(refresh)
//     } catch (err) {
//       handleApiError(err)
//     } finally {
//       sessionStorage.removeItem("accessToken")
//       sessionStorage.removeItem("refreshToken")
//       sessionStorage.removeItem("authUser")
//       get().disconnectSocket()
//       set({ authUser: null, profile: null })
//     }
//   },

//   fetchProfile: async (): Promise<UserData | null> => {
//     set({ isCheckingAuth: true })
//     try {
//       const res = await getUserProfile()
//       if (!res.success || !res.data?.user) {
//         toast.error("Profile data incomplete")
//         return null
//       }

//       const user: AuthUser = {
//         _id: res.data.user._id,
//         username: res.data.user.username,
//         fullName: res.data.user.fullName,
//         email: res.data.user.email,
//         notifications: res.data.user.notifications,
//       }

//       const profile: ProfileUser = {
//         phone: res.data.phone,
//         bio: res.data.bio,
//         avatar: res.data.avatar ? `${import.meta.env.VITE_API_BASE_URL}${res.data.avatar}` : "",
//         status: res.data.status,
//         createdAt: res.data.createdAt,
//         updatedAt: res.data.updatedAt,
//         friendRequestsSent: res.data.friendRequestsSent || [],
//         friendRequestsReceived: res.data.friendRequestsReceived || [],
//       }

//       set({ profile })
//       get().setAuthUser(user)

//       return { user, profile }
//     } catch (err) {
//       handleApiError(err)
//       return null
//     } finally {
//       set({ isCheckingAuth: false })
//     }
//   },

//   updateProfile: async (formData: FormData): Promise<UserData | null> => {
//     set({ isUpdatingProfile: true })
//     try {
//       const updated: UpdateProfileResponse = await apiUpdateProfile(formData)
//       if (!updated?.data?.user) return null

//       const user: AuthUser = {
//         _id: updated.data.user._id,
//         username: updated.data.user.username,
//         fullName: updated.data.user.fullName,
//         email: updated.data.user.email,
//         notifications: updated.data.user.notifications,
//       }

//       const profile: ProfileUser = {
//         phone: updated.data.phone,
//         bio: updated.data.bio,
//         avatar: updated.data.avatar,
//         status: updated.data.status,
//         createdAt: updated.data.createdAt,
//         updatedAt: updated.data.updatedAt,
//         friendRequestsSent: updated.data.friendRequestsSent || [],
//         friendRequestsReceived: updated.data.friendRequestsReceived || [],
//       }

//       set({ profile })
//       get().setAuthUser(user)
//       return { user, profile }
//     } catch (err) {
//       handleApiError(err)
//       return null
//     } finally {
//       set({ isUpdatingProfile: false })
//     }
//   },

//   fetchAllFriends: async () => {
//     set({ isFetchingFriends: true })
//     try {
//       const res = await getAllFriends()
//       const friends: Friend[] = Array.isArray(res.friends) ? res.friends : []
//       set({ allFriends: friends })
//     } catch (err) {
//       handleApiError(err)
//     } finally {
//       set({ isFetchingFriends: false })
//     }
//   },

//   fetchFriendRequests: async () => {
//     try {
//       // const requests: Friend[] = await getFriendRequests()
//       // set({ friendRequests: Array.isArray(requests) ? requests : [] })
//     } catch (err) {
//       handleApiError(err)
//     }
//   },

//   acceptRequest: async (senderId) => {
//     try {
//       await acceptFriendRequest(senderId)
//       toast.success("Friend request accepted!")
//       await get().fetchFriendRequests()
//       await get().fetchAllFriends()
//     } catch (err) {
//       handleApiError(err)
//     }
//   },

//   rejectRequest: async (senderId) => {
//     try {
//       await rejectFriendRequest(senderId)
//       toast.success("Friend request rejected!")
//       await get().fetchFriendRequests()
//     } catch (err) {
//       handleApiError(err)
//     }
//   },

//   sendFriendRequest: async (receiverId) => {
//     try {
//       const res = await SendFriendRequests(receiverId)
//       toast.success("Friend request sent!")
//       await get().fetchFriendRequests()
//       return res
//     } catch (err) {
//       handleApiError(err)
//       return null
//     }
//   },

//   connectSocket: () => {
//     const { authUser, socketConnected } = get()

//     if (!authUser?._id) {
//       return
//     }

//     if (socketConnected) {
//       return
//     }

//     const socketBaseUrl = import.meta.env.VITE_SOCKET_URL
//     if (!socketBaseUrl) return

//     const socketUrl = `${socketBaseUrl}?userId=${authUser._id}`
//     const socket = new WebSocket(socketUrl)

//     socket.onopen = () => {
//       set({ socketConnected: true, socket })
//       toast.success("✅ WebSocket connected")
//     }

//     socket.onclose = (event) => {
//       set({ socketConnected: false, socket: null })
//       toast("⚠️ WebSocket disconnected")
//     }

//     socket.onerror = (err) => {
//       toast.error("❌ WebSocket connection error")
//     }
//     // socket.on("connect_error", (error) => console.error(error))
//   },

//   disconnectSocket: () => {
//     const socket = get().socket
//     if (socket) {
//       socket.close()
//     }
//     set({ socketConnected: false, socket: null, onlineUsers: [] })
//   },
// }))

import toast from "react-hot-toast"
import { io, type Socket } from "socket.io-client"
import { create } from "zustand"

import { getUserProfile, loginUser, logOutUser, registerUser } from "../api/auth"
import {
  getAllFriends,
  acceptFriendRequest,
  rejectFriendRequest,
  SendFriendRequests,
  type Friend,
} from "../api/friends"
import { updateProfile as apiUpdateProfile, type UpdateProfileResponse } from "../api/profile"
import { handleApiError } from "../utillis/handle-api-error"
import { useChatStore } from "./use_chat_store"

// Types
export type AuthUser = {
  _id: string
  username: string
  fullName: string
  email: string
  notifications?: boolean
  avatar?: string
}

export type ProfileUser = {
  phone: string
  bio: string
  avatar: string
  status: string
  createdAt: string
  updatedAt: string
  friendRequestsSent: string[]
  friendRequestsReceived: string[]
}

export type UserData = {
  user: AuthUser
  profile: ProfileUser
}

type AuthState = {
  authUser: AuthUser | null
  profile: ProfileUser | null
  onlineUsers: string[]
  socketConnected: boolean
  socket: Socket | null

  isRegister: boolean
  isLogging: boolean
  isCheckingAuth: boolean
  isUpdatingProfile: boolean

  allFriends: Friend[] | null
  friendRequests: Friend[] | null
  isFetchingFriends: boolean

  setIsCheckingAuth: (value: boolean) => void
  setAuthUser: (user: AuthUser | null) => void

  register: (data: {
    username: string
    fullName: string
    email: string
    password: string
  }) => Promise<void>
  login: (data: { email: string; password: string }) => Promise<void>
  logOut: () => Promise<void>
  fetchProfile: () => Promise<UserData | null>
  updateProfile: (formData: FormData) => Promise<UserData | null>

  fetchAllFriends: () => Promise<void>
  fetchFriendRequests: () => Promise<void>
  acceptRequest: (senderId: string) => Promise<void>
  rejectRequest: (senderId: string) => Promise<void>
  sendFriendRequest: (receiverId: string) => Promise<void>

  connectSocket: () => void
  disconnectSocket: () => void
}

// Load authUser from sessionStorage
const storedUser = sessionStorage.getItem("authUser")
const initialUser = storedUser ? JSON.parse(storedUser) : null

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: initialUser,
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

  setIsCheckingAuth: (value) => set({ isCheckingAuth: value }),

  setAuthUser: (user) => {
    if (user) sessionStorage.setItem("authUser", JSON.stringify(user))
    else sessionStorage.removeItem("authUser")
    set({ authUser: user })
  },

  register: async (data) => {
    set({ isRegister: true })
    try {
      const res = await registerUser(data)
      sessionStorage.setItem("accessToken", res.accessToken)
      sessionStorage.setItem("refreshToken", res.refreshToken)

      const user: AuthUser = {
        _id: res.user._id,
        username: res.user.username,
        fullName: res.user.fullName,
        email: res.user.email,
      }

      get().setAuthUser(user)
      get().connectSocket()
    } catch (err) {
      handleApiError(err)
      throw err
    } finally {
      set({ isRegister: false })
    }
  },

  login: async (data) => {
    set({ isLogging: true, isCheckingAuth: true })
    try {
      const res = await loginUser(data)
      sessionStorage.setItem("accessToken", res.accessToken)
      sessionStorage.setItem("refreshToken", res.refreshToken)

      const apiUser = res.user as {
        _id?: string
        id?: string
        username: string
        fullName: string
        email: string
      }

      const user: AuthUser = {
        _id: apiUser._id || apiUser.id || "",
        username: apiUser.username,
        fullName: apiUser.fullName,
        email: apiUser.email,
      }

      get().setAuthUser(user)
      get().connectSocket()
    } catch (err) {
      handleApiError(err)
      throw err
    } finally {
      set({ isLogging: false, isCheckingAuth: false })
    }
  },

  logOut: async () => {
    try {
      const refresh = sessionStorage.getItem("refreshToken")
      if (refresh) await logOutUser(refresh)
    } catch (err) {
      handleApiError(err)
    } finally {
      sessionStorage.removeItem("accessToken")
      sessionStorage.removeItem("refreshToken")
      sessionStorage.removeItem("authUser")
      get().disconnectSocket()
      set({ authUser: null, profile: null })
    }
  },

  fetchProfile: async (): Promise<UserData | null> => {
    set({ isCheckingAuth: true })
    try {
      const res = await getUserProfile()
      if (!res.success || !res.data?.user) {
        toast.error("Profile data incomplete")
        return null
      }

      const user: AuthUser = {
        _id: res.data.user._id,
        username: res.data.user.username,
        fullName: res.data.user.fullName,
        email: res.data.user.email,
        notifications: res.data.user.notifications,
      }

      const profile: ProfileUser = {
        phone: res.data.phone,
        bio: res.data.bio,
        avatar: res.data.avatar ? `${import.meta.env.VITE_API_BASE_URL}${res.data.avatar}` : "",
        status: res.data.status,
        createdAt: res.data.createdAt,
        updatedAt: res.data.updatedAt,
        friendRequestsSent: res.data.friendRequestsSent || [],
        friendRequestsReceived: res.data.friendRequestsReceived || [],
      }

      set({ profile })
      get().setAuthUser(user)

      return { user, profile }
    } catch (err) {
      handleApiError(err)
      return null
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  updateProfile: async (formData: FormData): Promise<UserData | null> => {
    set({ isUpdatingProfile: true })
    try {
      const updated: UpdateProfileResponse = await apiUpdateProfile(formData)
      if (!updated?.data?.user) return null

      const user: AuthUser = {
        _id: updated.data.user._id,
        username: updated.data.user.username,
        fullName: updated.data.user.fullName,
        email: updated.data.user.email,
        notifications: updated.data.user.notifications,
      }

      const profile: ProfileUser = {
        phone: updated.data.phone,
        bio: updated.data.bio,
        avatar: updated.data.avatar,
        status: updated.data.status,
        createdAt: updated.data.createdAt,
        updatedAt: updated.data.updatedAt,
        friendRequestsSent: updated.data.friendRequestsSent || [],
        friendRequestsReceived: updated.data.friendRequestsReceived || [],
      }

      set({ profile })
      get().setAuthUser(user)
      return { user, profile }
    } catch (err) {
      handleApiError(err)
      return null
    } finally {
      set({ isUpdatingProfile: false })
    }
  },

  fetchAllFriends: async () => {
    set({ isFetchingFriends: true })
    try {
      const res = await getAllFriends()
      const friends: Friend[] = Array.isArray(res.friends) ? res.friends : []
      set({ allFriends: friends })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isFetchingFriends: false })
    }
  },

  fetchFriendRequests: async () => {
    try {
      // const requests: Friend[] = await getFriendRequests()
      // set({ friendRequests: Array.isArray(requests) ? requests : [] })
    } catch (err) {
      handleApiError(err)
    }
  },

  acceptRequest: async (senderId) => {
    try {
      await acceptFriendRequest(senderId)
      toast.success("Friend request accepted!")
      await get().fetchFriendRequests()
      await get().fetchAllFriends()
    } catch (err) {
      handleApiError(err)
    }
  },

  rejectRequest: async (senderId) => {
    try {
      await rejectFriendRequest(senderId)
      toast.success("Friend request rejected!")
      await get().fetchFriendRequests()
    } catch (err) {
      handleApiError(err)
    }
  },

  sendFriendRequest: async (receiverId) => {
    try {
      const res = await SendFriendRequests(receiverId)
      toast.success("Friend request sent!")
      await get().fetchFriendRequests()
      return res
    } catch (err) {
      handleApiError(err)
      return null
    }
  },

  connectSocket: () => {
    const { authUser, socketConnected, socket } = get()

    if (!authUser?._id) return
    if (socketConnected) return // prevent multiple connections
    if (socket) socket.disconnect() // disconnect previous socket if any

    const socketBaseUrl = import.meta.env.VITE_SOCKET_URL
    if (!socketBaseUrl) return

    const accessToken = sessionStorage.getItem("accessToken")
    if (!accessToken) return

    const newSocket: Socket = io(socketBaseUrl, {
      auth: { token: accessToken, userId: authUser._id },
      transports: ["websocket"],
      autoConnect: true,
    })

    newSocket.on("connect", () => {
      set({ socketConnected: true, socket: newSocket })
      // toast.success("✅ Socket.IO connected")
      // Automatically subscribe if a chat is selected
      const selectedUser = useChatStore.getState().selectedUser
      if (selectedUser) {
        useChatStore.getState().subscribeToMessages()
      }
    })

    newSocket.on("disconnect", (reason) => {
      set({ socketConnected: false, socket: null, onlineUsers: [] })
      useChatStore.setState({ socketSubscribed: false, _socketListener: undefined })

      // toast("⚠️ Socket.IO disconnected")
      // console.log("Socket disconnected:", reason)
    })

    newSocket.on("connect_error", (error) => {
      set({ socketConnected: false, socket: null })
      // toast.error("❌ Socket.IO connection error")
      // console.error("Socket connection error:", error)
    })

    // Example event: update online users
    newSocket.on("onlineUsers", (users: string[]) => {
      set({ onlineUsers: users })
    })
  },

  disconnectSocket: () => {
    const currentSocket = get().socket
    if (currentSocket) {
      currentSocket.disconnect()
    }
    set({ socketConnected: false, socket: null, onlineUsers: [] })
  },
}))
