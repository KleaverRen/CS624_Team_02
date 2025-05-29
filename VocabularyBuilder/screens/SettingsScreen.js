import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../utils/api";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import LogoutConfirmationModal from "../components/LogoutConfirmationModal";
import UpdateProfileModal from "../components/UpdateProfileModal";

const SettingsScreen = () => {
  const { theme, colors, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isUpdateProfileModalVisible, setUpdateProfileModalVisible] =
    useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [dailyWordGoal, setDailyWordGoal] = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  useEffect(() => {
    fetchProfile();
    loadSettings();
  }, []);

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

  const handleShowLogoutModal = () => {
    setLogoutModalVisible(true);
  };

  // This handler will be passed to the LogoutConfirmationModal
  const handleConfirmLogout = () => {
    setLogoutModalVisible(false); // Close modal first
    logout(); // Call the logout function from AuthContext
  };

  const handleCloseLogoutModal = () => {
    // Renamed from handleCancelLogout for clarity as it's just closing
    setLogoutModalVisible(false);
  };

  const handleShowUpdateProfileModal = () => {
    setUpdateProfileModalVisible(true);
  };

  const handleUpdateProfileSuccess = (updatedUser) => {
    setUserProfile(updatedUser);
    setUpdateProfileModalVisible(false);
  };

  const handleCloseUpdateProfileModal = () => {
    setUpdateProfileModalVisible(false);
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
    if (!goal || parseInt(goal) <= 0) {
      Alert.alert(
        "Invalid Goal",
        "Please enter a valid number greater than 0 for your daily word goal."
      );
      return;
    }
    try {
      await AsyncStorage.setItem("dailyWordGoal", goal);
      setDailyWordGoal(goal);
      setIsEditingGoal(false);
      Alert.alert("Success", "Daily word goal updated!");
    } catch (error) {
      console.error("Error saving daily word goal:", error);
      Alert.alert("Error", "Failed to save daily word goal.");
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
          Email: {userProfile?.email || "N/A"}
        </Text>
        <Text style={[styles.item, theme === "dark" && styles.darkItem]}>
          Name: {userProfile?.firstName || ""} {userProfile?.lastName || ""}
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShowUpdateProfileModal}
        >
          <Text style={styles.actionButtonText}>Edit Profile</Text>
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
        <View style={styles.themeRow}>
          <Text style={[styles.item, theme === "dark" && styles.darkItem]}>
            Theme: {theme === "light" ? "Light" : "Dark"}
          </Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            <Icon
              name={theme === "light" ? "weather-sunny" : "moon-waning-gibbous"}
              size={30}
              color={theme === "light" ? "#FFD700" : colors.primary}
            />
          </TouchableOpacity>
        </View>
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
              style={[
                styles.editGoalInput,
                theme === "dark" && styles.darkEditGoalInput,
              ]}
              placeholder="Enter your daily goal"
              placeholderTextColor={theme === "dark" ? "#aaa" : "#666"}
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
          onPress={handleShowLogoutModal} // This now just sets the state to show the modal
        >
          <Text style={styles.actionButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Modal - Now a separate component */}
      <LogoutConfirmationModal
        isVisible={isLogoutModalVisible}
        onClose={handleCloseLogoutModal} // Pass a function to close the modal
        onConfirmLogout={handleConfirmLogout} // Pass the function to perform logout
      />

      {/* Update Profile Modal */}
      <UpdateProfileModal
        isVisible={isUpdateProfileModalVisible}
        onClose={handleCloseUpdateProfileModal}
        userProfile={userProfile}
        onUpdateSuccess={handleUpdateProfileSuccess}
        theme={theme}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  darkContainer: {
    backgroundColor: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  logoutButtonContainer: {
    marginTop: 20,
    width: "100%",
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
    color: "#333",
  },
  darkEditGoalInput: {
    backgroundColor: "#555",
    borderColor: "#777",
    color: "#eee",
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
  themeRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Distributes items to ends of the row
    alignItems: "center", // Aligns items vertically in the center
    marginBottom: 8, // Add some bottom margin for spacing if needed
  },
});

export default SettingsScreen;
