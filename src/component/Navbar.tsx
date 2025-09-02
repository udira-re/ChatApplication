import { User } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"

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
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 m-2 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors overflow-hidden">
        <img src={Logo} alt="ChatApp Logo" className="w-16 h-16 object-contain" />
      </div>
      <div className="text-xl font-bold">ChatApp</div>

      {authUser && (
        <div className="relative">
          {/* Profile Icon */}
          <button
            className="flex items-center space-x-2"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <User className="w-6 h-6" />
            <span>{authUser.name}</span>
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-base-100 rounded-lg shadow-lg py-2 z-50">
              <button
                className="w-full text-left px-4 py-2 hover:bg-base-200"
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
  )
}

export default Navbar
