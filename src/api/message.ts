// api/chat.ts

import type { User, Message } from "../store/use_chat_store"

// Mock users
const MOCK_USERS: User[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
]

// Mock messages
export const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    // Alice's conversation with Bob
    {
      id: 1,
      content: "Hey Alice, how was your weekend?",
      text: "Hey Alice, how was your weekend?",
      senderId: "2", // Bob sent
      receiverId: "1",
      image: "",
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: "delivered",
    },
    {
      id: 2,
      content: "Hi Bob! It was great, went hiking 🌄. How about yours?",
      text: "Hi Bob! It was great, went hiking 🌄. How about yours?",
      senderId: "1", // Alice replied
      receiverId: "2",
      image: "",
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: "read",
    },
    {
      id: 3,
      content: "Nice! Mine was relaxing at home. Watched a movie 🍿.",
      text: "Nice! Mine was relaxing at home. Watched a movie 🍿.",
      senderId: "2",
      receiverId: "1",
      image: "",
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: "delivered",
    },
    {
      id: 4,
      content: "Cool! What movie did you watch?",
      text: "Cool! What movie did you watch?",
      senderId: "1",
      receiverId: "2",
      image: "",
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: "read",
    },
    {
      id: 5,
      content: "Inception! Mind-blowing 😮",
      text: "Inception! Mind-blowing 😮",
      senderId: "2",
      receiverId: "1",
      image: "",
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: "delivered",
    },
  ],

  "3": [
    // Alice's conversation with Charlie
    {
      id: 6,
      content: "Hey Charlie, did you finish the project?",
      text: "Hey Charlie, did you finish the project?",
      senderId: "1", // Alice sent
      receiverId: "3",
      image: "",
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: "sent",
    },
    {
      id: 7,
      content: "Hi Alice! Almost done, just polishing the final details.",
      text: "Hi Alice! Almost done, just polishing the final details.",
      senderId: "3", // Charlie replied
      receiverId: "1",
      image: "",
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: "delivered",
    },
    {
      id: 8,
      content: "Great! Can you send it by tonight?",
      text: "Great! Can you send it by tonight?",
      senderId: "1",
      receiverId: "3",
      image: "",
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: "read",
    },
    {
      id: 9,
      content: "Sure! Also, attaching the chart here 📊",
      text: "Sure! Also, attaching the chart here 📊",
      senderId: "3",
      receiverId: "1",
      image: "/chart.png",
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: "delivered",
    },
    {
      id: 10,
      content: "I hope this chart will be best 📊",
      text: "I hope this chart will be best 📊",
      senderId: "3",
      receiverId: "1",
      image: "/chart.png",
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: "delivered",
    },
  ],

  "2": [], // Bob's conversations will be dynamically updated
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
    status: "sent",
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
