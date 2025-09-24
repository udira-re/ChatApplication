import { Loader } from "lucide-react"
import { useEffect } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"

import Navbar from "../component/Navbar"
import { useAuthStore } from "../store/store"
import { UseThemeStore } from "../store/use_theme_store"

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { authUser, isCheckingAuth, setIsCheckingAuth, isLogging } = useAuthStore()
  const { theme } = UseThemeStore()

  // Simulate initial auth check on app load
  useEffect(() => {
    const timer = setTimeout(() => setIsCheckingAuth(false), 500)
    return () => clearTimeout(timer)
  }, [setIsCheckingAuth])

  // Redirect logic for protected routes
  useEffect(() => {
    const publicRoutes = ["/login", "/register"]
    const isPublic = publicRoutes.includes(location.pathname)

    if (!isCheckingAuth && !isLogging && !authUser && !isPublic) {
      navigate("/login", { replace: true })
    }
  }, [authUser, isCheckingAuth, isLogging, location.pathname, navigate])

  // Show loader while checking auth or logging in
  if ((isCheckingAuth || isLogging) && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="flex h-screen w-full flex-col overflow-hidden overflow-x-clip"
      data-theme={theme}
    >
      <Navbar />
      <div className="flex w-full flex-grow flex-col overflow-y-auto overflow-x-clip px-2 py-4 md:px-5 lg:px-10 pt-20">
        <Outlet />
      </div>
    </div>
  )
}
