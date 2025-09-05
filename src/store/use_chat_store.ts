import { create } from "zustand"

import { getMessagesAPI, getUsersAPI } from "../api/message"
import { handleApiError } from "../utillis/handle-api-error"

export type Message = {
  id: number
  content: string
  senderId: string
  receiverId: string
  timestamp: string
}

export type User = {
  id: string
  name: string
  avatar?: string
}

type MessageState = {
  messages: Message[]
  users: User[]
  selectedUser: User | null
  isUsersLoading: boolean
  isMessagesLoading: boolean
  getUsers: () => Promise<void>
  getMessages: (userId: string) => Promise<void>
  setSelectedUser: (user: User) => void
}

export const UseChatStore = create<MessageState>((set) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Fetch users
  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const data = await getUsersAPI() // async/await
      set({ users: data })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isUsersLoading: false })
    }
  },

  // Fetch messages for a user
  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true })
    try {
      const data = await getMessagesAPI(userId) // async/await
      set({ messages: data })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isMessagesLoading: false })
    }
  },

  setSelectedUser: (user: User) => set({ selectedUser: user }),
}))
