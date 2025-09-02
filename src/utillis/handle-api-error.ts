import toast from "react-hot-toast"

export const handleApiError = (error: unknown, defaultMessage = "Something went wrong") => {
  if (error instanceof Error) {
    toast.error(error.message)
  } else if (typeof error === "string") {
    toast.error(error)
  } else {
    toast.error(defaultMessage)
  }
}
