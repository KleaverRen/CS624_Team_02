import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";
import { ThemeContext } from "../contexts/ThemeContext";

const ProgressTrackerScreen = () => {
  const { theme } = useContext(ThemeContext);

  const [wordsLearnedCount, setWordsLearnedCount] = useState(0);
  const [quizScores, setQuizScores] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });

  useEffect(() => {
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

  return (
    <View style={theme === "dark" ? styles.darkContainer : styles.container}>
      <View
        style={theme === "dark" ? styles.darkProgressItem : styles.progressItem}
      >
        <Text style={theme === "dark" ? styles.darkLabel : styles.label}>
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
          <Text>No quiz scores yet to display a chart.</Text>
        )}
        {quizScores.length > 0 && (
          <View>
            <Text style={theme === "dark" ? styles.darkLabel : styles.label}>
              Detailed Scores:
            </Text>
            {quizScores.slice(-5).map((scoreData, index) => (
              <Text
                key={index}
                style={theme === "dark" ? styles.darkScore : styles.score}
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
    backgroundColor: "#f0f0f0",
  },
  darkContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#333",
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
