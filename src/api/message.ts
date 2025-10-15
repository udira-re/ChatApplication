// src/api/messages.ts
import { handleApiError } from "../utillis/handle-api-error"
// eslint-disable-next-line import/order
import api from "./api"

export type Message = {
  _id: string
  senderId: string
  receiverId: string
  text: string
  createdAt: string
  fileUrl?: string
  fileName?: string
  fileType?: string
}

// API response type
export type MessageAPIResponse = {
  _id: string
  sender: string
  receiver: string
  text: string
  createdAt: string
  __v: number
  fileUrl?: string
  fileName?: string
  fileType?: string
}

// Send message dynamically
export const sendMessage = async (receiverId: string, text?: string, file?: File) => {
  if (!receiverId) throw new Error("Receiver ID is required")

  const formData = new FormData()
  formData.append("text", text ?? "")
  if (file instanceof File) formData.append("file", file)
  formData.append("receiverId", receiverId)

  const res = await api.post<{ success: boolean; message: MessageAPIResponse }>(
    "/api/messages",
    formData
  )

  return res.data
}

// Get messages for a specific chat (use chat _id, not static userId)
export const getMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const res = await api.get<{ data: MessageAPIResponse[] }>(`/api/messages/${chatId}`)
    return (res.data.data || []).map((m) => ({
      _id: m._id,
      senderId: m.sender,
      receiverId: m.receiver,
      text: m.text,
      createdAt: m.createdAt,
      fileUrl: m.fileUrl,
      fileName: m.fileName,
      fileType: m.fileType,
    }))
  } catch (err) {
    handleApiError(err)
    return []
  }
}

// types for chats/users list
type ChatAPIResponse = {
  _id: string
  messages: MessageAPIResponse[]
  lastMessage?: MessageAPIResponse
}

type GetUsersResponse = {
  success: boolean
  response: ChatAPIResponse[]
}

// Fetch all users with their last messages
export const getUsersAPI = async (): Promise<GetUsersResponse> => {
  try {
    const res = await api.get<GetUsersResponse>("/api/messages/chats")
    return res.data
  } catch (err) {
    handleApiError(err)
    return { success: false, response: [] }
  }
}
