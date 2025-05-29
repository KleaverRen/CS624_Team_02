import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";

import dashboardStyles from "../styles/dashboardStyles";

const DashboardScreen = () => {
  const { theme, colors } = useTheme();
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
    <View
      style={
        theme === "dark"
          ? dashboardStyles.darkContainer
          : dashboardStyles.container
      }
    >
      <Text
        style={
          theme === "dark" ? dashboardStyles.darkTitle : dashboardStyles.title
        }
      >
        Dashboard
      </Text>

      <View
        style={[
          dashboardStyles.infoCard,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <Text
          style={
            theme === "dark"
              ? dashboardStyles.darkCardTitle
              : dashboardStyles.cardTitle
          }
        >
          Vocabulary Overview
        </Text>
        <Text
          style={
            theme === "dark"
              ? dashboardStyles.darkCardText
              : dashboardStyles.cardText
          }
        >
          Total words learned: {vocabularyCount}
        </Text>
        <TouchableOpacity
          style={dashboardStyles.viewMoreButton}
          onPress={() => navigation.navigate("VocabularyTab")}
        >
          <Text style={dashboardStyles.viewMoreText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          dashboardStyles.infoCard,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <Text
          style={
            theme === "dark"
              ? dashboardStyles.darkCardTitle
              : dashboardStyles.cardTitle
          }
        >
          Recent Quiz
        </Text>
        {lastQuizScore ? (
          <Text style={dashboardStyles.cardText}>
            Last score: {lastQuizScore.score} / {lastQuizScore.totalQuestions} (
            {new Date(lastQuizScore.date).toLocaleDateString()})
          </Text>
        ) : (
          <Text
            style={
              theme === "dark"
                ? dashboardStyles.darkCardText
                : dashboardStyles.cardText
            }
          >
            No quizzes taken yet.
          </Text>
        )}
        <TouchableOpacity
          style={dashboardStyles.viewMoreButton}
          onPress={() => navigation.navigate("QuizTab")}
        >
          <Text style={dashboardStyles.viewMoreText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          dashboardStyles.infoCard,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <Text
          style={
            theme === "dark"
              ? dashboardStyles.darkCardText
              : dashboardStyles.cardTitle
          }
        >
          Learning Progress
        </Text>
        <Text
          style={
            theme === "dark"
              ? dashboardStyles.darkCardText
              : dashboardStyles.cardText
          }
        >
          Check your progress overview.
        </Text>
        <TouchableOpacity
          style={dashboardStyles.viewMoreButton}
          onPress={() => navigation.navigate("ProgressTab")}
        >
          <Text style={dashboardStyles.viewMoreText}>View Progress</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DashboardScreen;
