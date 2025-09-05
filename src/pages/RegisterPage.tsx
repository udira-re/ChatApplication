import { yupResolver } from "@hookform/resolvers/yup"
import { Mail, User, Lock, EyeOff, Eye } from "lucide-react"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Link } from "react-router"
import * as yup from "yup"

import Logo from "../assets/logo.jpg"
import Button from "../component/reuseable/Button"
import InputField from "../component/reuseable/InputFeild"
import { useAuthStore } from "../store/store"
import { handleApiError } from "../utillis/handle-api-error"

// Yup schema
const schema = yup
  .object({
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
  const [showPassword, setShowPassword] = useState(false)
  const { register: registerUser, isRegister } = useAuthStore()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) })
  //
  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data)
      toast.success("Account created successfully!")
    } catch (err) {
      handleApiError(err)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-md bg-base-100 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="flex flex-col items-center gap-2 group">
            {/* <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <MessageSquare className="size-7 text-primary" />
            </div> */}
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors overflow-hidden">
              <img src={Logo} alt="ChatApp Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-2xl font-bold mt-3">Join ChatApp</h1>
            <p className="text-base-content/60 text-sm">Create an account to start chatting</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            icon={<User className="size-5 text-base-content/40" />}
            error={errors.fullName?.message}
            inputProps={register("fullName")}
          />

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

          <Button type="submit" isLoading={isRegister} className="btn-primary">
            Create Account
          </Button>
        </form>

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
