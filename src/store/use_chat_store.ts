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
// eslint-disable-next-line import/order
import { useAuthStore } from "./store"

export type Message = {
  id: number
  content: string
  senderId: string
  receiverId: string
  timestamp: string
  createdAt: string
  image?: string
  text: string
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

  getUsers: () => Promise<void>
  getMessages: (userId: string) => Promise<void>
  setSelectedUser: (user: User | null) => void
  subscribeToMessages: () => void
  unsubscribeFromMessages: () => void
  sendMessage: (messageData: { text?: string; image?: string }) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Fetch users
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

  // Fetch messages for a selected user
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
    set({ selectedUser: user, messages: [] }) // clear previous messages
    if (user) {
      get().getMessages(user.id) // fetch messages immediately
    }
  },

  sendMessage: async (messageData: { text?: string; image?: string }) => {
    const { selectedUser, messages } = get()
    const authUser = useAuthStore.getState().authUser
    if (!selectedUser || !authUser) return

    try {
      const newMessage = await sendMessageAPI(selectedUser.id, {
        text: messageData.text || "",
        image: messageData.image || "",
      })
      set({ messages: [...messages, newMessage] })
    } catch (err) {
      handleApiError(err)
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get()
    if (!selectedUser) return
    // Add your socket subscription here
  },

  unsubscribeFromMessages: () => {
    // Add your socket unsubscribe logic here
  },
}))
