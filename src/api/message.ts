// api/chat.ts

import type { User, Message } from "../store/use_chat_store"

const MOCK_USERS: User[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
]

const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    {
      id: 1,
      content: "Hello Alice",
      text: "Hello Alice",
      senderId: "2",
      receiverId: "1",
      image: "",
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    },
  ],
  "2": [
    {
      id: 2,
      content: "Hey Bob",
      text: "Hey Bob",
      senderId: "1",
      receiverId: "2",
      image: "",
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    },
  ],
  "3": [],
}

// Simulate network delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const getUsersAPI = async (): Promise<User[]> => {
  await delay(500)
  return MOCK_USERS
}

export const getMessagesAPI = async (userId: string): Promise<Message[]> => {
  await delay(500)
  return MOCK_MESSAGES[userId] || []
}

// Simulate sending a message
export const sendMessageAPI = async (
  receiverId: string,
  messageData: { text?: string; image?: string | null }
): Promise<Message> => {
  await delay(500)

  const newMessage: Message = {
    id: Date.now(), // unique ID
    content: messageData.text || "",
    text: messageData.text || "",
    senderId: "currentUserId", // replace with actual current user ID if needed
    receiverId,
    image: messageData.image || "",
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  }

  if (!MOCK_MESSAGES[receiverId]) MOCK_MESSAGES[receiverId] = []
  MOCK_MESSAGES[receiverId].push(newMessage)

  return newMessage
}

// export const getUsersAPI = async (): Promise<User[]> => {
//   const response = await axios.get("/api/users") // replace with your real endpoint
//   return response.data
// }
//
// export const getMessagesAPI = async (userId: string): Promise<Message[]> => {
//   const response = await axios.get(`/api/messages?userId=${userId}`) // replace with your real endpoint
//   return response.data
// }
// export const sendMessageAPI = async (userId: string): Promise<Message[]> => {
//   const response = await axios.get(`/api/messages/send/${selectedUser.id}`) // replace with your real endpoint
//   return response.data
// }
