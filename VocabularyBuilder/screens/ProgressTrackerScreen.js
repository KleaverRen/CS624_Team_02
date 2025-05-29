import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getQuizResults, getOverallProgress } from "../utils/api";
import { useTheme } from "../contexts/ThemeContext";
import QuizResultDetailModal from "../components/QuizResultDetailModal"; // Import the new modal component

const { width, height } = Dimensions.get("window");

const ProgressTrackerScreen = () => {
  const [overallProgress, setOverallProgress] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [isLoadingOverall, setIsLoadingOverall] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [selectedQuizResult, setSelectedQuizResult] = useState(null); // State for selected quiz result

  const { colors, theme } = useTheme();

  const fetchOverallProgress = useCallback(async () => {
    setIsLoadingOverall(true);
    setErrorMessage("");
    try {
      const response = await getOverallProgress();
      setOverallProgress(response.data);
    } catch (error) {
      console.error(
        "Error fetching overall progress:",
        error.response?.data || error.message
      );
      setErrorMessage("Failed to load overall progress.");
      Alert.alert(
        "Error",
        "Failed to load overall progress. Please try again later."
      );
    } finally {
      setIsLoadingOverall(false);
    }
  }, []);

  const fetchQuizHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setErrorMessage("");
    try {
      const response = await getQuizResults();
      setQuizHistory(response.data);
    } catch (error) {
      console.error(
        "Error fetching quiz history:",
        error.response?.data || error.message
      );
      setErrorMessage("Failed to load quiz history.");
      Alert.alert(
        "Error",
        "Failed to load quiz history. Please try again later."
      );
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOverallProgress();
      fetchQuizHistory();
      return () => {};
    }, [fetchOverallProgress, fetchQuizHistory])
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to open the modal with the selected quiz result
  const openQuizResultDetail = (quizResult) => {
    setSelectedQuizResult(quizResult);
    setIsModalVisible(true);
  };

  // Function to close the modal
  const closeQuizResultDetail = () => {
    setIsModalVisible(false);
    setSelectedQuizResult(null); // Clear selected result when closing
  };

  if (isLoadingOverall || isLoadingHistory) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading progress...
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.error }]}>
          {errorMessage}
        </Text>
        <TouchableOpacity
          onPress={() => {
            fetchOverallProgress();
            fetchQuizHistory();
          }}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Your Progress</Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.inputBorder,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.primary }]}>
          Overall Statistics
        </Text>
        {overallProgress ? (
          <>
            <Text style={[styles.statText, { color: colors.text }]}>
              Quizzes Taken:{" "}
              <Text style={{ fontWeight: "bold" }}>
                {overallProgress.totalQuizzesTaken}
              </Text>
            </Text>
            <Text style={[styles.statText, { color: colors.text }]}>
              Average Score:{" "}
              <Text style={{ fontWeight: "bold" }}>
                {overallProgress.averageScore
                  ? overallProgress.averageScore.toFixed(2)
                  : "0.00"}
              </Text>
            </Text>
          </>
        ) : (
          <Text style={[styles.statText, { color: colors.subText }]}>
            No overall data available.
          </Text>
        )}
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.inputBorder,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.primary }]}>
          Quiz History
        </Text>
        {quizHistory.length > 0 ? (
          quizHistory.map((quizResult, index) => (
            <TouchableOpacity
              key={quizResult._id || index}
              style={[styles.historyItem, { borderBottomColor: colors.border }]}
              onPress={() => openQuizResultDetail(quizResult)} // Add onPress handler here
            >
              <View style={styles.historyItemContent}>
                <Text
                  style={[
                    styles.historyItemText,
                    { color: colors.text, fontWeight: "bold" },
                  ]}
                >
                  Quiz on {formatDate(quizResult.createdAt)}
                </Text>
                <Text
                  style={[styles.historyItemText, { color: colors.subText }]}
                >
                  Score: {quizResult.score} / {quizResult.totalQuestions}
                </Text>
                {quizResult.results && (
                  <Text
                    style={[
                      styles.historyItemText,
                      { color: colors.subText, fontSize: width * 0.035 },
                    ]}
                  >
                    Correct:{" "}
                    {quizResult.results.filter((r) => r.isCorrect).length} |
                    Incorrect:{" "}
                    {quizResult.results.filter((r) => !r.isCorrect).length}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.statText, { color: colors.subText }]}>
            No quiz history available yet.
          </Text>
        )}
      </View>

      {/* Quiz Detail Modal */}
      <QuizResultDetailModal
        isVisible={isModalVisible}
        onClose={closeQuizResultDetail}
        quizResult={selectedQuizResult}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: height * 0.02,
    fontSize: width * 0.045,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: width * 0.05,
  },
  errorText: {
    fontSize: width * 0.05,
    textAlign: "center",
    marginBottom: height * 0.03,
  },
  retryButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: height * 0.03,
  },
  card: {
    borderRadius: 10,
    padding: width * 0.04,
    marginBottom: height * 0.03,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: width * 0.055,
    fontWeight: "bold",
    marginBottom: height * 0.015,
  },
  statText: {
    fontSize: width * 0.045,
    marginBottom: height * 0.01,
  },
  historyItem: {
    paddingVertical: height * 0.015,
    borderBottomWidth: 1,
    marginBottom: height * 0.01,
  },
  historyItemContent: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  historyItemText: {
    fontSize: width * 0.04,
    marginBottom: height * 0.005,
  },
});

export default ProgressTrackerScreen;
