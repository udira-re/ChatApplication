import { create } from "zustand"

import { THEMES } from "../component/constants/theme"

type ThemeStore = {
  theme: string
  setTheme: (theme: string) => void
}

export const UseThemeStore = create<ThemeStore>((set) => ({
  theme: (localStorage.getItem("chat-theme") as string) || THEMES.COFFEE,
  setTheme: (theme: string) => {
    localStorage.setItem("chat-theme", theme)
    set({ theme })
  },
}))
