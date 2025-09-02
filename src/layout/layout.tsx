import { Loader } from "lucide-react"
import { useEffect } from "react"
import { Outlet, useNavigate, useLocation } from "react-router"

import Navbar from "../component/Navbar"
import { useAuthStore } from "../store/store"

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { authUser, isCheckingAuth, setIsCheckingAuth } = useAuthStore()

  useEffect(() => {
    setTimeout(() => {
      setIsCheckingAuth(false)
    }, 1000)
  }, [setIsCheckingAuth])

  useEffect(() => {
    const publicRoutes = ["/login", "/register"]

    if (!isCheckingAuth && !authUser && !publicRoutes.includes(location.pathname)) {
      navigate("/login")
    }
  }, [authUser, isCheckingAuth, location.pathname, navigate])

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden overflow-x-clip">
      <Navbar />
      <div className="flex w-full flex-grow flex-col self-center overflow-y-auto overflow-x-clip px-2 py-4 md:px-5 lg:px-10">
        <Outlet />
      </div>
    </div>
  )
}
