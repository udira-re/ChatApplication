import { yupResolver } from "@hookform/resolvers/yup"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Link } from "react-router"
import * as yup from "yup"

import Logo from "../assets/logo.jpg"
import InputField from "../component/reuseable/InputFeild"
import { useAuthStore } from "../store/store"
import { handleApiError } from "../utillis/handle-api-error"

// Validation schema
const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    // eslint-disable-next-line no-magic-numbers
    .min(8, "Password must be at least 8 characters"),
})

type LoginFormData = yup.InferType<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLogging } = useAuthStore()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      toast.success("Login successfully!")
    } catch (err) {
      handleApiError(err)
    }
  }
  return (
    <div className="h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-base-200 p-8 rounded-2xl shadow-lg">
        {/* Logo */}
        <div className="text-center">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors overflow-hidden mx-auto">
            <img src={Logo} alt="ChatApp Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-2xl font-bold mt-3">Welcome Back</h1>
          <p className="text-base-content/60 text-sm">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <InputField
            label="Email"
            placeholder="Enter your email"
            icon={<Mail className="size-5 text-base-content/40" />}
            error={errors.email?.message}
            inputProps={register("email")}
          />

          <div className="relative">
            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              icon={<Lock className="size-5 text-base-content/40" />}
              error={errors.password?.message}
              inputProps={{ ...register("password"), autoComplete: "new-password" }}
            />
            <button
              type="button"
              className="absolute  right-3 top-[72%] -translate-y-1/2  flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Eye className="size-5 text-base-content/40" />
              ) : (
                <EyeOff className="size-5 text-base-content/40" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2"
            disabled={isLogging}
          >
            {isLogging ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
        <div className="text-center ">
          <p className="text-base-content/60">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="link link-primary">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
