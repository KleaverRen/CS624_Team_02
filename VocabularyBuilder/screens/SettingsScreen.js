import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Button,
  Modal,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../utils/api";

const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false); // State for modal visibility
  const [userProfile, setUserProfile] = useState(null); // <-- State to hold user profile
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // <-- Loading state for profile

  const [dailyWordGoal, setDailyWordGoal] = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        setUserProfile(response.data);
      } catch (error) {
        console.error(
          "Error fetching user profile:",
          error.response?.data || error.message
        );
        Alert.alert("Error", "Failed to fetch user profile.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
    loadSettings();
  }, []);

  const handleShowLogoutModal = () => {
    setLogoutModalVisible(true);
  };

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false); // Close modal first
    logout(); // Call the logout function
  };

  const handleCancelLogout = () => {
    setLogoutModalVisible(false); // Just close the modal
  };
  const loadSettings = async () => {
    try {
      const storedGoal = await AsyncStorage.getItem("dailyWordGoal");
      if (storedGoal) {
        setDailyWordGoal(storedGoal);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveDailyWordGoal = async (goal) => {
    try {
      await AsyncStorage.setItem("dailyWordGoal", goal);
      setDailyWordGoal(goal);
      setIsEditingGoal(false);
    } catch (error) {
      console.error("Error saving daily word goal:", error);
    }
  };

  if (isLoadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={[
        styles.container,
        theme === "dark" && styles.darkContainer,
      ]}
    >
      <Text style={[styles.title, theme === "dark" && styles.darkTitle]}>
        Settings
      </Text>
      {/* User Profile Section */}
      <View style={[styles.section, theme === "dark" && styles.darkSection]}>
        <Text
          style={[
            styles.sectionTitle,
            theme === "dark" && styles.darkSectionTitle,
          ]}
        >
          User Profile
        </Text>
        <Text style={[styles.item, theme === "dark" && styles.darkItem]}>
          Username: {userProfile?.username || "N/A"}
        </Text>
        <Text style={[styles.item, theme === "dark" && styles.darkItem]}>
          Name: {userProfile?.firstName || ""} {userProfile?.lastName || ""}
        </Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>
            Edit Profile (Comming Soon)
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, theme === "dark" && styles.darkSection]}>
        <Text
          style={[
            styles.sectionTitle,
            theme === "dark" && styles.darkSectionTitle,
          ]}
        >
          App Preferences
        </Text>
        <Text style={[styles.item, theme === "dark" && styles.darkItem]}>
          Theme: {theme === "light" ? "Light" : "Dark"}
        </Text>
        <TouchableOpacity style={styles.actionButton} onPress={toggleTheme}>
          <Text style={styles.actionButtonText}>
            Switch to {theme === "light" ? "Dark" : "Light"} Theme
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, theme === "dark" && styles.darkSection]}>
        <Text
          style={[
            styles.sectionTitle,
            theme === "dark" && styles.darkSectionTitle,
          ]}
        >
          Learning Goals
        </Text>
        <View style={styles.goalItem}>
          <Text style={[styles.item, theme === "dark" && styles.darkItem]}>
            Daily Word Goal: {dailyWordGoal ? dailyWordGoal : "Not set"}
          </Text>
          <TouchableOpacity
            onPress={() => setIsEditingGoal(true)}
            style={styles.editGoalButton}
          >
            <Text style={styles.editGoalButtonText}>
              {dailyWordGoal ? "Edit" : "Set"}
            </Text>
          </TouchableOpacity>
        </View>
        {isEditingGoal && (
          <View style={styles.editGoalInputContainer}>
            <TextInput
              style={styles.editGoalInput}
              placeholder="Enter your daily goal"
              keyboardType="number-pad"
              value={dailyWordGoal}
              onChangeText={setDailyWordGoal}
            />
            <TouchableOpacity
              style={styles.saveGoalButton}
              onPress={() => saveDailyWordGoal(dailyWordGoal)}
            >
              <Text style={styles.saveGoalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelGoalButton}
              onPress={() => setIsEditingGoal(false)}
            >
              <Text style={styles.cancelGoalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={[styles.item, theme === "dark" && styles.darkItem]}>
          Quiz Frequency: (Daily)
        </Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Change Frequency</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => handleShowLogoutModal(true)}
        >
          <Text style={styles.actionButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>
      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade" // Or 'slide'
        transparent={true}
        visible={isLogoutModalVisible}
        onRequestClose={handleCancelLogout} // Allows closing with hardware back button on Android
      >
        <View style={styles.centeredView}>
          <View
            style={[styles.modalView, theme === "dark" && styles.darkModalView]}
          >
            <Text
              style={[
                styles.modalText,
                theme === "dark" && styles.darkModalText,
              ]}
            >
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonCancel]}
                onPress={handleCancelLogout}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonLogout]}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.textStyle}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  darkContainer: {
    backgroundColor: "#333",
  },
  logoutButtonContainer: {
    marginTop: "auto", // Push the logout button to the bottom
    width: "100%", // Make the button take up most of the width
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "red",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  darkTitle: {
    color: "#eee",
  },
  section: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  darkSection: {
    backgroundColor: "#444",
    borderColor: "#555",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555",
  },
  darkSectionTitle: {
    color: "#ddd",
  },
  item: {
    fontSize: 16,
    color: "#777",
    marginBottom: 8,
  },
  darkItem: {
    color: "#bbb",
  },
  actionButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  goalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  editGoalButton: {
    backgroundColor: "#28a745", // Green
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  editGoalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  editGoalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  editGoalInput: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  saveGoalButton: {
    backgroundColor: "#007bff", // Blue
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  saveGoalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelGoalButton: {
    backgroundColor: "#dc3545", // Red
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelGoalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  // --- Modal Styles ---
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
    maxWidth: 350, // Max width for larger screens
  },
  darkModalView: {
    margin: 20,
    backgroundColor: "#444",
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
    maxWidth: 350,
  },
  modalText: {
    marginBottom: 25,
    textAlign: "center",
    fontSize: 18,
    color: "#333",
  },
  darkModalText: {
    marginBottom: 25,
    textAlign: "center",
    fontSize: 18,
    color: "#eee",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
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
  buttonLogout: {
    backgroundColor: "red",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});

export default SettingsScreen;
