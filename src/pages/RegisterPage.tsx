import { yupResolver } from "@hookform/resolvers/yup"
import React from "react"
import { useForm, FormProvider } from "react-hook-form"
import toast from "react-hot-toast"
import { useNavigate, Link } from "react-router-dom"
import * as yup from "yup"

import Logo from "../assets/logo.jpg"
import Button from "../component/reuseable/Button"
import InputField from "../component/reuseable/InputFeild"
import { useAuthStore } from "../store/store"
import { handleApiError } from "../utillis/handle-api-error"

// Yup schema
const schema = yup
  .object({
    username: yup.string().required("User Name is required"),
    fullName: yup.string().required("Full Name is required"),
    email: yup.string().trim().email("Invalid email format").required("Email is required"),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
  })
  .required()

type FormData = yup.InferType<typeof schema>

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register: registerUser, isRegister } = useAuthStore()

  // ✅ useForm and keep the full methods object
  const methods = useForm<FormData>({ resolver: yupResolver(schema) })
  const { reset } = methods

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data)
      toast.success("Account created successfully!")
      reset()
      navigate("/login")
    } catch (err) {
      handleApiError(err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-md bg-base-100 rounded-2xl shadow-xl p-8 space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex flex-col items-center gap-2 group">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors overflow-hidden">
              <img src={Logo} alt="ChatApp Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-2xl font-bold mt-3">Join ChatApp</h1>
            <p className="text-base-content/60 text-sm">Create an account to start chatting</p>
          </div>
        </div>

        {/* Form */}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5">
            <InputField
              required
              type="text"
              label="UserName"
              name="username"
              placeholder="Enter your user name"
            />
            <InputField
              required
              type="text"
              label="Email"
              name="email"
              placeholder="Enter your email"
            />
            <InputField
              required
              type="text"
              label="Full Name"
              name="fullName"
              placeholder="Enter your full name"
            />
            <div className="relative">
              <InputField
                required
                type="password"
                label="Password"
                placeholder="Enter your password"
                name="password"
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" isLoading={isRegister} className="btn-primary">
              Create Account
            </Button>
          </form>
        </FormProvider>

        <p className="text-center text-base text-base-content/60">
          Already have an account?{" "}
          <Link to="/login" className="link link-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
