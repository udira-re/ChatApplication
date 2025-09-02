import React, { type FC, type ReactNode } from "react"

type InputFieldProps = {
  label: string
  type?: string
  placeholder?: string
  icon?: ReactNode
  error?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

const InputField: FC<InputFieldProps> = ({
  label,
  type = "text",
  placeholder,
  icon,
  error,
  inputProps,
}) => {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text font-medium">{label}</span>
      </label>
      <div className="relative mt-1">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          className={`input input-bordered w-full pl-10 appearance-none ${error ? "input-error" : ""}`}
          {...inputProps}
        />
      </div>
      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </div>
  )
}

export default InputField
