"use client"

import * as React from "react"

export type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system")

  // Load the persisted theme on mount to prevent hydration mismatch
  React.useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme") as Theme
      if (savedTheme) {
        setThemeState(savedTheme)
      }
    } catch (e) {
      console.warn("Unable to access localStorage on mount", e)
    }
  }, [])

  React.useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (currentTheme: Theme) => {
      root.classList.remove("light", "dark")

      if (currentTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        root.classList.add(systemTheme)
      } else {
        root.classList.add(currentTheme)
      }
    }

    applyTheme(theme)

    // Sync theme updates to localStorage
    try {
      localStorage.setItem("theme", theme)
    } catch (e) {
      console.warn("Unable to write theme to localStorage", e)
    }

    // Handle system changes dynamically if theme is set to 'system'
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleSystemThemeChange = () => {
        applyTheme("system")
      }
      mediaQuery.addEventListener("change", handleSystemThemeChange)
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
