// src/store/chatStore.ts
import { create } from "zustand"

import { getAllFriends } from "../api/friends" // <-- import your friends API
import { getMessages, getUsersAPI, sendMessage } from "../api/message"
import { handleApiError } from "../utillis/handle-api-error"
import { useAuthStore } from "./store"

export type MessageStatus = "sent" | "delivered" | "read" | "failed"

export type Message = {
  id: string | number
  senderId: string
  receiverId: string
  text?: string
  createdAt: string
  status: MessageStatus
  avatar?: string
}

export type User = {
  id: string
  name: string
  avatar?: string
}

type ChatState = {
  messages: Message[]
  users: User[]
  selectedUser: User | null
  isMessagesLoading: boolean
  isUsersLoading: boolean // <-- track loading for friends
  socketSubscribed: boolean
  socketConnected: boolean
  _socketListener?: (event: MessageEvent) => void
  getUsers: () => Promise<void>
  getMessages: (userId: string) => Promise<void>
  getFriends: () => Promise<void> // <-- add getFriends
  setSelectedUser: (user: User | null) => void
  sendMessage: (payload: { text?: string; image?: string }) => Promise<void>
  subscribeToMessages: () => void
  unsubscribeFromMessages: () => void
  connectSocket: () => void
  disconnectSocket: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isMessagesLoading: false,
  isUsersLoading: false, // <-- initial loading state
  socketSubscribed: false,
  socketConnected: false,

  // Fetch all messages with selected user
  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true })
    try {
      const data = await getMessages(userId)
      const formatted = data.map((m) => ({
        id: m._id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        text: m.text,
        createdAt: m.createdAt,
        status: "delivered" as MessageStatus,
      }))
      // console.log("📩 Messages fetched:", formatted)
      set({ messages: formatted })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isMessagesLoading: false })
    }
  },

  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const data = await getUsersAPI()
      set({ users: data })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isUsersLoading: false })
    }
  },

  // Fetch all friends
  getFriends: async () => {
    set({ isUsersLoading: true })
    try {
      const data = await getAllFriends() // <-- call API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted = data.map((f: any) => ({
        id: f.id,
        name: f.name,
        avatar: f.avatar,
      }))
      set({ users: formatted })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isUsersLoading: false })
    }
  },

  // Select user
  setSelectedUser: (user: User | null) => {
    const { unsubscribeFromMessages, subscribeToMessages, getMessages } = get()
    unsubscribeFromMessages()
    set({ selectedUser: user, messages: [] })
    if (user) {
      getMessages(user.id)
      subscribeToMessages()
    }
  },

  // Send message (optimistic update)
  sendMessage: async ({ text }: { text?: string; image?: string }) => {
    const { selectedUser, messages } = get()
    const authUser = useAuthStore.getState().authUser
    const profile = useAuthStore.getState().profile

    if (!selectedUser || !authUser) return

    const tempId = Date.now()
    const tempMessage: Message = {
      id: tempId,
      senderId: authUser.id,
      receiverId: selectedUser.id,
      text,
      createdAt: new Date().toISOString(),
      status: "sent",
      avatar: profile?.avatar,
    }

    set({ messages: [...messages, tempMessage] })

    try {
      const res = await sendMessage(selectedUser.id, text || "")
      const newMsg: Message = {
        id: res.data._id,
        senderId: res.data.senderId,
        receiverId: res.data.receiverId,
        text: res.data.text,
        createdAt: res.data.createdAt,
        status: "delivered",
        avatar: profile?.avatar,
      }

      set({
        messages: get().messages.map((msg) => (msg.id === tempId ? newMsg : msg)),
      })
    } catch (err) {
      set({
        messages: get().messages.map((msg) =>
          msg.id === tempId ? { ...msg, status: "failed" } : msg
        ),
      })
      handleApiError(err)
    }
  },

  // Socket functions remain unchanged
  subscribeToMessages: () => {
    const { selectedUser, socketSubscribed } = get()
    const socket = useAuthStore.getState().socket
    if (!selectedUser || !socket || socketSubscribed) return

    const listener = (event: MessageEvent) => {
      try {
        const incoming = JSON.parse(event.data)
        if (incoming.senderId === selectedUser.id) {
          const newMsg: Message = {
            id: incoming._id,
            senderId: incoming.senderId,
            receiverId: incoming.receiverId,
            text: incoming.text,
            createdAt: incoming.createdAt,
            status: "delivered",
          }
          // console.log("📥 Incoming message:", newMsg)
          set({ messages: [...get().messages, newMsg] })
        }
      } catch (err) {
        handleApiError(err)
        // console.error("❌ Invalid socket message:", err)
      }
    }

    socket.addEventListener("message", listener)
    set({ socketSubscribed: true, _socketListener: listener })
    // console.log("🟢 Subscribed to socket messages")
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket
    const listener = get()._socketListener
    if (socket && listener) socket.removeEventListener("message", listener)
    set({ socketSubscribed: false, _socketListener: undefined })
    // console.log("🔴 Unsubscribed from socket messages")
  },

  connectSocket: () => {
    const { socketConnected } = get()
    const authUser = useAuthStore.getState().authUser
    if (socketConnected || !authUser) return

    try {
      const socketUrl = `${import.meta.env.VITE_SOCKET_URL}?userId=${authUser.id}`
      const socket = new WebSocket(socketUrl)

      socket.onopen = () => {
        useAuthStore.setState({ socket })
        set({ socketConnected: true })
        // console.log("✅ WebSocket connected:", socketUrl)
      }

      socket.onclose = () => {
        useAuthStore.setState({ socket: null })
        set({ socketConnected: false, socketSubscribed: false })
        // console.log("🔴 WebSocket disconnected")
      }

      socket.onerror = (err) => {
        // console.error("⚠️ WebSocket error:", err)
      }
    } catch (err) {
      handleApiError(err)
      // console.error("❌ Failed to connect WebSocket:", err)
    }
  },

  disconnectSocket: () => {
    const socket = useAuthStore.getState().socket
    if (socket) {
      socket.close()
      useAuthStore.setState({ socket: null })
    }
    set({
      socketConnected: false,
      socketSubscribed: false,
      _socketListener: undefined,
    })
    // console.log("🔌 Socket connection closed")
  },
}))
