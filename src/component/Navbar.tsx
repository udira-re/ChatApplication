import { Settings, User } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { Link } from "react-router"

import Logo from "../assets/logo.jpg"
import { useAuthStore } from "../store/store"

const Navbar = () => {
  const { authUser, isLogging, logOut } = useAuthStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleLogout = async () => {
    if (!authUser) return
    try {
      await logOut()
      toast.success("Logged out successfully!")
    } catch (err) {
      toast.error((err as Error).message || "Failed to log out")
    }
  }

  return (
    <header className="border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + App Name */}
        <Link to="/home" className="flex items-center gap-3 hover:opacity-80 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center transition-colors overflow-hidden group-hover:bg-primary/20">
            <img src={Logo} alt="ChatApp Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-xl font-bold">ChatApp</h1>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Settings Button */}
          <Link to="/settings" className="btn btn-sm gap-2 transition-colors">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          {/* Profile Dropdown */}
          {authUser && (
            <div className="relative">
              <button
                className="flex items-center space-x-2 hover:opacity-80 transition"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <User className="w-6 h-6" />
                <span>{authUser.fullName}</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-base-100 rounded-lg shadow-lg py-2 z-50 flex flex-col">
                  <Link
                    to="/profile"
                    className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>

                  <button
                    className="w-full text-left px-4 py-2 hover:bg-base-200 mt-1"
                    onClick={handleLogout}
                    disabled={isLogging}
                  >
                    {isLogging ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
