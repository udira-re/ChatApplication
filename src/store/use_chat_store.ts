import { create } from "zustand"

import { getAllFriends } from "../api/friends"
import {
  getMessages as apiGetMessages,
  getUsersAPI,
  sendMessage as apiSendMessage,
} from "../api/message"
import { handleApiError } from "../utillis/handle-api-error"
// eslint-disable-next-line import/order
import { useAuthStore } from "./store"

export type MessageStatus = "sent" | "delivered" | "read" | "failed"

export type Message = {
  id: string
  senderId: string
  receiverId: string
  text?: string
  fileUrl?: string
  createdAt: string
  status: MessageStatus
  avatar?: string
}

export type User = {
  id: string // the other user's ID
  name: string
  avatar?: string
  lastMessage?: string
  lastMessageTime?: string
  chatId: string // store chat _id from API
}

type ChatState = {
  messages: Message[]
  users: User[]
  selectedUser: User | null
  isMessagesLoading: boolean
  isUsersLoading: boolean
  socketSubscribed: boolean
  socketConnected: boolean
  _socketListener?: (event: MessageEvent) => void
  getUsers: () => Promise<void>
  getMessages: (chatId: string) => Promise<void>
  getFriends: () => Promise<void>
  setSelectedUser: (user: User | null) => void
  sendMessage: (payload: { text?: string; file?: File }) => Promise<void>
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
  isUsersLoading: false,
  socketSubscribed: false,
  socketConnected: false,

  // Fetch messages using chatId
  getMessages: async (chatId: string) => {
    set({ isMessagesLoading: true })
    try {
      const data = await apiGetMessages(chatId) // uses the chatId

      const formatted = data.map((m) => ({
        id: m._id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        text: m.text,
        fileUrl: m.fileUrl,
        fileName: m.fileName,
        fileType: m.fileType,
        createdAt: m.createdAt,
        status: "delivered" as MessageStatus,
      }))

      set({ messages: formatted })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isMessagesLoading: false })
    }
  },
  // Fetch users and store chatId
  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const authUser = useAuthStore.getState().authUser
      const profile = useAuthStore.getState().profile

      const data = await getUsersAPI() // fetch chat list

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted = data?.response.map((chat: any) => {
        // Extract other user's id
        const otherUserId =
          chat._id.split("_").find((id: string | undefined) => id !== authUser?._id) || ""

        return {
          id: otherUserId,
          name: authUser?.fullName, // replace with real name if available
          avatar: profile?.avatar || "", // avatar from profile
          lastMessage: chat.lastMessage?.text || "",
          lastMessageTime: chat.lastMessage?.createdAt || "",
          chatId: chat._id, // use chat _id here
        }
      })

      set({ users: formatted })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isUsersLoading: false })
    }
  },
  getFriends: async () => {
    set({ isUsersLoading: true })
    try {
      const res = await getAllFriends()
      const friendsArray = Array.isArray(res?.data) ? res.data : res.data ? [res.data] : []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted = friendsArray.map((f: any) => ({
        id: f.id,
        name: f.name,
        avatar: f.avatar,
        chatId: "", // optional if not from chats
      }))
      set({ users: formatted })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isUsersLoading: false })
    }
  },

  setSelectedUser: (user: User | null) => {
    const { unsubscribeFromMessages, subscribeToMessages, getMessages } = get()
    unsubscribeFromMessages()
    set({ selectedUser: user, messages: [] })
    if (user) {
      getMessages(user.chatId) // <-- use chatId here
      subscribeToMessages()
    }
  },
  sendMessage: async ({ text, file }) => {
    const { messages, selectedUser } = get()
    const authUser = useAuthStore.getState().authUser
    const profile = useAuthStore.getState().profile
    if (!authUser || !selectedUser) return

    const tempId = Date.now().toString()
    const tempMessage: Message = {
      id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser.id,
      text,
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      createdAt: new Date().toISOString(),
      status: "sent",
      avatar: profile?.avatar,
    }
    set({ messages: [...messages, tempMessage] })

    try {
      const res = await apiSendMessage(selectedUser.id, text, file)
      const newMsg: Message = {
        id: res.message._id,
        senderId: authUser._id,
        receiverId: res.message.receiver,
        text: res.message.text,
        fileUrl: res.message.fileUrl,
        createdAt: res.message.createdAt,
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

  subscribeToMessages: () => {
    const { selectedUser, socketSubscribed } = get()
    const socket = useAuthStore.getState().socket
    if (!selectedUser || !socket || socketSubscribed) return

    const listener = (event: MessageEvent) => {
      try {
        const incoming = JSON.parse(event.data)
        if (incoming.sender === selectedUser.id) {
          const newMsg: Message = {
            id: incoming._id,
            senderId: incoming.sender,
            receiverId: incoming.receiver,
            text: incoming.text,
            fileUrl: incoming.fileUrl,
            createdAt: incoming.createdAt,
            status: "delivered",
          }
          set({ messages: [...get().messages, newMsg] })
        }
      } catch (err) {
        handleApiError(err)
      }
    }
    socket.addEventListener("message", listener)
    set({ socketSubscribed: true, _socketListener: listener })
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket
    const listener = get()._socketListener
    if (socket && listener) socket.removeEventListener("message", listener)
    set({ socketSubscribed: false, _socketListener: undefined })
  },

  connectSocket: () => {
    const { socketConnected } = get()
    const authUser = useAuthStore.getState().authUser
    if (socketConnected || !authUser) return
    try {
      const socketUrl = `${import.meta.env.VITE_SOCKET_URL}?userId=${authUser._id}`
      const socket = new WebSocket(socketUrl)
      socket.onopen = () => {
        useAuthStore.setState({ socket })
        set({ socketConnected: true })
      }
      socket.onclose = () => {
        useAuthStore.setState({ socket: null })
        set({ socketConnected: false, socketSubscribed: false })
      }
      // eslint-disable-next-line no-console
      socket.onerror = (err) => console.error("Socket error:", err)
    } catch (err) {
      handleApiError(err)
    }
  },

  disconnectSocket: () => {
    const socket = useAuthStore.getState().socket
    if (socket) socket.close()
    useAuthStore.setState({ socket: null })
    set({ socketConnected: false, socketSubscribed: false, _socketListener: undefined })
  },
}))
