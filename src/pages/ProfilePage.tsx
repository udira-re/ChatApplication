import { yupResolver } from "@hookform/resolvers/yup"
import { Camera, MessageSquare } from "lucide-react"
import { useState, useEffect } from "react"
import { useForm, FormProvider, type SubmitHandler } from "react-hook-form"
import toast from "react-hot-toast"
import * as yup from "yup"

import InputField from "../component/reuseable/InputFeild"
import { useAuthStore } from "../store/store"
import { handleApiError } from "../utillis/handle-api-error"

type ProfileFormValues = {
  username: string
  fullName: string
  email: string
  phone: string
  bio: string
  notifications: boolean
  avatar?: File | null
}

// Yup schema
const schema = yup
  .object({
    username: yup.string().required("Username is required").min(3),
    fullName: yup
      .string()
      .required("Full name is required")
      .matches(/^[a-zA-Z\s]+$/, "Full name must contain only letters and spaces"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup
      .string()
      .required("Phone number is required")
      .matches(/^\d{10}$/, "Phone must be 10 digits"),
    bio: yup.string().required("Bio is required").max(200, "Max 200 characters"),
    notifications: yup.boolean().required(),
    avatar: yup
      .mixed<File>()
      .nullable()
      .test(
        "fileSize",
        "File size is too large",
        (value) => !value || value.size <= 2 * 1024 * 1024
      )
      .test(
        "fileType",
        "Unsupported file format",
        (value) => !value || ["image/jpeg", "image/png", "image/webp"].includes(value.type)
      ),
  })
  .required()

const Profile: React.FC = () => {
  const { authUser, profile, fetchProfile, updateProfile, isUpdatingProfile } = useAuthStore()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [refetchTrigger] = useState(false)

  const methods = useForm<ProfileFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      phone: "",
      bio: "",
      notifications: true,
      avatar: null,
    },
  })

  const { handleSubmit, reset, formState, register, setValue } = methods
  const { errors, isDirty } = formState

  // Fetch profile on mount or after update
  useEffect(() => {
    fetchProfile()
      .then((data) => {
        if (!data?.user) return

        reset({
          username: data.user.username,
          fullName: data.user.fullName,
          email: data.user.email,
          phone: data.phone,
          bio: data.bio,
          notifications: data.notifications ?? true,
          avatar: null,
        })

        // eslint-disable-next-line promise/always-return
        setPreviewImage(data.avatar || null)
      })
      .catch((err) => handleApiError(err))
  }, [reset, refetchTrigger, fetchProfile])

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewImage(URL.createObjectURL(file))
    setValue("avatar", file, { shouldDirty: true })
  }

  // Handle form submit
  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    try {
      const formData = new FormData()
      formData.append("username", data.username)
      formData.append("fullName", data.fullName)
      formData.append("email", data.email)
      formData.append("phone", data.phone)
      formData.append("bio", data.bio)
      formData.append("notifications", data.notifications ? "true" : "false")
      if (data.avatar) formData.append("avatar", data.avatar)

      const updatedProfile = await updateProfile(formData)
      // console.log("Update profile response:", updatedProfile)

      if (updatedProfile) {
        toast.success("Profile updated successfully!")

        // Reset form with updated values
        reset({
          username: updatedProfile.user.username,
          fullName: updatedProfile.user.fullName,
          email: updatedProfile.user.email,
          phone: updatedProfile.phone,
          bio: updatedProfile.bio,
          notifications: updatedProfile.notifications ?? true,
          avatar: null,
        })

        // Set preview image using updated avatar URL
        setPreviewImage(updatedProfile.avatar || previewImage)
      }
    } catch (err) {
      handleApiError(err)
    }
  }

  return (
    <div className="h-screen pt-20 bg-base-200 overflow-auto">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-base-300 rounded-xl p-6 space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold">{authUser?.username ?? "Profile"}</h1>
              <p className="mt-2 text-gray-500">Your profile information</p>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 overflow-hidden flex items-center justify-center bg-gray-200">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-32 h-32 object-cover" />
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
                    onChange={handleImageChange}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>
              {errors.avatar && <p className="text-red-500 text-xs">{errors.avatar.message}</p>}
              <p className="text-sm text-gray-400">
                {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <InputField required type="text" label="Username" name="username" />
              <InputField required type="text" label="Full Name" name="fullName" />
              <InputField required type="text" label="Email" name="email" />
              <InputField required type="text" label="Phone" name="phone" />

              {/* Bio */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Bio
                  </span>
                </label>
                <textarea
                  {...register("bio")}
                  className="textarea textarea-bordered w-full resize-none"
                  rows={4}
                  placeholder="Write something about yourself"
                />
                {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
              </div>

              {/* Notifications */}
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register("notifications")} className="w-4 h-4" />
                <label className="text-sm text-gray-400">Notify me for friend requests</label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={isUpdatingProfile || !isDirty}
                className={`px-6 py-2 rounded-lg text-white transition ${
                  isDirty ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {/* Account Info */}
            <div className="mt-6 p-6 bg-base-300 rounded-xl">
              <div className="text-lg font-medium mb-4">Account Information</div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-gray-300 py-2">
                  <span>Member Since</span>
                  <span>{profile?.createdAt?.split("T")[0]}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Account Status</span>
                  <span className="text-green-500">{profile?.status || "Active"}</span>
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default Profile
