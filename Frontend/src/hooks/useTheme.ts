import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem("admin-theme") as Theme) || "system"
    );

    useEffect(() => {
        const root = document.querySelector(".admin-theme");
        if (!root) return;
        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        if (theme !== "system") return;

        function handleSystemThemeChange() {
            const root = window.document.documentElement;
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

            root.classList.remove("light", "dark");
            root.classList.add(systemTheme ? "dark" : "light");
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQuery.addEventListener("change", handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener("change", handleSystemThemeChange);
        };
    }, [theme]);

    return {
        theme,
        setTheme,
        isDark: theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches),
    };
} 