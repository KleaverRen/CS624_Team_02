// screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const { width } = Dimensions.get("window");

// Define some breakpoints or constants for responsive sizing
const IS_PHONE = width < 768; // Assuming 768px as a common breakpoint for tablets/web

import loginSignupStyles from "../styles/loginSignupStyles";

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
    <View
      style={[
        loginSignupStyles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <TouchableOpacity
        onPress={toggleTheme}
        style={loginSignupStyles.themeToggle}
      >
        <Icon
          name={theme === "light" ? "weather-sunny" : "moon-waning-gibbous"}
          size={IS_PHONE ? width * 0.07 : 30}
          color={theme === "light" ? "#FFD700" : colors.primary}
        />
      </TouchableOpacity>

      <View
        style={[
          loginSignupStyles.card,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <Text style={[loginSignupStyles.title, { color: colors.text }]}>
          Login
        </Text>
        <TextInput
          style={[
            loginSignupStyles.input,
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
          <Text
            style={[loginSignupStyles.errorMessage, { color: colors.error }]}
          >
            {errors.identifier}
          </Text>
        )}

        {/* Password Input Container */}
        <View style={loginSignupStyles.passwordInputContainer}>
          <TextInput
            style={[
              loginSignupStyles.input, // Apply base input style
              loginSignupStyles.passwordInput, // Adjust width if needed
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
            style={loginSignupStyles.passwordToggleIcon}
          >
            <Icon
              name={showPassword ? "eye-off" : "eye"}
              size={IS_PHONE ? width * 0.055 : 22} // Adjust icon size
              color={colors.subText} // Use a subtle color for the icon
            />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text
            style={[loginSignupStyles.errorMessage, { color: colors.error }]}
          >
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
            style={loginSignupStyles.spinner}
          />
        )}

        <Text style={[loginSignupStyles.signupText, { color: colors.subText }]}>
          Don't have an account?{" "}
          <Text
            style={[loginSignupStyles.signupLink, { color: colors.link }]}
            onPress={() => navigation.navigate("Signup")}
          >
            Sign Up
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default LoginScreen;
