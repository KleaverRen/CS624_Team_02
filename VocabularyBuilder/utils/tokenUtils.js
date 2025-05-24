// utils/tokenUtils.js
import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token) => {
  if (!token) {
    return true; // No token means it's effectively expired/invalid
  }
  try {
    const decoded = jwtDecode(token);
    if (!decoded || !decoded.exp) {
      console.error("Token does not have an expiration time.");
      return true; // No expiration means token is invalid
    }
    // JWT exp is in seconds, Date.now() is in milliseconds
    // Give a small buffer (e.g., 5 seconds) before actual expiration
    return decoded.exp < Date.now() / 1000 + 5; // Token is expired if exp time is less than current time + buffer
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Malformed or invalid token
  }
};

export const decodeToken = (token) => {
  if (!token) {
    return null;
  }
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
