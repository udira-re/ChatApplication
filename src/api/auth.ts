/* eslint-disable no-console */
// import axios from "axios"

// export const registerUser = async (data: { email: string; password: string }) => {
//   const response = await axios.post("/api/register", data)
//   return response.data
// }
// export const loginUser = async (data: { email: string; password: string }) => {
//   const response = await axios.post("/api/login", data)
//   return response.data
// }

// export const logOutUser = async (data: { email: string; password: string }) => {
//   const response = await axios.post("/api/logout", data)
//   return response.data
// }

// src/api/auth.ts
import { mockUsers } from "../store/mock-users"

type User = {
  id: string
  fullName: string
  email: string
  profilePic: string
  createdAt: string
}

// Helper to generate tokens
const generateTokens = (userId: string) => ({
  accessToken: `mock_access_token_${userId}_${Date.now()}`,
  refreshToken: `mock_refresh_token_${userId}`,
})

// ✅ Register user
export const registerUser = async (data: { fullName: string; email: string; password: string }) => {
  await new Promise((r) => setTimeout(r, 500))

  const existing = mockUsers.find((u) => u.email === data.email)
  if (existing) throw new Error("Email already registered")

  const newUser = {
    id: (mockUsers.length + 1).toString(),
    fullName: data.fullName,
    email: data.email,
    password: data.password,
    profilePic: "/avatar.png",
    createdAt: new Date().toISOString(),
  }

  mockUsers.push(newUser)

  const tokens = generateTokens(newUser.id)

  console.log("[REGISTER] User:", newUser)
  console.log("[REGISTER] Tokens:", tokens)

  return {
    ...tokens,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      createdAt: newUser.createdAt,
    } as User,
  }
}

// ✅ Login user
export const loginUser = async (data: { email: string; password: string }) => {
  await new Promise((r) => setTimeout(r, 500))

  const user = mockUsers.find((u) => u.email === data.email && u.password === data.password)
  if (!user) throw new Error("Invalid credentials")

  const tokens = generateTokens(user.id)

  console.log("[LOGIN] User:", user)
  console.log("[LOGIN] Tokens:", tokens)

  return {
    ...tokens,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    } as User,
  }
}

// ✅ Logout user
export const logOutUser = async (_data: { email: string }) => {
  await new Promise((r) => setTimeout(r, 300))
  console.log("[LOGOUT] User logged out")
  return true
}
