// routes.tsx

import { createBrowserRouter } from "react-router"

import App from "./App"
import Layout from "./layout/layout"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import Profile from "./pages/ProfilePage"
import RegisterPage from "./pages/RegisterPage"
import SettingPage from "./pages/SettingPage"

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "settings",
        element: <SettingPage />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
])
