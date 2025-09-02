import { create } from "zustand"

import { logOutUser, registerUser } from "../api/auth"

type AuthState = {
  authUser: null | { id: string; name: string }
  isRegister: boolean
  isLogging: boolean
  isCheckingAuth: boolean
  isUpdatingProfile: boolean
  setIsCheckingAuth: (value: boolean) => void

  register: (data: { email: string; password: string }) => Promise<void>
  logOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isRegister: false,
  isLogging: false,
  isCheckingAuth: true,
  isUpdatingProfile: false,

  setIsCheckingAuth: (value) => set({ isCheckingAuth: value }),

  register: async (data) => {
    set({ isRegister: true })
    const user = await registerUser(data)
    set({ authUser: user, isRegister: false })
  },

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
}))
