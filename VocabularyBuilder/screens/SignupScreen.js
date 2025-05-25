// screens/SignupScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const { width, height } = Dimensions.get("window");
const IS_PHONE = width < 768;
const CARD_MAX_WIDTH = 400;

const SignupScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State variable for tracking input errors, now stores messages
  const [errors, setErrors] = useState({});

  const { signup } = useAuth();
  const { theme, colors, toggleTheme } = useTheme();

  const handleSignup = async () => {
    setErrors({}); // Reset errors at the beginning of each attempt
    let newErrors = {};
    let isValid = true;

    if (!firstName) {
      newErrors.firstName = "First name is required.";
      isValid = false;
    }
    if (!lastName) {
      newErrors.lastName = "Last name is required.";
      isValid = false;
    }
    if (!username) {
      newErrors.username = "Username is required.";
      isValid = false;
    }
    if (!email) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address.";
        isValid = false;
      }
    }
    if (!password) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else if (password.length < 6) {
      // Example: minimum password length
      newErrors.password = "Password must be at least 6 characters.";
      isValid = false;
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
      isValid = false;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match."; // Assign to confirmPassword for clear UI
      newErrors.password = "Passwords do not match.";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      // Removed the general Alert.alert here, as specific messages are shown below fields
      return;
    }

    setIsLoading(true);
    const result = await signup(username, email, password, firstName, lastName);
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        "Success",
        result.message || "Account created successfully! Please log in."
      );
      navigation.navigate("Login");
    } else {
      Alert.alert(
        "Signup Failed",
        result.error || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
        <Icon
          name={theme === "light" ? "weather-sunny" : "moon-waning-gibbous"}
          size={IS_PHONE ? width * 0.07 : 30}
          color={theme === "light" ? "#FFD700" : colors.primary}
        />
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text }]}>Sign Up</Text>

        <TextInput
          style={[
            styles.input,
            {
              borderColor: errors.firstName ? colors.error : colors.inputBorder,
              backgroundColor: colors.inputBackground,
              color: colors.text,
            },
          ]}
          placeholder="First Name"
          placeholderTextColor={colors.subText}
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            setErrors((prev) => ({ ...prev, firstName: null })); // Clear error
          }}
          autoCapitalize="words"
          keyboardAppearance={theme}
        />
        {errors.firstName && (
          <Text style={[styles.errorMessage, { color: colors.error }]}>
            {errors.firstName}
          </Text>
        )}

        <TextInput
          style={[
            styles.input,
            {
              borderColor: errors.lastName ? colors.error : colors.inputBorder,
              backgroundColor: colors.inputBackground,
              color: colors.text,
            },
          ]}
          placeholder="Last Name"
          placeholderTextColor={colors.subText}
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            setErrors((prev) => ({ ...prev, lastName: null })); // Clear error
          }}
          autoCapitalize="words"
          keyboardAppearance={theme}
        />
        {errors.lastName && (
          <Text style={[styles.errorMessage, { color: colors.error }]}>
            {errors.lastName}
          </Text>
        )}

        <TextInput
          style={[
            styles.input,
            {
              borderColor: errors.username ? colors.error : colors.inputBorder,
              backgroundColor: colors.inputBackground,
              color: colors.text,
            },
          ]}
          placeholder="Username"
          placeholderTextColor={colors.subText}
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setErrors((prev) => ({ ...prev, username: null })); // Clear error
          }}
          autoCapitalize="none"
          keyboardAppearance={theme}
        />
        {errors.username && (
          <Text style={[styles.errorMessage, { color: colors.error }]}>
            {errors.username}
          </Text>
        )}

        <TextInput
          style={[
            styles.input,
            {
              borderColor: errors.email ? colors.error : colors.inputBorder,
              backgroundColor: colors.inputBackground,
              color: colors.text,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={colors.subText}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({ ...prev, email: null })); // Clear error
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          keyboardAppearance={theme}
        />
        {errors.email && (
          <Text style={[styles.errorMessage, { color: colors.error }]}>
            {errors.email}
          </Text>
        )}

        <TextInput
          style={[
            styles.input,
            {
              borderColor: errors.password ? colors.error : colors.inputBorder,
              backgroundColor: colors.inputBackground,
              color: colors.text,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={colors.subText}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({
              ...prev,
              password: null,
              confirmPassword: null,
            })); // Clear both on password change
          }}
          secureTextEntry
          keyboardAppearance={theme}
        />
        {errors.password && (
          <Text style={[styles.errorMessage, { color: colors.error }]}>
            {errors.password}
          </Text>
        )}

        <TextInput
          style={[
            styles.input,
            {
              borderColor: errors.confirmPassword
                ? colors.error
                : colors.inputBorder,
              backgroundColor: colors.inputBackground,
              color: colors.text,
            },
          ]}
          placeholder="Confirm Password"
          placeholderTextColor={colors.subText}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setErrors((prev) => ({
              ...prev,
              confirmPassword: null,
              password: null,
            })); // Clear both on confirm password change
          }}
          secureTextEntry
          keyboardAppearance={theme}
        />
        {errors.confirmPassword && (
          <Text style={[styles.errorMessage, { color: colors.error }]}>
            {errors.confirmPassword}
          </Text>
        )}

        <Button
          title="Sign Up"
          onPress={handleSignup}
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

        <Text style={[styles.loginText, { color: colors.subText }]}>
          Already have an account?{" "}
          <Text
            style={[styles.loginLink, { color: colors.link }]}
            onPress={() => navigation.navigate("Login")}
          >
            Login
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    marginBottom: IS_PHONE ? height * 0.02 : 15, // Keep some bottom margin
    fontSize: IS_PHONE ? width * 0.045 : 18,
  },
  spinner: {
    marginTop: IS_PHONE ? height * 0.015 : 10,
  },
  loginText: {
    marginTop: IS_PHONE ? height * 0.03 : 20,
    fontSize: IS_PHONE ? width * 0.04 : 16,
  },
  loginLink: {
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
    alignSelf: "flex-start", // Align error message to the left
    fontSize: IS_PHONE ? width * 0.035 : 14,
    marginTop: -(IS_PHONE ? height * 0.015 : 10), // Pull it closer to the input
    marginBottom: IS_PHONE ? height * 0.02 : 15, // Space it from the next element
    paddingLeft: IS_PHONE ? width * 0.01 : 5, // Small indent
  },
});

export default SignupScreen;
