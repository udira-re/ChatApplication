import { create } from "zustand"

import { logOutUser, registerUser } from "../api/auth"
import { updateProfile } from "../api/profile"
type AuthState = {
  authUser: null | {
    id: string
    fullName: string
    profilePic?: string
    email: string
    createdAt?: string
  }
  isRegister: boolean
  isLogging: boolean
  isCheckingAuth: boolean
  isUpdatingProfile: boolean
  setIsCheckingAuth: (value: boolean) => void

  register: (data: { password: string; fullName: string; email: string }) => Promise<void>
  logOut: () => Promise<void>
  login: (data: { email: string; password: string }) => Promise<void>
  updateProfile: (data: { profilePic: string }) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isRegister: false,
  isLogging: false,

  isCheckingAuth: true,
  isUpdatingProfile: false,

  setIsCheckingAuth: (value) => set({ isCheckingAuth: value }),
  //
  register: async (data) => {
    set({ isRegister: true })
    const user = await registerUser(data)
    set({ authUser: user, isRegister: false })
  },
  //
  logOut: async () => {
    const currentUser = get().authUser
    if (!currentUser) return

    set({ isLogging: true })
    try {
      await logOutUser({ email: currentUser.id, password: "" })
      set({ authUser: null })
    } finally {
      set({ isLogging: false })
    }
  },
  //

  login: async () => {},

  updateProfile: async (data: { profilePic: string }) => {
    set({ isUpdatingProfile: true })
    try {
      const updatedUser = await updateProfile(data)

      set((state) => ({
        authUser: state.authUser
          ? { ...state.authUser, profilePic: updatedUser.profilePic }
          : state.authUser,
      }))
    } finally {
      set({ isUpdatingProfile: false })
    }
  },
}))
