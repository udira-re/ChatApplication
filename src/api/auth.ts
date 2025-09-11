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
  password: string
  profilePic: string
  createdAt: string
}

// Register user
export const registerUser = async (data: { fullName: string; email: string; password: string }) => {
  await new Promise((r) => setTimeout(r, 500)) // simulate API delay
  const existing = mockUsers.find((u) => u.email === data.email)
  if (existing) throw new Error("Email already registered")

  const newUser: User = {
    id: (mockUsers.length + 1).toString(),
    fullName: data.fullName,
    email: data.email,
    password: data.password,
    profilePic: "/avatar.png",
    createdAt: new Date().toISOString(),
  }

  mockUsers.push(newUser)
  return { ...newUser, password: undefined }
}

// Login user
export const loginUser = async (data: { email: string; password: string }) => {
  await new Promise((r) => setTimeout(r, 500))
  const user = mockUsers.find((u) => u.email === data.email && u.password === data.password)
  if (!user) throw new Error("Invalid credentials")
  return { ...user, password: undefined }
}

// Logout user (mock)
export const logOutUser = async (data: { email: string }) => {
  await new Promise((r) => setTimeout(r, 300))
  return true
}
