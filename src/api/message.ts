// api/chat.ts

import type { User, Message } from "../store/use_chat_store"

// Mock data (replace with real API calls later)
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
      senderId: "2",
      receiverId: "1",
      timestamp: new Date().toISOString(),
    },
  ],
  "2": [
    {
      id: 2,
      content: "Hey Bob",
      senderId: "1",
      receiverId: "2",
      timestamp: new Date().toISOString(),
    },
  ],
  "3": [],
}

export const getUsersAPI = async (): Promise<User[]> => {
  await new Promise((res) => setTimeout(res, 500)) // simulate network delay
  return MOCK_USERS
}

export const getMessagesAPI = async (userId: string): Promise<Message[]> => {
  await new Promise((res) => setTimeout(res, 500)) // simulate network delay
  return MOCK_MESSAGES[userId] || []
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
