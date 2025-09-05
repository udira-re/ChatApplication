import axios from "axios"

type UpdateProfileData = {
  profilePic: string
}
export const updateProfile = async (data: UpdateProfileData) => {
  const response = await axios.post("/api/profile", data)
  return response.data
}
