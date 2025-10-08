import classNames from "classnames" // ✅ import classNames
import { Eye, EyeOff } from "lucide-react"
import React, { useState } from "react"
import { useFormContext, type FieldValues, get, type FieldPath } from "react-hook-form"

export type TFormInputType = "text" | "number" | "password"

type IFormInputProps<T extends FieldValues> = {
  name: FieldPath<T>
  label: string
  type?: TFormInputType
  placeholder?: string
  required?: boolean
  hideBottomMargin?: boolean
  autoComplete?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  value?: string
}

export default function FormInput<T extends FieldValues>(props: IFormInputProps<T>) {
  const {
    watch,
    register,
    formState: { errors },
  } = useFormContext<T>()

  const currentValue = watch(props.name) ?? ""
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const togglePassword = () => setIsPasswordVisible(!isPasswordVisible)

  const inputType =
    props.type === "password" ? (isPasswordVisible ? "text" : "password") : props.type

  const errorMessage = get(errors, props.name)?.message

  return (
    <fieldset>
      <label htmlFor={props.name} className="ml-[1px] block text-sm text-gray-700">
        <span>{props.label}</span>
        {props.required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          {...register(props.name)}
          id={props.name}
          type={inputType}
          className={classNames(
            "h-10 w-full rounded-md border bg-gray-400 pl-2 text-sm placeholder:text-gray-400",
            props.type === "password" && "pr-10",
            errorMessage
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
              : "border-stone-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          )}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          {...(props.onChange ? { onChange: props.onChange } : {})}
          value={props.value ?? currentValue}
        />

        {props.type === "password" && currentValue && (
          <div className="absolute right-2 top-0 flex h-full items-center text-gray-700">
            {isPasswordVisible ? (
              <Eye size={20} className="cursor-pointer" onClick={togglePassword} />
            ) : (
              <EyeOff size={20} className="cursor-pointer" onClick={togglePassword} />
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="ml-[1px] mt-[2px] text-xs text-red-500">{errorMessage.toString()}</p>
      )}
    </fieldset>
  )
}
