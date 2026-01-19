import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
    theme: "dark",
    setTheme: () => null,
});

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

export const ThemeProvider = ({ children, defaultTheme = "dark", storageKey = "pluglegacy-theme" }) => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(storageKey) || defaultTheme;
        }
        return defaultTheme;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        localStorage.setItem(storageKey, theme);
    }, [theme, storageKey]);

    const value = {
        theme,
        setTheme,
        toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
