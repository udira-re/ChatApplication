// api/user.ts
import axios from "axios"

import type { AuthUser } from "../store/store"

export type UpdateProfileData = FormData

// Update profile API
// export const updateProfile = async (formData: UpdateProfileData) => {
//   const response = await axios.patch("/api/update/profile", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
//     },
//   })

//   return response.data
// }
export type UpdateProfileResponse = {
  success: boolean
  message: string
  data: {
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

export const updateProfile = async (formData: FormData): Promise<UpdateProfileResponse> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const response = await axios.patch(`${baseUrl}/api/user/profile`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "ngrok-skip-browser-warning": "69420",
      Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    },
  })
  return response.data
}

export const getUserProfile = async () => {
  const response = await axios.get("/api/user/profile", {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "69420",

      Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    },
  })
  return response.data
}
