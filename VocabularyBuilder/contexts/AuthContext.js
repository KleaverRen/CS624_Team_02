// context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authLogin, authSignup, authLogout } from "../utils/api"; // Adjust path if needed
import { Alert } from "react-native"; // Ensure Alert is imported
import { isTokenExpired, decodeToken } from "../utils/tokenUtils";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // To check if token is loaded from storage

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          if (isTokenExpired(token)) {
            console.log(
              "Stored token is expired. Clearing and redirecting to login."
            );
            await AsyncStorage.removeItem("userToken");
            setUserToken(null); // Set to null to trigger logout state
            // No direct navigation here; AppNavigator will handle based on userToken state
          } else {
            setUserToken(token);
          }
        }
      } catch (e) {
        console.error("Failed to load token from storage:", e);
        // Ensure token is cleared if there's an error loading
        await AsyncStorage.removeItem("userToken");
        setUserToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await authLogin(identifier, password);
      const token = response.data.token;
      await AsyncStorage.setItem("userToken", token);
      setUserToken(token);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const signup = async (username, email, password, firstName, lastName) => {
    try {
      const response = await authSignup(
        username,
        email,
        password,
        firstName,
        lastName
      );
      // After signup, you might automatically log them in or redirect to login
      // For now, let's just return success
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Signup failed",
      };
    }
  };

  const logout = async () => {
    try {
      // Call the backend logout API first
      if (userToken) {
        // Only try to call API if a token exists
        await authLogout();
        console.log("Backend logout successful.");
      }

      // Then clear the local token
      await AsyncStorage.removeItem("userToken");
      setUserToken(null);
    } catch (error) {
      // Even if backend logout fails (e.g., token already invalid),
      // we should still clear the local token to log the user out on the client side.
      console.error(
        "Error during backend logout or clearing local token:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Logout Issue",
        "Logged out on device, but server logout had an issue. Please try logging in again if problems persist."
      );
      await AsyncStorage.removeItem("userToken"); // Ensure token is cleared anyway
      setUserToken(null);
    }
  };

  return (
    <AuthContext.Provider
      style={{ pointerEvents: "none" }}
      value={{ userToken, isLoading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
