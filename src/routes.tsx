// routes.tsx

import { createBrowserRouter } from "react-router"

import App from "./App"
import NewPage from "./pages/newPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "new",
    element: <NewPage />,
  },
])
