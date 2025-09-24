// api/user.ts
import axios from "axios"

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
export const updateProfile = async (formData: FormData) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const response = await axios.patch(`${baseUrl}/api/update/profile`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    },
  })
  return response.data
}

export const getUserProfile = async () => {
  const response = await axios.get("/api/user/profile", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    },
  })
  return response.data
}
