import toast from "react-hot-toast"
import { create } from "zustand"

import { getAllFriends } from "../api/friends"
import {
  getMessages as apiGetMessages,
  getUsersAPI,
  sendMessage as apiSendMessage,
  type IMessageResponse,
  type IUserInfo,
  type IReceiverInfo,
} from "../api/message"
import { handleApiError } from "../utillis/handle-api-error"
import { useAuthStore } from "./store"

export type MessageStatus = "sent" | "delivered" | "read" | "failed"

export type Message = {
  id: string
  senderId: string
  receiverId: string
  text?: string
  fileUrl?: string
  fileName?: string
  createdAt: string
  status: MessageStatus
  avatar?: string
}

type ChatState = {
  messages: Message[]
  users: IMessageResponse[]
  selectedUser: IUserInfo | IReceiverInfo | null
  isMessagesLoading: boolean
  isUsersLoading: boolean
  socketSubscribed: boolean
  socketConnected: boolean
  socket: WebSocket | null
  _socketListener?: (event: MessageEvent) => void

  getUsers: () => Promise<void>
  getMessages: (chatId: string) => Promise<void>
  getFriends: () => Promise<void>
  setSelectedUser: (user: IUserInfo | IReceiverInfo | null) => void
  sendMessage: (payload: { text?: string; file?: File; receiverId?: string }) => Promise<void>
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
  socket: null,
  _socketListener: undefined,

  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const authUser = useAuthStore.getState().authUser
      const data = await getUsersAPI()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted = (data?.response || []).map((chat: any) => {
        const otherUserId = chat._id.split("_").find((id: string) => id !== authUser?._id) || ""
        const lastMsg = chat.messages?.[chat.messages.length - 1]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const otherUser = chat.users?.find((u: any) => u._id !== authUser?._id)

        return {
          _id: otherUser?._id || otherUserId,
          name: otherUser?.fullName || "Unknown",
          avatar: otherUser?.avatar || "",
          lastMessage: lastMsg?.text || "",
          lastMessageTime: lastMsg?.createdAt || "",
          chatId: chat._id,
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
        _id: f.id,
        name: f.name,
        avatar: f.avatar,
        chatId: "",
      }))
      set({ users: formatted })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isUsersLoading: false })
    }
  },

  setSelectedUser: (user: IUserInfo | IReceiverInfo | null) => {
    const { unsubscribeFromMessages, subscribeToMessages, getMessages, messages } = get()
    unsubscribeFromMessages()

    set({ selectedUser: user, messages: [] })

    if (user) {
      const chatId = messages[0]?.receiverId || "" // fallback if no messages yet
      if (chatId) {
        getMessages(chatId)
        subscribeToMessages()
      }
    }
  },

  sendMessage: async ({
    text,
    file,
    receiverId,
  }: {
    text?: string
    file?: File
    receiverId?: string
  }) => {
    const authUser = useAuthStore.getState().authUser
    const profile = useAuthStore.getState().profile
    const selectedUser = get().selectedUser

    // Use _id from selectedUser (your receiver)
    const finalReceiverId =
      receiverId ||
      (selectedUser ? ("id" in selectedUser ? selectedUser.id : undefined) : undefined)

    if (!authUser || !finalReceiverId) {
      toast.error("No user selected or not authenticated")
      return
    }

    const tempId = Date.now().toString()
    const tempMessage: Message = {
      id: tempId,
      senderId: authUser._id,
      receiverId: finalReceiverId,
      text,
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      createdAt: new Date().toISOString(),
      status: "sent",
      avatar: profile?.avatar,
    }

    set({ messages: [...get().messages, tempMessage] })

    try {
      const res = await apiSendMessage(finalReceiverId, text, file)

      if (!res?.success || !res?.messages) throw new Error("Message not returned from API")

      const msg = res.messages[0]

      const newMsg: Message = {
        id: msg._id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        text: msg.text,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        createdAt: msg.createdAt,
        status: "delivered",
        avatar: profile?.avatar,
      }

      set({
        messages: get().messages.map((m) => (m.id === tempId ? newMsg : m)),
      })
    } catch (err) {
      set({
        messages: get().messages.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)),
      })
      handleApiError(err)
    }
  },
  getMessages: async (chatId: string) => {
    set({ isMessagesLoading: true })
    try {
      const res = await apiGetMessages(chatId)
      const data = res as unknown as IMessageResponse
      const authUserId = useAuthStore.getState().authUser?._id

      const messages: Message[] = (data.messages || []).map((m) => ({
        id: m._id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        text: m.text,
        fileUrl: m.fileUrl,
        fileName: m.fileName,
        createdAt: m.createdAt,
        status: "delivered",
        avatar: m.senderId === authUserId ? data.users.me.avatar : data.users.other.avatar,
      }))

      set({ messages })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isMessagesLoading: false })
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, socketSubscribed } = get()
    const socket = useAuthStore.getState().socket
    if (!selectedUser?._id || !socket || socketSubscribed) return

    const listener = (event: MessageEvent) => {
      try {
        const incoming = JSON.parse(event.data)
        if (incoming.senderId === selectedUser._id) {
          const newMsg: Message = {
            id: incoming._id,
            senderId: incoming.senderId,
            receiverId: incoming.receiverId,
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
    if (socketConnected || !authUser?._id) return

    const socketBaseUrl = import.meta.env.VITE_SOCKET_URL
    if (!socketBaseUrl) return
    // console.error("❌ Missing VITE_SOCKET_URL in .env")

    const socketUrl = `${socketBaseUrl}?userId=${authUser._id}`
    const socket = new WebSocket(socketUrl)

    socket.onopen = () => {
      set({ socketConnected: true, socket })
      toast.success("✅ WebSocket connected")
    }

    socket.onclose = () => {
      set({ socketConnected: false, socket: null })
      toast("⚠️ WebSocket disconnected")
    }

    socket.onerror = (err) => {
      // console.error("❌ WebSocket error:", err)
      toast.error("❌ WebSocket connection error")
    }
  },

  disconnectSocket: () => {
    const socket = useAuthStore.getState().socket
    if (socket) socket.close()
    useAuthStore.setState({ socket: null })
    set({ socketConnected: false, socketSubscribed: false, _socketListener: undefined })
  },
}))
