import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert, // Import Alert for user feedback
} from "react-native";
import { updateUserProfile } from "../utils/api"; // Make sure this path is correct

const UpdateProfileModal = ({
  isVisible,
  onClose,
  userProfile, // Current user profile data to pre-fill inputs
  onUpdateSuccess, // Callback to update parent component's state on success
  theme, // Pass theme for consistent styling
}) => {
  // Local state for the input fields, initialized with current user profile data
  const [email, setEmail] = useState(userProfile?.email || "");
  const [firstName, setFirstName] = useState(userProfile?.firstName || "");
  const [lastName, setLastName] = useState(userProfile?.lastName || "");
  const [isUpdating, setIsUpdating] = useState(false); // State to manage loading indicator and disable inputs

  // Effect to update local state when the userProfile prop changes (e.g., when modal opens with new data)
  useEffect(() => {
    if (userProfile) {
      setEmail(userProfile.email || "");
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName || "");
    }
  }, [userProfile]); // Dependency array: run when userProfile changes

  const handleUpdate = async () => {
    // Basic validation: ensure at least one field is provided
    if (!email.trim() && !firstName.trim() && !lastName.trim()) {
      Alert.alert(
        "Input Error",
        "Please fill in at least one field to update."
      );
      return;
    }

    setIsUpdating(true); // Start loading state
    try {
      // Call your API to update the user profile
      const response = await updateUserProfile({ email, firstName, lastName });

      // Show success message to the user
      Alert.alert(
        "Success",
        response.data.message || "Profile updated successfully!"
      );

      // Call the success callback to update the parent component's userProfile state
      // and pass the newly updated user data from the API response
      onUpdateSuccess(response.data.user);

      onClose(); // Close the modal on successful update
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message
      );
      // Show error message to the user
      Alert.alert(
        "Update Failed",
        error.response?.data?.message ||
          "There was an error updating your profile. Please try again."
      );
    } finally {
      setIsUpdating(false); // End loading state
    }
  };

  return (
    <Modal
      animationType="fade" // Controls how the modal animates in/out
      transparent={true} // Makes the background behind the modal transparent
      visible={isVisible} // Controls the visibility of the modal
      onRequestClose={onClose} // Handler for Android hardware back button
    >
      <View style={styles.centeredView}>
        <View
          style={[styles.modalView, theme === "dark" && styles.darkModalView]}
        >
          <Text
            style={[
              styles.modalTitle,
              theme === "dark" && styles.darkSectionTitle, // Using darkSectionTitle from parent's styles for consistency
            ]}
          >
            Edit Profile
          </Text>

          <TextInput
            style={[
              styles.input,
              theme === "dark" && styles.darkInput,
              isUpdating && styles.inputDisabled, // Apply disabled style when updating
            ]}
            placeholder="Email"
            placeholderTextColor={theme === "dark" ? "#aaa" : "#666"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isUpdating} // Disable input while updating
          />
          <TextInput
            style={[
              styles.input,
              theme === "dark" && styles.darkInput,
              isUpdating && styles.inputDisabled,
            ]}
            placeholder="First Name"
            placeholderTextColor={theme === "dark" ? "#aaa" : "#666"}
            value={firstName}
            onChangeText={setFirstName}
            editable={!isUpdating}
          />
          <TextInput
            style={[
              styles.input,
              theme === "dark" && styles.darkInput,
              isUpdating && styles.inputDisabled,
            ]}
            placeholder="Last Name"
            placeholderTextColor={theme === "dark" ? "#aaa" : "#666"}
            value={lastName}
            onChangeText={setLastName}
            editable={!isUpdating}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonCancel]}
              onPress={onClose}
              disabled={isUpdating} // Disable cancel button while updating
            >
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.buttonSave,
                isUpdating && styles.buttonDisabled, // Apply disabled style to save button
              ]}
              onPress={handleUpdate}
              disabled={isUpdating} // Disable save button while updating
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" /> // Show loader when updating
              ) : (
                <Text style={styles.textStyle}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
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
    backgroundColor: "rgba(0,0,0,0.6)", // Semi-transparent overlay
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%", // Responsive width
    maxWidth: 400, // Max width for larger screens
  },
  darkModalView: {
    backgroundColor: "#444",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333", // Default color for light mode
  },
  darkSectionTitle: {
    // Reusing this style from SettingsScreen for consistency
    color: "#ddd",
  },
  input: {
    height: 45,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: "100%",
    fontSize: 16,
    color: "#333", // Default text color
    backgroundColor: "#f9f9f9", // Default background color
  },
  darkInput: {
    borderColor: "#666",
    backgroundColor: "#555",
    color: "#eee", // Text color for dark mode
  },
  inputDisabled: {
    backgroundColor: "#e0e0e0", // Lighter background for disabled input
    color: "#a0a0a0", // Lighter text color for disabled input
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  modalButton: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    flex: 1, // Make buttons share space
    marginHorizontal: 5,
  },
  buttonCancel: {
    backgroundColor: "#ccc",
  },
  buttonSave: {
    backgroundColor: "#007bff", // Blue for save
  },
  buttonDisabled: {
    backgroundColor: "#a0cbe8", // Lighter blue when disabled
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});

export default UpdateProfileModal;
