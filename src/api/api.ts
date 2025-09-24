// import axios from "axios"

// console.log("API Base:", import.meta.env.VITE_API_BASE_URL) // ✅ put it here

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL,
// })

// export default api
import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
