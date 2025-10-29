import toast from "react-hot-toast"
import { type Socket } from "socket.io-client"
import { create } from "zustand"

import api from "../api/api"
import { getAllFriends } from "../api/friends"
import {
  getUsersAPI,
  sendMessage as apiSendMessage,
  type IMessageResponse,
  type IUserInfo,
  type IReceiverInfo,
  type IMessageGetResponse,
} from "../api/message"
import { handleApiError } from "../utillis/handle-api-error"
import { useAuthStore } from "./store"

export type MessageStatus = "sent" | "delivered" | "read" | "failed"

export type Message = {
  _id: string
  text?: string
  sender: string
  receiver: string
  createdAt: string
  fileUrl?: string
  fileName?: string
  status?: MessageStatus
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
  socket: Socket | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _socketListener?: (msg: any) => void

  getUsers: () => Promise<void>
  getMessages: (chatId: string) => Promise<void>
  getFriends: () => Promise<void>
  setSelectedUser: (user: IUserInfo | IReceiverInfo | null) => void
  sendMessage: (payload: { text?: string; file?: File; receiverId?: string }) => Promise<void>
  subscribeToMessages: () => void
  unsubscribeFromMessages: () => void
  connectSocket: () => void
  disconnectSocket: () => void
  addMessage: (message: Message) => void
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

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }))
  },

  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const data = await getUsersAPI()
      const authUserId = useAuthStore.getState().authUser?._id

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted = (data?.response || []).map((chat: any) => {
        const lastMsg = chat.lastMessage
        const otherUser = chat.receiverInfo._id === authUserId ? chat.senderInfo : chat.receiverInfo
        return {
          id: otherUser._id,
          name: otherUser.fullName || otherUser.username,
          avatar: otherUser.avatar,
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

  setSelectedUser: (user) => {
    set({ selectedUser: user, messages: [] })
    if (!user) return

    const _id = "id" in user ? user.id : user._id
    if (!_id) return

    const { socketConnected } = useAuthStore.getState()
    if (!socketConnected) {
      useAuthStore.getState().connectSocket()
    } else {
      get().subscribeToMessages()
    }

    get().getMessages(_id)
  },

  sendMessage: async ({ text, file, receiverId }): Promise<void> => {
    const authUser = useAuthStore.getState().authUser
    const profile = useAuthStore.getState().profile
    const selectedUser = get().selectedUser

    const finalReceiverId =
      receiverId ||
      (selectedUser ? ("id" in selectedUser ? selectedUser.id : selectedUser._id) : undefined)

    if (!authUser || !finalReceiverId) {
      toast.error("No user selected or not authenticated")
      return // <-- just return void, not string
    }

    const tempId = Date.now().toString()
    const tempMessage: Message = {
      _id: tempId,
      sender: authUser._id,
      receiver: finalReceiverId,
      text,
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      createdAt: new Date().toISOString(),
      status: "sent",
      avatar: profile?.avatar,
    }

    set({ messages: [...get().messages, tempMessage] })

    try {
      const msg = await apiSendMessage(finalReceiverId, text, file)
      const newMsg: Message = {
        _id: msg._id,
        sender: msg.sender,
        receiver: msg.receiver,
        text: msg.text,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        createdAt: msg.createdAt,
        status: "delivered",
        avatar: msg.sender === authUser._id ? profile?.avatar : selectedUser?.avatar,
      }

      set({
        messages: get().messages.map((m) => (m._id === tempId ? newMsg : m)),
      })
    } catch (err) {
      set({
        messages: get().messages.map((m) =>
          m._id === tempId ? { ...m, status: "failed" as MessageStatus } : m
        ),
      })
      handleApiError(err)
    }
  },
  getMessages: async (chatId: string) => {
    set({ isMessagesLoading: true })
    try {
      const authUserId = useAuthStore.getState().authUser?._id
      const res = await api.get<IMessageGetResponse>(`/api/messages/${chatId}`)
      const data = res.data

      if (!data || !data.messages?.messages) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messages: Message[] = data.messages.messages.map((m: any) => ({
        _id: m._id,
        sender: m.sender,
        receiver: m.receiver,
        text: m.text,
        fileUrl: m.fileUrl || undefined,
        fileName: m.fileName,
        createdAt: m.createdAt,
        status: "delivered",
        avatar:
          m.sender === authUserId
            ? data.messages.users?.me?.avatar || "/avatar.png"
            : data.messages.users?.other?.avatar || "/avatar.png",
      }))

      set({ messages })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isMessagesLoading: false })
    }
  },

  connectSocket: () => {
    useAuthStore.getState().connectSocket()
  },

  disconnectSocket: () => {
    const { socket } = get()
    if (socket) socket.disconnect()
    set({
      socket: null,
      socketConnected: false,
      socketSubscribed: false,
      _socketListener: undefined,
    })
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket
    if (!socket) return

    const listener = (message: Message) => {
      const active = get().selectedUser
      if (!active) return

      const activeId = "_id" in active ? active._id : active.id
      const exists = get().messages.find((m) => m._id === message._id)
      if (exists) return

      if (message.sender === activeId || message.receiver === activeId) {
        get().addMessage(message)
      }
    }

    socket.off("chat:private")
    socket.on("chat:private", listener)

    set({ unsubscribeFromMessages: () => socket.off("chat:private", listener) })
  },

  unsubscribeFromMessages: () => {},
}))
