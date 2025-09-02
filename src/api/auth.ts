import axios from "axios"

export const registerUser = async (data: { email: string; password: string }) => {
  const response = await axios.post("/api/register", data)
  return response.data
}

export const logOutUser = async (data: { email: string; password: string }) => {
  const response = await axios.post("/api/logout", data)
  return response.data
}
