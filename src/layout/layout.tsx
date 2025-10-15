import { Loader } from "lucide-react"
import { useEffect } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"

import { getUserProfile } from "../api/profile"
import Navbar from "../component/Navbar"
import { useAuthStore } from "../store/store"
import { UseThemeStore } from "../store/use_theme_store"
import { handleApiError } from "../utillis/handle-api-error"

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { authUser, isCheckingAuth, setIsCheckingAuth, setAuthUser, logOut } = useAuthStore()
  const { theme } = UseThemeStore()

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem("accessToken")
      const publicRoutes = ["/login", "/register"]
      const isPublic = publicRoutes.includes(location.pathname)

      if (token && !authUser) {
        try {
          const userData = await getUserProfile()

          // Check if API says token is invalid
          // if (!userData.success && userData.message === "Unauthorized token") {
          //   await logOut()
          //   navigate("/login", { replace: true })
          //   return
          // }

          setAuthUser(userData)
          if (isPublic) navigate("/home", { replace: true })
        } catch (err) {
          handleApiError(err)
          await logOut()
          navigate("/login", { replace: true })
        } finally {
          setIsCheckingAuth(false)
        }
      } else if (!token && !isPublic) {
        navigate("/login", { replace: true })
      } else if (token && authUser && isPublic) {
        navigate("/home", { replace: true })
      } else {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [authUser, location.pathname, navigate, setAuthUser, logOut, setIsCheckingAuth])

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-10 h-10 animate-spin" />
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
