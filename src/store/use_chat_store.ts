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

// export type Message = {
//   id: string
//   senderId: string
//   receiverId: string
//   text?: string
//   fileUrl?: string
//   fileName?: string
//   createdAt: string
//   status: MessageStatus
//   avatar?: string
// }

export type Message = {
  _id: string
  text: string
  sender: string
  receiver: string
  createdAt: string
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

  // ✅ Get user list
  getUsers: async () => {
    // console.log("🟢 getUsers called")
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
      // console.log("✅ Users loaded:", formatted)
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isUsersLoading: false })
    }
  },

  // ✅ Get friends list
  getFriends: async () => {
    // console.log("🟢 getFriends called")
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
      // console.log("✅ Friends loaded:", formatted)
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isUsersLoading: false })
    }
  },

  // ✅ When selecting a user to chat with
  setSelectedUser: (user) => {
    // console.log("👤 setSelectedUser called with:", user)
    set({ selectedUser: user, messages: [] })
    if (!user) return

    const _id = "id" in user ? user.id : user._id
    if (!_id) {
      // console.log("❌ No user ID found")
      return
    }

    const { socketConnected } = useAuthStore.getState()
    if (!socketConnected) {
      // console.log("⚠️ Socket not connected → connecting first")
      useAuthStore.getState().connectSocket()
    } else {
      // console.log("⚡ Socket already connected → subscribing now")
      get().subscribeToMessages()
    }

    get().getMessages(_id)
  },

  sendMessage: async ({ text, file, receiverId }) => {
    // console.log("📤 sendMessage called with:", { text, file, receiverId })
    const authUser = useAuthStore.getState().authUser
    const profile = useAuthStore.getState().profile
    const selectedUser = get().selectedUser
    // const socket = useAuthStore.getState().socket

    const finalReceiverId =
      receiverId ||
      (selectedUser ? ("id" in selectedUser ? selectedUser.id : selectedUser._id) : undefined)
    if (!authUser || !finalReceiverId) return toast.error("No user selected or not authenticated")

    // console.log(finalReceiverId, "this is the receiver")

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
    // console.log(tempMessage, "this is temp message obj")

    set({ messages: [...get().messages, tempMessage] })
    // console.log("🕐 Temporary message added:", tempMessage)

    try {
      const msg = await apiSendMessage(finalReceiverId, text, file)
      // console.log("✅ Message sent via API:", msg)

      const newMsg: Message = {
        id: msg._id,
        senderId: msg.sender,
        receiverId: msg.receiver,
        text: msg.text,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        createdAt: msg.createdAt,
        status: "delivered",
        avatar: msg.senderId === authUser._id ? profile?.avatar : selectedUser?.avatar,
      }
      // console.log(newMsg, "this is the new message")

      set({ messages: get().messages.map((m) => (m.id === tempId ? newMsg : m)) })
    } catch (err) {
      set({
        messages: get().messages.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)),
      })
      handleApiError(err)
    }
  },
  // ✅ Fetch messages for selected chat
  getMessages: async (chatId: string) => {
    // console.log("🟢 getMessages called for chat:", chatId)
    set({ isMessagesLoading: true })
    try {
      const authUserId = useAuthStore.getState().authUser?._id
      const res = await api.get<IMessageGetResponse>(`/api/messages/${chatId}`)
      const data = res.data

      if (!data || !data.messages?.messages) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messages: Message[] = data.messages.messages.map((m: any) => ({
        id: m._id,
        sender: m.sender,
        receiver: m.receiver,
        text: m.text,
        fileUrl: m.fileUrl || "",
        fileName: m.fileName,
        createdAt: m.createdAt,
        status: "delivered",
        avatar:
          m.sender === authUserId
            ? data.messages.users?.me?.avatar || "/avatar.png"
            : data.messages.users?.other?.avatar || "/avatar.png",
      }))

      // console.log("✅ Messages loaded:", messages)
      set({ messages })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isMessagesLoading: false })
    }
  },

  connectSocket: () => {
    // console.log("🌐 Redirecting to authStore.connectSocket()")
    useAuthStore.getState().connectSocket()
  },
  // ✅ Disconnect socket
  disconnectSocket: () => {
    // console.log("🛑 disconnectSocket called")
    const { socket } = get()
    if (socket) socket.disconnect()
    set({
      socket: null,
      socketConnected: false,
      socketSubscribed: false,
      _socketListener: undefined,
    })
    // console.log("🧹 Socket cleanup done")
  },
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket
    if (!socket) return

    // const listener = (message: Message) => {
    //   console.log("📩 Incoming real-time message:", message)

    //   const active = get().selectedUser
    //   if (!active) {
    //     console.log("⚠️ No active user selected — message ignored")
    //     return
    //   }

    //   const activeId = "_id" in active ? active._id : active.id
    //   console.log("👤 Active user ID:", activeId)
    //   console.log("📨 Message sender:", message.sender)
    //   console.log("📥 Message receiver:", message.receiver)

    //   if (message.sender === activeId || message.receiver === activeId) {
    //     console.log("✅ Message belongs to active chat — adding to store")
    //     get().addMessage(message)
    //   } else {
    //     console.log("🚫 Message not for active chat — ignored")
    //   }
    // }
    const listener = (message: Message) => {
      const active = get().selectedUser
      if (!active) return

      const activeId = "_id" in active ? active._id : active.id

      // ✅ Avoid duplicates
      const exists = get().messages.find((m) => m._id === message._id)
      if (exists) return

      // Only add messages for active chat
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
