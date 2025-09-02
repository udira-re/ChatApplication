// components/Button.tsx
import React, { type FC, type ReactNode } from "react"

type ButtonProps = {
  children: ReactNode
  isLoading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  className?: string
}

const Button: FC<ButtonProps> = ({
  children,
  isLoading,
  disabled,
  onClick,
  type = "button",
  className,
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`btn w-full ${className || ""}`}
    >
      {isLoading ? (
        <>
          <span className="animate-spin mr-2">⏳</span> Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
