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

// Sender info
export type IUserInfo = {
  _id: string
  email: string
  fullName: string
  username: string
  avatar?: string
}

// Receiver info
export type IReceiverInfo = {
  id: string
  email: string
  fullName: string
  username: string
  avatar?: string
}

// Single message type
export type IMessage = {
  _id: string
  senderId: string
  receiverId: string
  text: string
  createdAt: string
  chatId: string
  __v: number
  senderInfo: IUserInfo
  receiverInfo: IReceiverInfo
  fileUrl?: string
  fileName?: string
}

//
//
export type ISendMessageResponse = {
  success: boolean
  message: IMessage
}
//
export type IMessageResponse = {
  success: boolean
  users: {
    me: IUserInfo
    other: IReceiverInfo
  }
  _id: string
  messages: IMessage[]
  lastMessage?: IMessage
}
export type IMessageGetResponse = {
  success: boolean
  messages: {
    // this matches API
    users: {
      me: IUserInfo
      other: IReceiverInfo
    }
    messages: IMessage[]
  }
  _id: string
  lastMessage?: IMessage
}

export const sendMessage = async (
  receiverId: string,
  text?: string,
  file?: File
): Promise<IMessage> => {
  if (!receiverId) throw new Error("receiverId is missing")

  const formData = new FormData()
  formData.append("receiverId", receiverId)
  formData.append("text", text ?? "")

  if (file) {
    formData.append("file", file)
  }

  const res = await api.post<ISendMessageResponse>("/api/messages", formData)

  if (!res.data.success || !res.data.message) {
    throw new Error("Failed to send message")
  }

  return res.data.message
}

export const getMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const res = await api.get<{ data: Message[] }>(`/api/messages/${chatId}`)
    const messages = res.data.data || []

    // Map to Message type (if necessary)
    return messages.map((msg) => ({
      _id: msg._id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      text: msg.text,
      createdAt: msg.createdAt,
      fileUrl: msg.fileUrl,
      fileName: msg.fileName,
    }))
  } catch (err) {
    handleApiError(err)
    return []
  }
}

// types for chats/users list
type ChatAPIResponse = {
  _id: string
  messages: IMessageResponse[]
  lastMessage?: IMessageResponse
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
