// /* eslint-disable import/order */
// import { create } from "zustand"

// import { getMessagesAPI, getUsersAPI, sendMessageAPI } from "../api/message"
// import { handleApiError } from "../utillis/handle-api-error"
// import { useAuthStore } from "./store"

// export type Message = {
//   id: number
//   content: string
//   senderId: string
//   receiverId: string
//   timestamp: string
//   createdAt: string
//   image?: string
//   text: string
// }

// export type User = {
//   id: string
//   name: string
//   avatar?: string
//   profilePic?: string
// }

// type ChatState = {
//   messages: Message[]
//   users: User[]
//   selectedUser: User | null
//   isUsersLoading: boolean
//   isMessagesLoading: boolean

//   getUsers: () => Promise<void>
//   getMessages: (userId: string) => Promise<void>
//   setSelectedUser: (user: User | null) => void
//   subscribeToMessages: () => void
//   unsubscribeFromMessages: () => void

//   sendMessage: (messageData: { text?: string; image?: string }) => Promise<void>
// }

// export const useChatStore = create<ChatState>((set, get) => ({
//   messages: [],
//   users: [],
//   selectedUser: null,
//   isUsersLoading: false,
//   isMessagesLoading: false,

//   // Fetch users
//   getUsers: async () => {
//     set({ isUsersLoading: true })
//     try {
//       const data = await getUsersAPI()
//       set({ users: data })
//     } catch (err) {
//       handleApiError(err)
//     } finally {
//       set({ isUsersLoading: false })
//     }
//   },

//   // Fetch messages
//   getMessages: async (userId: string) => {
//     set({ isMessagesLoading: true })
//     try {
//       const data = await getMessagesAPI(userId)
//       set({ messages: data })
//     } catch (err) {
//       handleApiError(err)
//     } finally {
//       set({ isMessagesLoading: false })
//     }
//   },

//   setSelectedUser: (user: User | null) => set({ selectedUser: user }),
//   //
//   sendMessage: async (messageData: { text?: string; image?: string }) => {
//     const { selectedUser, messages } = get()
//     const authUser = useAuthStore.getState().authUser
//     if (!selectedUser || !authUser) return

//     try {
//       // Call API with allowed fields only
//       const newMessage = await sendMessageAPI(selectedUser.id, {
//         text: messageData.text || "",
//         image: messageData.image || "",
//       })

//       // Add new message to store
//       set({ messages: [...messages, newMessage] })
//     } catch (err) {
//       handleApiError(err)
//     }
//   },

//   // Listen to new socket messages
//   subscribeToMessages: () => {
//     const { selectedUser } = get()
//     if (!selectedUser) return

//     // const socket = useAuthStore.getState().socket
//     // if (!socket) return

//     // socket.on("newMessage", (newMessage: Message) => {
//     //   const isMessageFromSelectedUser = newMessage.senderId === selectedUser.id
//     //   if (!isMessageFromSelectedUser) return

//     //   set({
//     //     messages: [...get().messages, newMessage],
//     //   })
//     // })
//   },

//   // Stop listening
//   unsubscribeFromMessages: () => {
//     // const socket = useAuthStore.getState().socket
//     // if (!socket) return
//     // socket.off("newMessage")
//   },
// }))

import { create } from "zustand"

import { getMessagesAPI, getUsersAPI, sendMessageAPI } from "../api/message"
import { handleApiError } from "../utillis/handle-api-error"
import { useAuthStore } from "./store"

export type MessageStatus = "sent" | "delivered" | "read" | "failed"

export type Message = {
  id: number
  content: string
  senderId: string
  receiverId: string
  timestamp: string
  createdAt: string
  image?: string
  text: string
  status: MessageStatus
}

export type User = {
  id: string
  name: string
  avatar?: string
  profilePic?: string
}

type ChatState = {
  messages: Message[]
  users: User[]
  selectedUser: User | null
  isUsersLoading: boolean
  isMessagesLoading: boolean
  socketSubscribed: boolean

  getUsers: () => Promise<void>
  getMessages: (userId: string) => Promise<void>
  setSelectedUser: (user: User | null) => void
  subscribeToMessages: () => void
  unsubscribeFromMessages: () => void
  sendMessage: (messageData: { text?: string; image?: string }) => Promise<void>
  _socketListener?: (event: MessageEvent) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  socketSubscribed: false,

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

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true })
    try {
      const data = await getMessagesAPI(userId)
      set({ messages: data })
    } catch (err) {
      handleApiError(err)
    } finally {
      set({ isMessagesLoading: false })
    }
  },

  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user, messages: [] })
    if (user) {
      get().getMessages(user.id)
      get().subscribeToMessages()
    } else {
      get().unsubscribeFromMessages()
    }
  },

  sendMessage: async (messageData: { text?: string; image?: string }) => {
    const { selectedUser, messages } = get()
    const authUser = useAuthStore.getState().authUser
    if (!selectedUser || !authUser) return

    // 1. Optimistic "sent" message
    const tempMessage: Message = {
      id: Date.now(), // temp ID
      content: messageData.text || "",
      text: messageData.text || "",
      image: messageData.image || "",
      senderId: authUser.id,
      receiverId: selectedUser.id,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: "sent",
    }

    set({ messages: [...messages, tempMessage] })

    try {
      // 2. Send to backend
      const newMessage = await sendMessageAPI(selectedUser.id, {
        text: messageData.text || "",
        image: messageData.image || "",
      })

      // 3. Update with backend response → delivered
      set({
        messages: get().messages.map((msg) =>
          msg.id === tempMessage.id ? { ...newMessage, status: "delivered" } : msg
        ),
      })
    } catch (err) {
      // 4. Mark as failed
      set({
        messages: get().messages.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: "failed" } : msg
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
      const incoming = JSON.parse(event.data)

      // Case 1: new message
      if (incoming.senderId === selectedUser.id && incoming.content) {
        set((state) => {
          if (!state.messages.some((msg) => msg.id === incoming.id)) {
            return {
              messages: [...state.messages, { ...incoming, status: "delivered" }],
            }
          }
          return {}
        })
      }

      // Case 2: read receipt
      if (incoming.type === "read") {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === incoming.messageId ? { ...msg, status: "read" } : msg
          ),
        }))
      }
    }

    socket.addEventListener("message", listener)
    set({ socketSubscribed: true, _socketListener: listener })
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket
    const listener = get()._socketListener
    if (!socket || !listener) return

    socket.removeEventListener("message", listener)
    set({ socketSubscribed: false, _socketListener: undefined })
  },
}))
