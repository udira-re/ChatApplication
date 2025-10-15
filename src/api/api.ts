// src/api/api.ts
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios"

import { useAuthStore } from "../store/store"
import { handleApiError } from "../utillis/handle-api-error"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: new AxiosHeaders({
    "Content-Type": "application/json", // default for JSON requests
    "ngrok-skip-browser-warning": "asd", // automatically for ngrok
  }),
})

// Attach token automatically to all requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem("accessToken")

  // Ensure headers exist
  if (!config.headers) config.headers = new AxiosHeaders()

  // Add Authorization if token exists
  if (token) (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`)

  // If request data is FormData, let Axios set Content-Type automatically
  if (config.data instanceof FormData) {
    ;(config.headers as AxiosHeaders).delete("Content-Type") // remove default JSON type
  }

  return config
})

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const { logOut } = useAuthStore.getState()
        await logOut()
      } catch (e) {
        handleApiError(e)
      }
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default api
