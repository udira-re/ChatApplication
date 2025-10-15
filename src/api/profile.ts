// api/user.ts

import type { AuthUser } from "../store/store"

import api from "./api"

export type UpdateProfileData = FormData

// }
export type UpdateProfileResponse = {
  success: boolean
  message: string
  data: {
    profile: AuthUser
    _id: string
    phone: string
    bio: string
    avatar: string
    notifications: boolean
    status: string
    createdAt: string
    updatedAt: string
    friendRequestsSent: string[]
    friendRequestsReceived: string[]
    user: AuthUser
  }
}

// ✅ Update user profile with FormData
export const updateProfile = async (formData: FormData): Promise<UpdateProfileResponse> => {
  const response = await api.patch<UpdateProfileResponse>("/api/user/profile", formData)
  return response.data
}

// ✅ Get user profile
export const getUserProfile = async () => {
  const response = await api.get("/api/user/profile")
  return response.data
}
