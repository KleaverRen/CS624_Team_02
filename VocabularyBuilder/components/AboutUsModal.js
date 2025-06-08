import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../contexts/ThemeContext"; // Assuming this path is correct

const AboutUsModal = ({ isVisible, onClose }) => {
  const { theme, colors } = useTheme(); // Access theme and colors from your context

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

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text
              style={[
                styles.modalTitle,
                theme === "dark" && styles.darkModalTitle,
              ]}
            >
              About LanguageLift
            </Text>
            <Text
              style={[
                styles.modalText,
                theme === "dark" && styles.darkModalText,
              ]}
            >
              LanguageLift is a mobile application dedicated to empowering
              international students in their journey to quickly and effectively
              master a second language. Our mission is to alleviate the
              challenges students face when adapting to new cultures and
              academic environments by providing an interactive and engaging
              learning platform.
            </Text>

            <Text
              style={[
                styles.modalSubtitle,
                theme === "dark" && styles.darkModalSubtitle,
              ]}
            >
              Our Mission
            </Text>
            <Text
              style={[
                styles.modalText,
                theme === "dark" && styles.darkModalText,
              ]}
            >
              LanguageLift aims to assist international students in acquiring a
              second language through key features that enhance engagement and
              efficiency. We are committed to offering a platform that supports
              self-paced learning and incorporates personalized learning paths,
              ensuring a seamless and persistent learning experience tailored
              for global learners.
            </Text>

            <Text
              style={[
                styles.modalSubtitle,
                theme === "dark" && styles.darkModalSubtitle,
              ]}
            >
              Our Developers
            </Text>
            <Text
              style={[
                styles.modalText,
                theme === "dark" && styles.darkModalText,
              ]}
            >
              LanguageLift was developed by a team of dedicated individuals from
              the Master of Computer Science program at City University of
              Seattle:
            </Text>
            <Text
              style={[
                styles.developerName,
                theme === "dark" && styles.darkDeveloperName,
              ]}
            >
              Chen Yuan
            </Text>
            <Text
              style={[
                styles.developerName,
                theme === "dark" && styles.darkDeveloperName,
              ]}
            >
              Meiru Zhang
            </Text>
            <Text
              style={[
                styles.developerName,
                theme === "dark" && styles.darkDeveloperName,
              ]}
            >
              Puqi Liu
            </Text>
            <Text
              style={[
                styles.developerName,
                theme === "dark" && styles.darkDeveloperName,
              ]}
            >
              Rothpanaseth Im
            </Text>

            <Text
              style={[
                styles.modalSubtitle,
                theme === "dark" && styles.darkModalSubtitle,
              ]}
            >
              Version
            </Text>
            <Text
              style={[
                styles.modalText,
                theme === "dark" && styles.darkModalText,
              ]}
            >
              v1.0.0
            </Text>
          </ScrollView>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dim background
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
    width: "90%", // Adjust width as needed
    maxHeight: "80%", // Limit height to prevent overflow
  },
  darkModalView: {
    backgroundColor: "#333",
    borderColor: "#555",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1, // Ensure the button is clickable
  },
  scrollContent: {
    paddingTop: 30, // Make space for the close button
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  darkModalTitle: {
    color: "#eee",
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
    color: "#555",
  },
  darkModalSubtitle: {
    color: "#ddd",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "justify",
    lineHeight: 22,
    color: "#666",
  },
  darkModalText: {
    color: "#bbb",
  },
  developerName: {
    fontSize: 15,
    marginLeft: 10,
    marginBottom: 5,
    color: "#777",
  },
  darkDeveloperName: {
    color: "#ccc",
  },
});

export default AboutUsModal;
