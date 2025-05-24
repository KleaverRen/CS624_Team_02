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
import { useTheme } from "../contexts/ThemeContext"; // <-- Import useTheme

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { theme, colors, toggleTheme } = useTheme(); // <-- Use theme context

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("Error", "Please enter both username/email and password.");
      return;
    }

    setIsLoading(true);
    const result = await login(identifier, password);
    setIsLoading(false);

    if (result.success) {
      // Login successful, AuthContext will update, AppNavigator will redirect
    } else {
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
          size={width * 0.07}
          color={theme === "light" ? "#FFD700" : colors.primary} // Adjust icon color based on theme
        />
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text }]}>Login</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.inputBorder,
              backgroundColor: colors.inputBackground,
              color: colors.text,
            },
          ]}
          placeholder="Username or Email"
          placeholderTextColor={colors.subText}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          keyboardAppearance={theme}
        />
        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.inputBorder,
              backgroundColor: colors.inputBackground,
              color: colors.text,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={colors.subText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          keyboardAppearance={theme}
        />
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
    padding: width * 0.05,
  },
  card: {
    width: "90%",
    maxWidth: 400,
    padding: width * 0.06,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    alignItems: "center",
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    marginBottom: height * 0.04,
  },
  input: {
    width: "100%",
    padding: width * 0.04,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: height * 0.02,
    fontSize: width * 0.045,
  },
  spinner: {
    marginTop: height * 0.015,
  },
  signupText: {
    marginTop: height * 0.03,
    fontSize: width * 0.04,
  },
  signupLink: {
    fontWeight: "bold",
  },
  themeToggle: {
    position: "absolute",
    top: height * 0.05,
    right: width * 0.05,
    padding: width * 0.02,
    borderRadius: 50,
  },
});

export default LoginScreen;
