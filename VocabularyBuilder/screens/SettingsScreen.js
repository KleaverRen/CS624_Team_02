import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../contexts/ThemeContext";

const SettingsScreen = () => {
  const { theme, toggleTheme } = useContext(ThemeContext); // Access theme and toggleTheme

  const [dailyWordGoal, setDailyWordGoal] = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

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
          Username: (Not yet implemented)
        </Text>
        <TouchableOpacity style={styles.actionButton}>
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
        <Text style={[styles.item, theme === "dark" && styles.darkItem]}>
          Theme: {theme === "light" ? "Light" : "Dark"}
        </Text>
        <TouchableOpacity style={styles.actionButton} onPress={toggleTheme}>
          <Text style={styles.actionButtonText}>
            Switch to {theme === "light" ? "Dark" : "Light"} Theme
          </Text>
        </TouchableOpacity>
        {/* <Text style={[styles.item, theme === "dark" && styles.darkItem]}>
          Notifications: (On)
        </Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Toggle Notifications</Text>
        </TouchableOpacity> */}
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
});

export default SettingsScreen;
