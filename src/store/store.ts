// import { create } from "zustand"

// import { loginUser, logOutUser, registerUser } from "../api/auth"
// import { updateProfile } from "../api/profile"
// type AuthState = {
//   authUser: null | {
//     id: string
//     fullName: string
//     profilePic: string
//     email: string
//     createdAt?: string
//   }
//   onlineUsers: string[]

//   isRegister: boolean
//   isLogging: boolean
//   isCheckingAuth: boolean
//   isUpdatingProfile: boolean
//   setIsCheckingAuth: (value: boolean) => void

//   register: (data: { password: string; fullName: string; email: string }) => Promise<void>
//   logOut: () => Promise<void>
//   login: (data: { email: string; password: string }) => Promise<void>
//   updateProfile: (data: { profilePic: string }) => Promise<void>
// }

// export const useAuthStore = create<AuthState>((set, get) => ({
//   authUser: null,
//   isRegister: false,
//   isLogging: false,

//   isCheckingAuth: true,
//   isUpdatingProfile: false,
//   onlineUsers: [],
//   socket: null,

//   setIsCheckingAuth: (value) => set({ isCheckingAuth: value }),
//   //
//   register: async (data) => {
//     set({ isRegister: true })
//     const user = await registerUser(data)
//     set({ authUser: user, isRegister: false })
//   },
//   //
//   logOut: async () => {
//     const currentUser = get().authUser
//     if (!currentUser) return

//     set({ isLogging: true })
//     try {
//       await logOutUser({ email: currentUser.id, password: "" })
//       set({ authUser: null })
//     } finally {
//       set({ isLogging: false })
//     }
//   },
//   //

//   login: async (data) => {
//     set({ isLogging: true })
//     try {
//       const user = await loginUser(data)
//       set({ authUser: user })
//       get.connectSocket()
//     } finally {
//       set({ isLogging: false })
//     }
//   },
//   updateProfile: async (data: { profilePic: string }) => {
//     set({ isUpdatingProfile: true })
//     try {
//       const updatedUser = await updateProfile(data)

//       set((state) => ({
//         authUser: state.authUser
//           ? { ...state.authUser, profilePic: updatedUser.profilePic }
//           : state.authUser,
//       }))
//     } finally {
//       set({ isUpdatingProfile: false })
//     }
//   },
//   connectSocket: () => {},
// }))

// src/store/store.ts

import { create } from "zustand"

import { loginUser, logOutUser, registerUser } from "../api/auth"

type AuthUser = {
  id: string
  fullName: string
  email: string
  profilePic: string
  createdAt?: string
}

type AuthState = {
  authUser: AuthUser | null
  onlineUsers: string[]
  socketConnected: boolean
  socketInterval: number | null

  isRegister: boolean
  isLogging: boolean
  isCheckingAuth: boolean
  isUpdatingProfile: boolean
  setIsCheckingAuth: (value: boolean) => void // ✅ implemented

  register: (data: { fullName: string; email: string; password: string }) => Promise<void>
  login: (data: { email: string; password: string }) => Promise<void>
  logOut: () => Promise<void>
  updateProfile: (data: { profilePic: string }) => Promise<void>
  connectSocket: () => void
  disconnectSocket: () => void
  socket: WebSocket | null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  onlineUsers: [],
  socketConnected: false,
  socketInterval: null,

  isRegister: false,
  isLogging: false,
  isCheckingAuth: true,
  isUpdatingProfile: false,

  setIsCheckingAuth: (value: boolean) => set({ isCheckingAuth: value }),
  socket: null,
  register: async (data) => {
    set({ isRegister: true })
    try {
      const user = await registerUser(data)
      set({ authUser: user })
      get().connectSocket()
    } finally {
      set({ isRegister: false })
    }
  },

  login: async (data) => {
    set({ isLogging: true })
    try {
      const user = await loginUser(data)
      set({ authUser: user })
      get().connectSocket()
    } finally {
      set({ isLogging: false })
    }
  },

  logOut: async () => {
    const user = get().authUser
    if (!user) return
    try {
      await logOutUser({ email: user.email })
    } finally {
      get().disconnectSocket()
      set({ authUser: null })
    }
  },

  updateProfile: async (data: { profilePic: string }) => {
    set({ isUpdatingProfile: true })
    try {
      set((state) => ({
        authUser: state.authUser ? { ...state.authUser, profilePic: data.profilePic } : null,
      }))
    } finally {
      set({ isUpdatingProfile: false })
    }
  },

  connectSocket: () => {
    // console.log("🔌 Mock socket connected")
    set({ socketConnected: true })

    const mockUsers = ["Alice", "Bob", "Charlie", "Daisy", "Eve"]
    let i = 0

    const interval = window.setInterval(() => {
      set({ onlineUsers: mockUsers.slice(0, (i % mockUsers.length) + 1) })
      i++
    }, 3000)

    set({ socketInterval: interval })
  },

  disconnectSocket: () => {
    // console.log("❌ Mock socket disconnected")
    const { socketInterval } = get()
    if (socketInterval) clearInterval(socketInterval)
    set({ socketConnected: false, onlineUsers: [], socketInterval: null })
  },
}))
