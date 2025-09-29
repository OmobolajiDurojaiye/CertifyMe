import React, { createContext, useState, useEffect, useContext } from "react";

const defaultState = {
  theme: "light",
  setTheme: () => {
    console.error(
      "Error: setTheme was called, but the component is not wrapped in a <ThemeProvider>. Check your App.jsx routing structure."
    );
  },
};

const ThemeContext = createContext(defaultState);

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
