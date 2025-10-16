import toast from "react-hot-toast"
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
export type IMessage = {
  id: string
  sender: string
  receiver: string
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
      const data = await getUsersAPI()

      const authUserId = useAuthStore.getState().authUser?._id

      const formatted = (data?.response || []).map((chat: unknown) => {
        const lastMsg = chat.lastMessage

        // Determine the other user in the chat
        const otherUser =
          chat.receiverInfo._id === authUserId
            ? chat.senderInfo // If current user is the receiver, pick sender
            : chat.receiverInfo // Otherwise pick receiver

        const formattedUser = {
          id: otherUser._id,
          name: otherUser.fullName || otherUser.username,
          avatar: otherUser.avatar,
          lastMessage: lastMsg?.text || "",
          lastMessageTime: lastMsg?.createdAt || "",
          chatId: chat._id,
        }

        return formattedUser
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
    const { subscribeToMessages, getMessages } = get()

    set({ selectedUser: user, messages: [] })
    if (!user) return

    const _id = "id" in user ? user.id : undefined
    if (!_id) return

    if (_id) {
      getMessages(_id)
      subscribeToMessages()
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
      senderId: authUser._id, // correct senderId
      receiverId: finalReceiverId, // correct receiverId
      text,
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      createdAt: new Date().toISOString(),
      status: "sent",
      avatar: profile?.avatar, // your avatar for temp message
    }

    // Add temporary message
    set({ messages: [...get().messages, tempMessage] })

    try {
      const msg = await apiSendMessage(finalReceiverId, text, file) // returns IMessage

      const newMsg: Message = {
        id: msg._id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        text: msg.text,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        createdAt: msg.createdAt,
        status: "delivered",
        // Use correct avatar based on sender
        avatar: msg.senderId === authUser._id ? profile?.avatar : selectedUser?.avatar,
      }
      // console.log(newMsg)

      // Replace temp message with server message
      set({
        messages: get().messages.map((m) => (m.id === tempId ? newMsg : m)),
      })
    } catch (err) {
      // Mark temp message as failed if API call fails
      set({
        messages: get().messages.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)),
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

      const messages: IMessage[] = data.messages.messages.map((m) => ({
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

      // console.log(messages)
      set({ messages })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isMessagesLoading: false })
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, socketSubscribed } = get() // remove 'messages'
    const socket = useAuthStore.getState().socket
    if (!selectedUser || !socket || socketSubscribed) return

    // Get selectedUser ID safely
    const selectedUserId = "id" in selectedUser ? selectedUser.id : selectedUser._id

    const listener = (event: MessageEvent) => {
      try {
        const incoming = JSON.parse(event.data)

        // Only add messages related to this chat
        if (incoming.senderId === selectedUserId || incoming.receiverId === selectedUserId) {
          const newMsg: Message = {
            id: incoming._id,
            senderId: incoming.senderId,
            receiverId: incoming.receiverId,
            text: incoming.text,
            fileUrl: incoming.fileUrl,
            createdAt: incoming.createdAt,
            status: "delivered",
          }

          // Append safely
          get().messages.push(newMsg)
          // Trigger re-render by calling setSelectedUser
          setTimeout(() => get().setSelectedUser(selectedUser), 0)
        }
      } catch (err) {
        handleApiError(err)
      }
    }

    socket.addEventListener("message", listener)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(get() as any)._socketListener = listener
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(get() as any).socketSubscribed = true
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = (get() as any)._socketListener
    if (listener && socket) {
      socket.removeEventListener("message", listener)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(get() as any)._socketListener = undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(get() as any).socketSubscribed = false
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
