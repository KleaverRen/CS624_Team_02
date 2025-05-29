import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Define some breakpoints or constants for responsive sizing
const IS_PHONE = width < 768; // Assuming 768px as a common breakpoint for tablets/web
const CARD_MAX_WIDTH = 400; // Max width for the login card

const loginSignupStyles = StyleSheet.create({
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

  // Additional styles for Signup Screen
  loginText: {
    marginTop: IS_PHONE ? height * 0.03 : 20,
    fontSize: IS_PHONE ? width * 0.04 : 16,
  },
  loginLink: {
    fontWeight: "bold",
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

export default loginSignupStyles;
