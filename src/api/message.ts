import type { User } from "../store/use_chat_store"

import api from "./api"

// src/api/messages.ts

export type Message = {
  _id: string
  senderId: string
  receiverId: string
  text: string
  createdAt: string
}
const MOCK_USERS: User[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
]

export const sendMessage = async (receiverId: string, text: string) => {
  const token = sessionStorage.getItem("accessToken")
  const res = await api.post(
    `/api/messages`,
    { receiverId, text },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return res.data
}

export const getMessages = async (userId: string): Promise<Message[]> => {
  const token = sessionStorage.getItem("accessToken")
  const res = await api.get(`/api/messages/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data?.data || []
}
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const getUsersAPI = async (): Promise<User[]> => {
  await delay(500)
  return MOCK_USERS
}
