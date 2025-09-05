import { Camera, User } from "lucide-react"
import { useState, type ChangeEvent } from "react"
import toast from "react-hot-toast"

import { useAuthStore } from "../store/store"
import { handleApiError } from "../utillis/handle-api-error"

const Profile = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // }
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = async () => {
      const base64Image = reader.result as string
      setSelectedImage(base64Image)

      try {
        await updateProfile({ profilePic: base64Image })
        toast.success("Profile picture updated successfully!") // ✅ show success toast
      } catch (err) {
        handleApiError(err)
      }
    }

    reader.readAsDataURL(file)
  }

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">{authUser?.fullName || "Profile"}</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Profile picture upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative ">
              <div className="size-32 rounded-full border-4 overflow-hidden flex items-center justify-center bg-gray-200">
                {selectedImage || authUser?.profilePic ? (
                  <img
                    src={selectedImage || authUser?.profilePic}
                    alt="Profile"
                    className="size-32 object-cover"
                  />
                ) : (
                  <span className="text-gray-500 font-semibold">Profile</span>
                )}
              </div>

              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-1 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                  isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                FullName
              </div>
              <p className="px-4 py-4 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Email
              </div>
              <p className="px-4 py-4 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>
          {/* ACCOUNT INFORMATION */}
          <div className="mt-6 p-6 bg-base-300 rounded-xl">
            <div className="text-lg font-medium mb-4">Account Information</div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b  border-zinc-700 py-2">
                <span>Member Since</span>
                <span>{authUser?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
