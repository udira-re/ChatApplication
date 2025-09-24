import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useAuthStore } from "./store/store"

export default function HomePage() {
  const navigate = useNavigate()
  const { authUser, isCheckingAuth } = useAuthStore()

  useEffect(() => {
    if (!isCheckingAuth) {
      if (!authUser) {
        navigate("/login")
      } else {
        // navigate("/dashboard")
      }
    }
  }, [authUser, isCheckingAuth, navigate])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}
