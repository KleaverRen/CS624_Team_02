// screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const { width, height } = Dimensions.get("window");

// Define some breakpoints or constants for responsive sizing
const IS_PHONE = width < 768; // Assuming 768px as a common breakpoint for tablets/web
const CARD_MAX_WIDTH = 400; // Max width for the login card

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // New state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State for storing validation errors
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const { theme, colors, toggleTheme } = useTheme();

  const handleLogin = async () => {
    // Reset errors at the beginning of each attempt
    setErrors({});
    let newErrors = {};
    let isValid = true;

    if (!identifier.trim()) {
      // Use .trim() to catch empty strings with only spaces
      newErrors.identifier = "Username or Email is required.";
      isValid = false;
    }
    if (!password) {
      newErrors.password = "Password is required.";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return; // Stop if validation fails
    }

    setIsLoading(true);
    const result = await login(identifier, password);
    setIsLoading(false);

    if (result.success) {
      // Login successful, AuthContext will update, AppNavigator will redirect
    } else {
      // Set a general error message for login failures not related to input validation
      Alert.alert(
        "Login Failed",
        result.error || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
        <Icon
          name={theme === "light" ? "weather-sunny" : "moon-waning-gibbous"}
          size={IS_PHONE ? width * 0.07 : 30}
          color={theme === "light" ? "#FFD700" : colors.primary}
        />
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text }]}>Login</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: errors.identifier
                ? colors.error
                : colors.inputBorder, // Apply error style
              backgroundColor: colors.inputBackground,
              color: colors.text,
            },
          ]}
          placeholder="Username or Email"
          placeholderTextColor={colors.subText}
          value={identifier}
          onChangeText={(text) => {
            setIdentifier(text);
            setErrors((prev) => ({ ...prev, identifier: null })); // Clear error on change
          }}
          autoCapitalize="none"
          keyboardAppearance={theme}
        />
        {errors.identifier && (
          <Text style={[styles.errorMessage, { color: colors.error }]}>
            {errors.identifier}
          </Text>
        )}

        {/* Password Input Container */}
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={[
              styles.input, // Apply base input style
              styles.passwordInput, // Adjust width if needed
              {
                borderColor: errors.password
                  ? colors.error
                  : colors.inputBorder,
                backgroundColor: colors.inputBackground,
                color: colors.text,
              },
            ]}
            placeholder="Password"
            placeholderTextColor={colors.subText}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: null }));
            }}
            secureTextEntry={!showPassword} // Toggle visibility based on state
            keyboardAppearance={theme}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.passwordToggleIcon}
          >
            <Icon
              name={showPassword ? "eye-off" : "eye"}
              size={IS_PHONE ? width * 0.055 : 22} // Adjust icon size
              color={colors.subText} // Use a subtle color for the icon
            />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text style={[styles.errorMessage, { color: colors.error }]}>
            {errors.password}
          </Text>
        )}

        <Button
          title="Login"
          onPress={handleLogin}
          disabled={isLoading}
          color={colors.primary}
        />
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.spinner}
          />
        )}

        <Text style={[styles.signupText, { color: colors.subText }]}>
          Don't have an account?{" "}
          <Text
            style={[styles.signupLink, { color: colors.link }]}
            onPress={() => navigation.navigate("Signup")}
          >
            Sign Up
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: IS_PHONE ? width * 0.05 : 30,
  },
  card: {
    width: IS_PHONE ? "90%" : CARD_MAX_WIDTH,
    maxWidth: 400,
    padding: IS_PHONE ? width * 0.06 : 40,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    alignItems: "center",
  },
  title: {
    fontSize: IS_PHONE ? width * 0.08 : 36,
    fontWeight: "bold",
    marginBottom: IS_PHONE ? height * 0.04 : 30,
  },
  input: {
    width: "100%",
    padding: IS_PHONE ? width * 0.04 : 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: IS_PHONE ? height * 0.02 : 15,
    fontSize: IS_PHONE ? width * 0.045 : 18,
  },
  spinner: {
    marginTop: IS_PHONE ? height * 0.015 : 10,
  },
  signupText: {
    marginTop: IS_PHONE ? height * 0.03 : 20,
    fontSize: IS_PHONE ? width * 0.04 : 16,
  },
  signupLink: {
    fontWeight: "bold",
  },
  themeToggle: {
    position: "absolute",
    top: IS_PHONE ? height * 0.05 : 30,
    right: IS_PHONE ? width * 0.05 : 30,
    padding: IS_PHONE ? width * 0.02 : 10,
    borderRadius: 50,
  },
  // --- New Error Message Style ---
  errorMessage: {
    alignSelf: "flex-start",
    fontSize: IS_PHONE ? width * 0.035 : 14,
    marginTop: -(IS_PHONE ? height * 0.015 : 10), // Pull it closer to the input
    marginBottom: IS_PHONE ? height * 0.02 : 15, // Space it from the next element
    paddingLeft: IS_PHONE ? width * 0.01 : 5, // Small indent
  },
  // --- New Styles for Password Toggle ---
  passwordInputContainer: {
    flexDirection: "row", // Arrange children in a row
    alignItems: "center", // Vertically center items
    width: "100%", // Match parent width
    marginBottom: IS_PHONE ? height * 0.02 : 15, // Space below the container
  },
  passwordInput: {
    flex: 1, // Take up all available space
    paddingRight: IS_PHONE ? width * 0.12 : 50, // Make space for the icon
    // Remove individual marginBottom as it's now on the container
    marginBottom: 0,
  },
  passwordToggleIcon: {
    position: "absolute", // Position over the input
    right: IS_PHONE ? width * 0.03 : 15, // Adjust positioning
    padding: IS_PHONE ? width * 0.01 : 5, // Make icon easier to tap
  },
});

export default LoginScreen;
