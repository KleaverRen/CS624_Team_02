import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext"; // Assuming you have a ThemeContext

const { width, height } = Dimensions.get("window");

const QuizResultDetailModal = ({ isVisible, onClose, quizResult }) => {
  const { colors } = useTheme();
  if (!quizResult) {
    return null; // Don't render if no quiz result is selected
  }

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

  const calculatePercentage = (score, total) => {
    if (total === 0) return "0%";
    return `${((score / total) * 100).toFixed(0)}%`;
  };

  return (
    <Modal
      animationType="fade" // Can be "none", "slide", "fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose} // For Android back button
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalView,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                Quiz Details
              </Text>

              <ScrollView style={styles.scrollView}>
                <Text style={[styles.detailText, { color: colors.text }]}>
                  Date:{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {formatDate(quizResult.createdAt)}
                  </Text>
                </Text>
                <Text style={[styles.detailText, { color: colors.text }]}>
                  Score:{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {quizResult.score} / {quizResult.totalQuestions} (
                    {calculatePercentage(
                      quizResult.score,
                      quizResult.totalQuestions
                    )}
                    )
                  </Text>
                </Text>
                <Text style={[styles.detailText, { color: colors.text }]}>
                  Total Questions:{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {quizResult.totalQuestions}
                  </Text>
                </Text>

                <Text style={[styles.resultsHeader, { color: colors.text }]}>
                  Your Answers:
                </Text>
                {quizResult.results && quizResult.results.length > 0 ? (
                  quizResult.results.map((result, index) => (
                    <View
                      key={index}
                      style={[
                        styles.questionResult,
                        {
                          borderBottomColor: colors.border,
                          backgroundColor: result.isCorrect
                            ? colors.successBackground // Assuming you have this color in your theme
                            : colors.errorBackground, // Assuming you have this color in your theme
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.questionText,
                          { color: colors.textContrast },
                        ]}
                      >
                        Q{index + 1}: {result.question.text}
                      </Text>
                      <Text
                        style={[
                          styles.answerText,
                          { color: colors.textContrast },
                        ]}
                      >
                        Your Answer:{" "}
                        <Text style={{ fontWeight: "bold" }}>
                          {result.selectedOption.text}
                        </Text>
                      </Text>
                      <Text
                        style={[
                          styles.answerText,
                          { color: colors.textContrast },
                        ]}
                      >
                        Correct Answer:{" "}
                        <Text style={{ fontWeight: "bold" }}>
                          {result.correctOption.text}
                        </Text>
                      </Text>
                      <Text
                        style={[
                          styles.statusText,
                          { color: colors.textContrast },
                        ]}
                      >
                        Status:{" "}
                        <Text
                          style={{
                            fontWeight: "bold",
                            color: result.isCorrect
                              ? colors.successText // Assuming you have this color
                              : colors.errorText, // Assuming you have this color
                          }}
                        >
                          {result.isCorrect ? "Correct" : "Incorrect"}
                        </Text>
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.detailText, { color: colors.subText }]}>
                    No detailed question results available.
                  </Text>
                )}
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)", // Semi-transparent background
  },
  modalView: {
    margin: width * 0.05,
    borderRadius: 20,
    padding: width * 0.05,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    maxHeight: "80%", // Limit height to prevent overflow
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginBottom: height * 0.02,
    textAlign: "center",
  },
  scrollView: {
    width: "100%",
    marginBottom: height * 0.02,
  },
  detailText: {
    fontSize: width * 0.045,
    marginBottom: height * 0.01,
    textAlign: "left",
    width: "100%",
  },
  resultsHeader: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginTop: height * 0.02,
    marginBottom: height * 0.015,
    textAlign: "left",
    width: "100%",
  },
  questionResult: {
    padding: width * 0.03,
    borderRadius: 8,
    marginBottom: height * 0.015,
    borderBottomWidth: 1,
  },
  questionText: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    marginBottom: height * 0.005,
  },
  answerText: {
    fontSize: width * 0.038,
    marginBottom: height * 0.003,
  },
  statusText: {
    fontSize: width * 0.038,
    fontWeight: "bold",
    marginTop: height * 0.005,
  },
  closeButton: {
    borderRadius: 10,
    padding: height * 0.015,
    elevation: 2,
    marginTop: height * 0.01,
    width: "50%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: width * 0.045,
  },
});

export default QuizResultDetailModal;
