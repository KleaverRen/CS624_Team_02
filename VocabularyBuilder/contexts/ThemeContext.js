import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native"; // To detect system theme preference
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme(); // 'light' or 'dark' or null
  const [theme, setTheme] = useState(systemColorScheme || "light"); // Default to system, or 'light'

  useEffect(() => {
    // Load theme preference from AsyncStorage on app start
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("userTheme");
        if (storedTheme) {
          setTheme(storedTheme);
        } else if (systemColorScheme) {
          // If no stored preference, use system preference
          setTheme(systemColorScheme);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      }
    };
    loadThemePreference();
  }, [systemColorScheme]); // Re-run if system scheme changes (e.g., user changes system theme)

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem("userTheme", newTheme); // Save preference
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const currentTheme = {
    mode: theme,
    colors: {
      primary: theme === "dark" ? "#BB86FC" : "#6200EE", // Purple
      secondary: theme === "dark" ? "#03DAC6" : "#03DAC6", // Teal
      background: theme === "dark" ? "#121212" : "#E0F2F7", // Dark/Light background
      cardBackground: theme === "dark" ? "#444" : "#FFFFFF", // Dark/Light card background
      text: theme === "dark" ? "#E0E0E0" : "#333333", // Dark/Light text
      subText: theme === "dark" ? "#AAAAAA" : "#666666", // Dark/Light secondary text
      inputBackground: theme === "dark" ? "#2C2C2C" : "#F0F0F0", // Dark/Light input background
      inputBorder: theme === "dark" ? "#555555" : "#CCCCCC", // Dark/Light input border
      link: theme === "dark" ? "#BB86FC" : "#007bff", // Link color
      error: theme === "dark" ? "#CF6679" : "#D32F2F", // Error color
      success: theme === "dark" ? "#03DAC6" : "#388E3C", // Success color
      errorBackground: theme === "dark" ? "#CF6679" : "#D32F2F", // Error color
      successBackground: theme === "dark" ? "#03DAC6" : "#388E3C", // Success color
      // Add more colors as needed for other UI elements
    },
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme.mode,
        colors: currentTheme.colors,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
