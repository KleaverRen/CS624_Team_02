import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "../contexts/ThemeContext";

const ProgressTrackerScreen = () => {
  const { theme } = useTheme();
  const [dailyWordGoal, setDailyWordGoal] = useState(null);
  const [wordsAddedTodayCount, setWordsAddedTodayCount] = useState(0);
  const [wordsLearnedCount, setWordsLearnedCount] = useState(0);
  const [quizScores, setQuizScores] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });

  useEffect(() => {
    loadDailyWordGoal();
    countWordsAddedToday();
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const storedVocabulary = await AsyncStorage.getItem("vocabularyList");
      if (storedVocabulary) {
        setWordsLearnedCount(JSON.parse(storedVocabulary).length);
      }

      const storedScores = await AsyncStorage.getItem("quizScores");
      if (storedScores) {
        const parsedScores = JSON.parse(storedScores);
        setQuizScores(parsedScores);

        // Prepare data for the chart
        const lastFiveScores = parsedScores.slice(-5).reverse(); // Get last 5, reversed for chronological order
        const labels = lastFiveScores.map((score) =>
          new Date(score.date).toLocaleDateString()
        );
        const dataPoints = lastFiveScores.map(
          (score) => (score.score / score.totalQuestions) * 100
        ); // Percentage score

        setChartData({
          labels: labels,
          datasets: [
            {
              data: dataPoints,
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Example color
              strokeWidth: 2,
            },
          ],
        });
      } else {
        setChartData({ labels: [], datasets: [{ data: [] }] }); // Initialize with empty data
      }
    } catch (error) {
      console.error("Error loading progress data:", error);
    }
  };

  const loadDailyWordGoal = async () => {
    try {
      const goal = await AsyncStorage.getItem("dailyWordGoal");
      if (goal) {
        setDailyWordGoal(parseInt(goal));
      }
    } catch (error) {
      console.error("Error loading daily word goal:", error);
    }
  };

  const countWordsAddedToday = async () => {
    try {
      const storedVocabulary = await AsyncStorage.getItem("vocabulary");
      const vocabulary = storedVocabulary ? JSON.parse(storedVocabulary) : [];
      const today = new Date().toISOString().slice(0, 10); // Get YYYY-MM-DD

      let count = 0;
      for (const wordObj of vocabulary) {
        if (wordObj.addedDate && wordObj.addedDate.startsWith(today)) {
          count++;
        }
      }
      setWordsAddedTodayCount(count);
    } catch (error) {
      console.error("Error counting words added today:", error);
    }
  };

  return (
    <View style={[styles.container, theme === "dark" && styles.darkContainer]}>
      <Text style={[styles.title, theme === "dark" && styles.darkTitle]}>
        Progress Tracker
      </Text>

      {/* Daily Word Goal Card */}
      <View style={[styles.card, theme === "dark" && styles.darkCard]}>
        <Text
          style={[styles.cardTitle, theme === "dark" && styles.darkCardTitle]}
        >
          Daily Word Goal
        </Text>
        {dailyWordGoal !== null ? (
          <Text
            style={[styles.cardText, theme === "dark" && styles.darkCardText]}
          >
            Goal: {dailyWordGoal} words
          </Text>
        ) : (
          <Text
            style={[
              styles.cardText,
              styles.italic,
              theme === "dark" && styles.darkCardText,
            ]}
          >
            Daily goal not set.
          </Text>
        )}
        {dailyWordGoal !== null && (
          <Text
            style={[styles.cardText, theme === "dark" && styles.darkCardText]}
          >
            Words added today: {wordsAddedTodayCount} / {dailyWordGoal}
          </Text>
        )}
        {dailyWordGoal !== null && (
          <View
            style={[
              styles.progressBarBackground,
              theme === "dark" && styles.darkProgressBarBackground,
            ]}
          >
            <View
              style={[
                styles.progressBar,
                { width: `${(wordsAddedTodayCount / dailyWordGoal) * 100}%` },
              ]}
            />
          </View>
        )}
      </View>

      <View
        // style={theme === "dark" ? styles.darkProgressItem : styles.progressItem}
        style={[
          styles.progressItem,
          theme === "dark" && styles.darkProgressItem,
        ]}
      >
        <Text
          style={[styles.cardTitle, theme === "dark" && styles.darkCardTitle]}
        >
          Recent Quiz Scores:
        </Text>
        {chartData.datasets[0].data.length > 0 ? (
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 70} // Adjust width based on screen width and padding
            height={220}
            yAxisSuffix="%"
            yAxisInterval={1} // optional
            chartConfig={{
              backgroundColor: "#e26a00",
              backgroundGradientFrom: "#fb8c00",
              backgroundGradientTo: "#ffa726",
              decimalPlaces: 0, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726",
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        ) : (
          <Text
            style={[
              styles.cardText,
              styles.italic,
              theme === "dark" && styles.darkCardText,
            ]}
          >
            No quiz scores yet to display a chart.
          </Text>
        )}
        {quizScores.length > 0 && (
          <View>
            <Text style={[styles.label, theme === "dark" && styles.darkLabel]}>
              Detailed Scores:
            </Text>
            {quizScores.slice(-5).map((scoreData, index) => (
              <Text
                key={index}
                style={[styles.score, theme === "dark" && styles.darkScore]}
              >
                {new Date(scoreData.date).toLocaleDateString()} -{" "}
                {scoreData.score} / {scoreData.totalQuestions}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 20,
    color: "#333",
  },
  darkTitle: {
    color: "#eee",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: "#444",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2.82,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#555",
  },
  darkCardTitle: {
    color: "#ddd",
  },
  cardText: {
    fontSize: 16,
    color: "#777",
    marginBottom: 4,
  },
  darkCardText: {
    color: "#bbb",
  },
  italic: {
    fontStyle: "italic",
  },
  progressBarBackground: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    height: 16,
    marginTop: 8,
    overflow: "hidden",
  },
  darkProgressBarBackground: {
    backgroundColor: "#666",
  },
  progressBar: {
    backgroundColor: "#4CAF50",
    height: 16,
    borderRadius: 8,
  },
  progressItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  darkProgressItem: {
    backgroundColor: "#444",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#555",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  darkLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#eee",
  },
  value: {
    fontSize: 16,
  },
  score: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  darkScore: {
    fontSize: 14,
    color: "#eee",
    marginBottom: 5,
  },
});

export default ProgressTrackerScreen;
