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
import { useTheme } from "../contexts/ThemeContext"; // <-- Import useTheme

const { width, height } = Dimensions.get("window");

const SignupScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const { theme, colors, toggleTheme } = useTheme(); // <-- Use theme context

  const handleSignup = async () => {
    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !firstName ||
      !lastName
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
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
          size={width * 0.07}
          color={theme === "light" ? "#FFD700" : colors.primary}
        />
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text }]}>Sign Up</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.inputBorder,
              backgroundColor: colors.inputBackground,
              color: colors.text,
            },
          ]}
          placeholder="First Name"
          placeholderTextColor={colors.subText}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
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
          placeholder="Last Name"
          placeholderTextColor={colors.subText}
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
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
          placeholder="Username"
          placeholderTextColor={colors.subText}
          value={username}
          onChangeText={setUsername}
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
          placeholder="Email"
          placeholderTextColor={colors.subText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
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
        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.inputBorder,
              backgroundColor: colors.inputBackground,
              color: colors.text,
            },
          ]}
          placeholder="Confirm Password"
          placeholderTextColor={colors.subText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          keyboardAppearance={theme}
        />
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
  loginText: {
    marginTop: height * 0.03,
    fontSize: width * 0.04,
  },
  loginLink: {
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

export default SignupScreen;
