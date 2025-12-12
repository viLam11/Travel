
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
    isDark: boolean
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
    isDark: false,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function AdminThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "admin-theme",
    ...props
}: {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
} & React.ComponentProps<"div">) { // Extend div props to pass className potentially
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    )
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const root = window.document.documentElement

        // Update isDark state
        const checkIsDark = () => {
            if (theme === "dark") return true
            if (theme === "light") return false
            // system
            return window.matchMedia("(prefers-color-scheme: dark)").matches
        }

        setIsDark(checkIsDark())

        // Update localStorage
        localStorage.setItem(storageKey, theme)

        // Listen for system changes if theme is system
        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
            const handleChange = () => setIsDark(mediaQuery.matches)
            mediaQuery.addEventListener("change", handleChange)
            return () => mediaQuery.removeEventListener("change", handleChange)
        }
    }, [theme, storageKey])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
        isDark
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useAdminTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useAdminTheme must be used within a AdminThemeProvider")

    return context
}
