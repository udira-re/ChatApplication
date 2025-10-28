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

  // ✅ Send message
  // sendMessage: async ({ text, file, receiverId }) => {
  //   console.log("📤 sendMessage called with:", { text, file, receiverId })

  //   const authUser = useAuthStore.getState().authUser
  //   const profile = useAuthStore.getState().profile
  //   const selectedUser = get().selectedUser
  //   const socket = get().socket

  //   const finalReceiverId =
  //     receiverId ||
  //     (selectedUser ? ("id" in selectedUser ? selectedUser.id : selectedUser._id) : undefined)

  //   if (!authUser || !finalReceiverId) {
  //     toast.error("No user selected or not authenticated")
  //     return
  //   }

  //   const tempId = Date.now().toString()
  //   const tempMessage: Message = {
  //     id: tempId,
  //     senderId: authUser._id,
  //     receiverId: finalReceiverId,
  //     text,
  //     fileUrl: file ? URL.createObjectURL(file) : undefined,
  //     createdAt: new Date().toISOString(),
  //     status: "sent",
  //     avatar: profile?.avatar,
  //   }

  //   // Add temp message to UI
  //   set({ messages: [...get().messages, tempMessage] })
  //   console.log("🕐 Temporary message added:", tempMessage)

  //   try {
  //     const msg = await apiSendMessage(finalReceiverId, text, file)
  //     console.log("✅ Message sent via API:", msg)

  //     const newMsg: Message = {
  //       id: msg._id,
  //       senderId: msg.senderId,
  //       receiverId: msg.receiverId,
  //       text: msg.text,
  //       fileUrl: msg.fileUrl,
  //       fileName: msg.fileName,
  //       createdAt: msg.createdAt,
  //       status: "delivered",
  //       avatar: msg.senderId === authUser._id ? profile?.avatar : selectedUser?.avatar,
  //     }

  //     // Replace temp message
  //     set({ messages: get().messages.map((m) => (m.id === tempId ? newMsg : m)) })

  //     // Emit via socket
  //     if (socket && socket.connected) {
  //       console.log("🚀 Emitting via socket:", newMsg)
  //       socket.emit("chat:private", newMsg)
  //     } else {
  //       console.warn("⚠️ Socket not connected, cannot emit message")
  //     }
  //   } catch (err) {
  //     set({
  //       messages: get().messages.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)),
  //     })
  //     handleApiError(err)
  //   }
  // },
  sendMessage: async ({ text, file, receiverId }) => {
    // console.log("📤 sendMessage called with:", { text, file, receiverId })
    const authUser = useAuthStore.getState().authUser
    const profile = useAuthStore.getState().profile
    const selectedUser = get().selectedUser
    const socket = useAuthStore.getState().socket

    const finalReceiverId =
      receiverId ||
      (selectedUser ? ("id" in selectedUser ? selectedUser.id : selectedUser._id) : undefined)
    if (!authUser || !finalReceiverId) return toast.error("No user selected or not authenticated")

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
    // console.log("🕐 Temporary message added:", tempMessage)

    try {
      const msg = await apiSendMessage(finalReceiverId, text, file)
      // console.log("✅ Message sent via API:", msg)

      const newMsg: Message = {
        id: msg._id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        text: msg.text,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        createdAt: msg.createdAt,
        status: "delivered",
        avatar: msg.senderId === authUser._id ? profile?.avatar : selectedUser?.avatar,
      }

      set({ messages: get().messages.map((m) => (m.id === tempId ? newMsg : m)) })

      if (socket && socket.connected) {
        // console.log("🚀 Emitting via socket:", newMsg)
        socket.emit("chat:private", newMsg)
      } else {
        // console.warn("⚠️ Socket not connected, cannot emit message")
      }
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

  // ✅ Subscribe to real-time messages

  subscribeToMessages: () => {
    // console.log("📌 subscribeToMessages called")
    const authSocket = useAuthStore.getState().socket
    if (!authSocket) {
      // console.warn("❌ No socket available to subscribe")
      return
    }
    if (get().socketSubscribed) {
      // console.log("ℹ️ Already subscribed")
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = (msg: any) => {
      // console.log("📩 Incoming socket message:", msg)
      const selectedUser = get().selectedUser
      if (!selectedUser) return
      //  console.log("⚠️ No selected user, ignoring message")

      const selectedUserId = "id" in selectedUser ? selectedUser.id : selectedUser._id
      if (
        String(msg.senderId) === String(selectedUserId) ||
        String(msg.receiverId) === String(selectedUserId)
      ) {
        // console.log("✅ Adding message to chat:", msg)
        set({ messages: [...get().messages, msg] })
      } else {
        // console.log("⚠️ Message ignored (not for current chat)")
      }
    }

    authSocket.on("chat:private", listener)
    // console.log("🔔 Listener attached to 'chat:private'")
    set({ _socketListener: listener, socketSubscribed: true })
  },

  // ✅ Connect socket
  // connectSocket: () => {
  //   const authUser = useAuthStore.getState().authUser
  //   const { socketConnected } = get()

  //   if (!authUser?._id) {
  //     console.warn("❌ Cannot connect socket: no authUser")
  //     return
  //   }
  //   if (socketConnected) {
  //     console.log("⚡ Socket already connected")
  //     return
  //   }

  //   console.log("🌐 Connecting socket...")
  //   const socket = io(import.meta.env.VITE_SOCKET_URL, {
  //     auth: { token: sessionStorage.getItem("accessToken"), userId: authUser._id },
  //     transports: ["websocket"],
  //   })

  //   socket.on("connect", () => {
  //     console.log("✅ Socket connected:", socket.id)
  //     set({ socketConnected: true, socket })
  //     toast.success("✅ Socket connected")
  //     get().subscribeToMessages()
  //   })

  //   socket.on("disconnect", () => {
  //     console.log("⚠️ Socket disconnected")
  //     set({
  //       socketConnected: false,
  //       socket: null,
  //       socketSubscribed: false,
  //       _socketListener: undefined,
  //     })
  //   })

  //   socket.on("connect_error", (err) => {
  //     console.error("❌ Socket connection error:", err)
  //     toast.error("Socket connection failed")
  //     set({
  //       socketConnected: false,
  //       socket: null,
  //       socketSubscribed: false,
  //       _socketListener: undefined,
  //     })
  //   })
  // },
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

  // ✅ Unsubscribe
  unsubscribeFromMessages: () => {
    // console.log("📌 unsubscribeFromMessages called")
    const authSocket = useAuthStore.getState().socket
    const { _socketListener } = get()
    if (authSocket && _socketListener) {
      authSocket.off("chat:private", _socketListener)
      // console.log("🛑 Listener removed")
    } else {
      // console.log("⚠️ No listener to remove")
    }
    set({ _socketListener: undefined, socketSubscribed: false })
  },
}))
