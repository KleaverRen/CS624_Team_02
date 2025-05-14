import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../contexts/ThemeContext";

const DashboardScreen = () => {
  const { theme } = useContext(ThemeContext);

  const navigation = useNavigation();
  const [vocabularyCount, setVocabularyCount] = useState(0);
  const [lastQuizScore, setLastQuizScore] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const storedVocabulary = await AsyncStorage.getItem("vocabularyList");
      if (storedVocabulary) {
        setVocabularyCount(JSON.parse(storedVocabulary).length);
      }

      const storedScores = await AsyncStorage.getItem("quizScores");
      if (storedScores) {
        const parsedScores = JSON.parse(storedScores);
        if (parsedScores.length > 0) {
          setLastQuizScore(parsedScores[parsedScores.length - 1]);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  return (
    <View style={theme === "dark" ? styles.darkContainer : styles.container}>
      <Text style={theme === "dark" ? styles.darkTitle : styles.title}>
        Dashboard
      </Text>

      <View style={theme === "dark" ? styles.darkInfoCard : styles.infoCard}>
        <Text
          style={theme === "dark" ? styles.darkCardTitle : styles.cardTitle}
        >
          Vocabulary Overview
        </Text>
        <Text style={theme === "dark" ? styles.darkCardText : styles.cardText}>
          Total words learned: {vocabularyCount}
        </Text>
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => navigation.navigate("VocabularyTab")}
        >
          <Text style={styles.viewMoreText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={theme === "dark" ? styles.darkInfoCard : styles.infoCard}>
        <Text
          style={theme === "dark" ? styles.darkCardTitle : styles.cardTitle}
        >
          Recent Quiz
        </Text>
        {lastQuizScore ? (
          <Text style={styles.cardText}>
            Last score: {lastQuizScore.score} / {lastQuizScore.totalQuestions} (
            {new Date(lastQuizScore.date).toLocaleDateString()})
          </Text>
        ) : (
          <Text style={styles.cardText}>No quizzes taken yet.</Text>
        )}
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => navigation.navigate("QuizTab")}
        >
          <Text style={styles.viewMoreText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>

      <View style={theme === "dark" ? styles.darkInfoCard : styles.infoCard}>
        <Text style={theme === "dark" ? styles.darkCardText : styles.cardTitle}>
          Learning Progress
        </Text>
        <Text style={theme === "dark" ? styles.darkCardText : styles.cardText}>
          Check your progress overview.
        </Text>
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => navigation.navigate("ProgressTab")}
        >
          <Text style={styles.viewMoreText}>View Progress</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  darkContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#222",
  },
  darkTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#fff",
  },
  darkCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  darkCardText: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  infoCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  darkInfoCard: {
    backgroundColor: "#444",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555",
  },
  cardText: {
    fontSize: 16,
    color: "#777",
    marginBottom: 15,
  },
  viewMoreButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  viewMoreText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default DashboardScreen;
