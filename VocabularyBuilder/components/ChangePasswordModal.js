import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../contexts/ThemeContext"; // Assuming this path is correct
// You'll need an API utility function for changing password.
// For now, we'll just simulate it.
import { changePasswordApi } from "../utils/api"; // <--- You would import your actual API call here

const ChangePasswordModal = ({ isVisible, onClose }) => {
  const { theme, colors } = useTheme();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert(
        "Error",
        "New password and confirm new password do not match."
      );
      return;
    }

    if (newPassword.length < 6) {
      // Example: enforce minimum password length
      Alert.alert("Error", "New password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      setIsLoading(true);
      const response = await changePasswordApi({
        currentPassword,
        newPassword,
      }); // Use the actual API call
      console.log("Password change response:", response);

      Alert.alert("Success", "Your password has been changed successfully!");
      onClose(); // Close modal on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error(
        "Error changing password:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to change password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View
          style={[styles.modalView, theme === "dark" && styles.darkModalView]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon
              name="close-circle"
              size={30}
              color={theme === "dark" ? colors.text : "#666"}
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.modalTitle,
              theme === "dark" && styles.darkModalTitle,
            ]}
          >
            Change Password
          </Text>

          <TextInput
            style={[styles.input, theme === "dark" && styles.darkInput]}
            placeholder="Current Password"
            placeholderTextColor={theme === "dark" ? "#aaa" : "#666"}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={[styles.input, theme === "dark" && styles.darkInput]}
            placeholder="New Password"
            placeholderTextColor={theme === "dark" ? "#aaa" : "#666"}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={[styles.input, theme === "dark" && styles.darkInput]}
            placeholder="Confirm New Password"
            placeholderTextColor={theme === "dark" ? "#aaa" : "#666"}
            secureTextEntry
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
          />

          <TouchableOpacity
            style={[
              styles.changeButton,
              isLoading && styles.changeButtonDisabled,
            ]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.changeButtonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  darkModalView: {
    backgroundColor: "#333",
    borderColor: "#555",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  darkModalTitle: {
    color: "#eee",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  darkInput: {
    backgroundColor: "#555",
    borderColor: "#777",
    color: "#eee",
  },
  changeButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  changeButtonDisabled: {
    backgroundColor: "#a0c7fa", // Lighter blue for disabled state
  },
  changeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default ChangePasswordModal;
