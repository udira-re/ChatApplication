import { yupResolver } from "@hookform/resolvers/yup"
import { Loader2 } from "lucide-react"
import { FormProvider, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { useNavigate, Link } from "react-router-dom"
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
    .min(8, "Password must be at least 8 characters"),
})

type LoginFormData = yup.InferType<typeof loginSchema>

export default function LoginPage() {
  const { login, isLogging } = useAuthStore()
  const navigate = useNavigate()

  // ✅ Use useForm and keep the full methods object
  const methods = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      toast.success("Login successfully!")
      navigate("/home")
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
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5">
            <InputField required type="text" label="Email" name="email" />

            <div className="relative">
              <InputField
                required
                type="password"
                label="Password"
                name="password"
                autoComplete="current-password"
              />
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
        </FormProvider>

        <div className="text-center">
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
