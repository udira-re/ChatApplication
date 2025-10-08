import api from "./api"

// Add interceptor to attach token automatically
// api.interceptors.request.use((config) => {
//   const token = sessionStorage.getItem("accessToken")
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// Types
export type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    username: string
    fullName: string
    email: string
  }
}

// ✅ Register
export const registerUser = async (data: { username: string; email: string; password: string }) => {
  const res = await api.post<AuthResponse>("/api/auth/register", data)
  return res.data
}

// ✅ Login
export const loginUser = async (data: { email: string; password: string }) => {
  const res = await api.post<AuthResponse>("/api/auth/login", data)
  return res.data
}

// ✅ Logout
export const logOutUser = async (refreshToken: string) => {
  const res = await api.post("/api/auth/logout", { refreshToken })
  return res.data
}

// ✅ Refresh token
export const refreshToken = async (refreshToken: string) => {
  const res = await api.post<AuthResponse>("/api/auth/refresh", { refreshToken })
  return res.data
}

// ✅ Get user profile
export const getUserProfile = async () => {
  const res = await api.get("/api/user/profile")
  return res.data
}

// ✅ Update user (example if needed)
export const updateUser = async (data: { fullName?: string; profilePic?: string }) => {
  const res = await api.put("/api/user/update", data)
  return res.data
}
