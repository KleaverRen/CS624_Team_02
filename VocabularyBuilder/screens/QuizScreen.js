// screens/QuizScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
} from "react-native";
import { getQuiz, submitQuiz, recordQuizResult } from "../utils/api";
import { useTheme } from "../contexts/ThemeContext";

const { width, height } = Dimensions.get("window");

const QuizScreen = () => {
  // New state to control if the quiz has started
  const [quizStarted, setQuizStarted] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  // isLoading is now false initially, as it only loads after "Start Quiz" is pressed
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const { colors, theme } = useTheme();

  // Function to fetch a new quiz and reset relevant states
  const fetchQuiz = useCallback(async () => {
    setIsLoading(true);
    setQuiz(null); // Clear previous quiz data
    setQuizResult(null); // Clear previous results
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    try {
      const response = await getQuiz(5);
      if (response && response.data) {
        setQuiz(response.data);
        setQuizStarted(true);
      } else {
        Alert.alert(
          "Error",
          "Failed to load quiz: No data received. Please try again."
        );
        setQuizStarted(false); // Revert to start screen if no data
      }
    } catch (error) {
      // If fetching fails, revert to the start screen
      setQuizStarted(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOptionSelect = (questionId, optionId) => {
    setUserAnswers((prevAnswers) => {
      const newAnswers = {
        ...prevAnswers,
        [questionId]: optionId,
      };
      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Check if all questions are answered
    if (Object.keys(userAnswers).length !== quiz.questions.length) {
      Alert.alert(
        "Incomplete Quiz",
        "Please answer all questions before submitting."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Prepare answers for the backend based on expected structure
      // The backend expects an array of objects, where each object has questionId and selectedOptionId.
      const answersForBackend = quiz.questions.map((q) => ({
        questionId: q._id, // Assuming q._id is the MongoDB ObjectId for the question
        selectedOptionId: userAnswers[q._id], // userAnswers should map question._id to selected option._id
      }));

      // 2. Call the backend API
      // Ensure 'quiz._id' is passed as the quizId, as that's what your backend expects
      const quizSubmitResponse = await submitQuiz(
        quiz.quizId, // Use quiz._id here, as per your backend's expectation (quizId parameter)
        answersForBackend
      );

      // 3. Validate and process the backend response
      if (
        !quizSubmitResponse ||
        !quizSubmitResponse.data ||
        !quizSubmitResponse.data.results
      ) {
        console.error(
          "Submit quiz response is missing expected 'data' or 'results' array."
        );
        Alert.alert(
          "Error",
          "Failed to get quiz results from the server. Please try again with full details from the backend."
        );
        if (quizSubmitResponse && quizSubmitResponse.data) {
          console.error("Received data:", quizSubmitResponse.data);
        }
        return;
      }

      const { score, totalQuestions, results } = quizSubmitResponse.data;

      const processedResults = results.map((r) => {
        // Find the original question object from the frontend's quiz state
        // This 'questionObj' is crucial as it holds the 'options' array
        const questionObj = quiz.questions.find((q) => q._id === r.questionId);

        // Determine the correctOptionId from the backend's 'r' object first,
        // then fallback to the 'questionObj' if the backend didn't explicitly send it.
        // The backend's 'results' array should ideally include 'correctOption.optionId'
        // or a direct 'correctOption.text'
        const backendCorrectOptionId = r.correctOption?.optionId;
        const backendCorrectOptionText = r.correctOption?.text;

        // Fallback to the original question object's correctOptionId
        const effectiveCorrectOptionId =
          backendCorrectOptionId || questionObj?.correctOptionId;

        // Find the correct option object from the frontend's 'questionObj.options'
        const correctOptionObj = questionObj?.options.find(
          (opt) => opt._id === effectiveCorrectOptionId
        );

        // Find the selected option object from the frontend's 'questionObj.options'
        // This assumes the backend sent 'r.selectedOption.optionId'
        const selectedOptionObj = questionObj?.options.find(
          (opt) => opt._id === r.selectedOption?.optionId
        );

        return {
          questionId: r.questionId,
          // Prefer backend's question text, fallback to frontend's question text
          question: { text: r.question?.text || questionObj?.text },
          selectedOption: {
            // Prefer backend's selected option text, fallback to frontend's object text, then "Not Answered"
            text:
              r.selectedOption?.text ||
              selectedOptionObj?.text ||
              "Not Answered",
          },
          correctOption: {
            // Use the determined finalCorrectOptionText
            // text: correctOptionObj.text,
            text:
              backendCorrectOptionText || correctOptionObj?.text || "Unknown",
          },
          isCorrect: r.isCorrect,
        };
      });

      // 4. Update frontend state with processed results
      setQuizResult({ score, totalQuestions, results: processedResults });
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to submit quiz. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------- Conditional Rendering -----------------------

  // 1. Show Loading Indicator if a quiz is being fetched
  if (isLoading && quizStarted) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading quiz...
        </Text>
      </View>
    );
  }

  // 2. Show Quiz Results Screen if quizResult is available
  if (quizResult) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.resultsContent}
      >
        <Text style={[styles.resultTitle, { color: colors.text }]}>
          Quiz Results
        </Text>
        <Text style={[styles.scoreText, { color: colors.primary }]}>
          Your Score: {quizResult.score} / {quizResult.totalQuestions}
        </Text>

        {quizResult.results.map((result, index) => (
          <View
            key={result.questionId}
            style={[
              styles.resultItem,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={[styles.questionText, { color: colors.text }]}>
              Q{index + 1}: {result.question.text}
            </Text>
            <Text style={[styles.yourAnswer, { color: colors.subText }]}>
              Your Answer: "{result.selectedOption?.text || "Not Answered"}"
            </Text>
            <Text style={[styles.correctAnswer, { color: colors.success }]}>
              Correct Answer: "{result.correctOption?.text}"
            </Text>
            {!result.isCorrect && (
              <Text style={[styles.incorrectMark, { color: colors.error }]}>
                Incorrect
              </Text>
            )}
            {result.isCorrect && (
              <Text style={[styles.correctMark, { color: colors.success }]}>
                Correct!
              </Text>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.retakeButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            fetchQuiz(); // Fetch a new quiz
          }}
        >
          <Text style={styles.retakeButtonText}>Retake Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.backToHomeButton,
            { backgroundColor: colors.buttonSecondary },
          ]}
          onPress={() => {
            console.log("Back to Home button pressed.");
            // Reset all state variables to their initial state
            setQuizStarted(false); // This is the key change: sets rendering back to the start screen
            setQuiz(null); // Clear quiz data
            setCurrentQuestionIndex(0); // Reset current question
            setUserAnswers({}); // Clear user's answers
            setIsLoading(false); // Reset loading state
            setIsSubmitting(false); // Reset submitting state
            setQuizResult(null); // Clear quiz results to show start screen
          }}
        >
          <Text style={[styles.backToHomeButtonText, { color: colors.text }]}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // 3. Show Start Quiz Screen if quiz hasn't started yet
  if (!quizStarted) {
    return (
      <View
        style={[
          styles.startScreenContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          Welcome to the Vocabulary Quiz!
        </Text>
        <Text style={[styles.instructionText, { color: colors.subText }]}>
          Click the button below to start your quiz.
        </Text>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            fetchQuiz(); // Start fetching the quiz data
          }}
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? (
            <ActivityIndicator color={colors.buttonText} />
          ) : (
            <Text style={styles.startButtonText}>Start Quiz</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // 4. Show Quiz Questions if quiz has started and data is loaded
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    // This case should ideally be caught by isLoading or empty quiz after fetch
    // But as a fallback, if somehow quizStarted is true but quiz is null/empty
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No quiz questions available for this session.
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            setQuizStarted(false); // Go back to start button
          }}
        >
          <Text style={styles.backButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.questionCounter, { color: colors.subText }]}>
        Question {currentQuestionIndex + 1} of {quiz.questions.length}
      </Text>
      <ScrollView contentContainerStyle={styles.questionContent}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          {currentQuestion.text}
        </Text>

        {currentQuestion.options.map((option) => {
          const isSelected = userAnswers[currentQuestion._id] === option._id;

          return (
            <TouchableOpacity
              key={option._id}
              style={[
                styles.optionButton,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : colors.cardBackground,
                  borderColor: isSelected ? colors.primary : colors.inputBorder,
                },
              ]}
              onPress={() =>
                handleOptionSelect(currentQuestion._id, option._id)
              }
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? colors.buttonText : colors.text,
                  },
                ]}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestionIndex === 0
              ? {}
              : { backgroundColor: colors.buttonSecondary },
          ]}
          onPress={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={[styles.navButtonText, { color: colors.buttonText }]}>
            Previous
          </Text>
        </TouchableOpacity>

        {!isLastQuestion ? (
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.primary }]}
            onPress={handleNextQuestion}
          >
            <Text style={[styles.navButtonText, { color: colors.buttonText }]}>
              Next
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.success }]}
            onPress={handleSubmitQuiz}
            disabled={isSubmitting}
          >
            <Text style={[styles.navButtonText, { color: colors.buttonText }]}>
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: width * 0.05,
  },
  emptyText: {
    fontSize: width * 0.05,
    textAlign: "center",
    marginBottom: height * 0.03,
  },
  backButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
  questionCounter: {
    fontSize: width * 0.04,
    textAlign: "right",
    marginBottom: height * 0.02,
  },
  questionContent: {
    flexGrow: 1,
    paddingBottom: height * 0.02,
  },
  questionText: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginBottom: height * 0.03,
  },
  optionButton: {
    padding: width * 0.04,
    borderRadius: 10,
    marginBottom: height * 0.015,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  optionText: {
    fontSize: width * 0.045,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: height * 0.03,
    paddingTop: height * 0.02,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  navButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.06,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: width * 0.01,
  },
  navButtonText: {
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
  resultsContent: {
    paddingBottom: height * 0.05,
  },
  resultTitle: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: height * 0.03,
  },
  scoreText: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: height * 0.03,
  },
  resultItem: {
    padding: width * 0.04,
    borderRadius: 10,
    marginBottom: height * 0.02,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  yourAnswer: {
    fontSize: width * 0.04,
    marginTop: height * 0.01,
  },
  correctAnswer: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    marginTop: height * 0.005,
  },
  incorrectMark: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: height * 0.01,
  },
  correctMark: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: height * 0.01,
  },
  retakeButton: {
    paddingVertical: height * 0.02,
    borderRadius: 10,
    alignItems: "center",
    marginTop: height * 0.03,
  },
  retakeButtonText: {
    color: "white",
    fontSize: width * 0.05,
    fontWeight: "bold",
  },
  backToHomeButton: {
    paddingVertical: height * 0.02,
    borderRadius: 10,
    alignItems: "center",
    marginTop: height * 0.02,
  },
  backToHomeButtonText: {
    fontSize: width * 0.05,
    fontWeight: "bold",
  },
  // --- New Styles for Start Screen ---
  startScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: width * 0.05,
  },
  welcomeText: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: height * 0.02,
  },
  instructionText: {
    fontSize: width * 0.045,
    textAlign: "center",
    marginBottom: height * 0.05,
  },
  startButton: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    color: "white",
    fontSize: width * 0.055,
    fontWeight: "bold",
  },
});

export default QuizScreen;
