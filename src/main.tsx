import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "react-hot-toast"
import { RouterProvider } from "react-router"

import "./index.css"
import { router } from "./routes"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Toasts are global, outside the router */}
    <RouterProvider router={router} />
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: { fontSize: "14px" },
      }}
    />
  </StrictMode>
)
