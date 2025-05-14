import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../contexts/ThemeContext";

const NUMBER_OF_QUESTIONS = 5; // You can adjust this number

const QuizScreen = () => {
  const { theme } = useContext(ThemeContext);

  const [vocabulary, setVocabulary] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [reviewing, setReviewing] = useState(false);
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [reviewingSkipped, setReviewingSkipped] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);

  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = async () => {
    try {
      const storedVocabulary = await AsyncStorage.getItem("vocabularyList");
      if (storedVocabulary) {
        setVocabulary(JSON.parse(storedVocabulary));
      }
    } catch (error) {
      console.error("Error loading vocabulary for quiz:", error);
    }
  };

  const generateQuiz = () => {
    if (vocabulary.length < NUMBER_OF_QUESTIONS) {
      alert(
        `Please add at least ${NUMBER_OF_QUESTIONS} vocabulary words to start the quiz.`
      );
      return;
    }

    const shuffledVocabulary = [...vocabulary].sort(() => Math.random() - 0.5);
    const quizVocabulary = shuffledVocabulary.slice(0, NUMBER_OF_QUESTIONS);
    setVocabulary(quizVocabulary);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizFinished(false);
    setUserAnswer("");
    generateQuestion(quizVocabulary[0]);
  };

  const generateQuestion = (wordObj) => {
    const questionFormat =
      Math.random() < 0.5 ? "definition-to-word" : "word-to-definition";
    const questionType =
      Math.random() < 0.5 ? "multiple-choice" : "fill-in-the-blank";

    if (questionFormat === "word-to-definition") {
      if (questionType === "multiple-choice") {
        const incorrectOptions = vocabulary
          .filter((v) => v.definition !== wordObj.definition)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((v) => v.definition);

        setCurrentQuestion({
          type: "multiple-choice",
          format: "word-to-definition",
          word: wordObj.word,
          correctAnswer: wordObj.definition,
          options: [wordObj.definition, ...incorrectOptions].sort(
            () => Math.random() - 0.5
          ),
        });
      } else {
        setCurrentQuestion({
          type: "fill-in-the-blank",
          format: "word-to-definition",
          word: wordObj.word,
          correctAnswer: wordObj.definition,
        });
      }
    } else {
      // definition-to-word format
      if (questionType === "multiple-choice") {
        const incorrectOptions = vocabulary
          .filter((v) => v.word !== wordObj.word)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((v) => v.word);

        setCurrentQuestion({
          type: "multiple-choice",
          format: "definition-to-word",
          definition: wordObj.definition,
          correctAnswer: wordObj.word,
          options: [wordObj.word, ...incorrectOptions].sort(
            () => Math.random() - 0.5
          ),
        });
      } else {
        setCurrentQuestion({
          type: "fill-in-the-blank",
          format: "definition-to-word",
          definition: wordObj.definition,
          correctAnswer: wordObj.word,
        });
      }
    }
    setUserAnswer("");
  };

  const handleAnswer = async (selectedAnswer) => {
    if (!currentQuestion || isFeedbackVisible) return; // Prevent multiple submissions

    setIsFeedbackVisible(true);
    let isCorrect = false;
    let correctAnswerText = "";

    if (currentQuestion.type === "multiple-choice") {
      isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      correctAnswerText = currentQuestion.correctAnswer;
    } else if (currentQuestion.type === "fill-in-the-blank") {
      isCorrect =
        selectedAnswer.trim().toLowerCase() ===
        currentQuestion.correctAnswer.toLowerCase();
      correctAnswerText = currentQuestion.correctAnswer;
    }

    if (isCorrect) {
      setScore(score + 1);
      setFeedback("Correct!");
    } else {
      setIncorrectAnswers((prevIncorrect) => [
        ...prevIncorrect,
        { question: currentQuestion, userAnswer: selectedAnswer },
      ]);
      setFeedback(`Incorrect. The correct answer was: ${correctAnswerText}`);
    }

    // Move to the next question after a short delay
    setTimeout(async () => {
      setIsFeedbackVisible(false);
      setUserAnswer(""); // Clear answer for the next question
      if (currentQuestionIndex < NUMBER_OF_QUESTIONS - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        generateQuestion(vocabulary[currentQuestionIndex + 1]);
      } else {
        setQuizFinished(true);
        // Store the quiz result (existing code)
        try {
          const now = new Date();
          const quizResult = {
            score: score,
            totalQuestions: NUMBER_OF_QUESTIONS,
            date: now.toISOString(),
          };

          const existingScores = await AsyncStorage.getItem("quizScores");
          const scoresArray = existingScores ? JSON.parse(existingScores) : [];
          scoresArray.push(quizResult);

          await AsyncStorage.setItem("quizScores", JSON.stringify(scoresArray));
          console.log("Quiz result saved:", quizResult);
        } catch (error) {
          console.error("Error saving quiz score:", error);
        }
      }
    }, 1500); // Adjust the delay (in milliseconds) as needed
  };

  const handleSkipQuestion = () => {
    if (!skippedQuestions.includes(currentQuestionIndex)) {
      setSkippedQuestions([...skippedQuestions, currentQuestionIndex]);
    }
    if (currentQuestionIndex < NUMBER_OF_QUESTIONS - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      generateQuestion(vocabulary[currentQuestionIndex + 1]);
      setUserAnswer(""); // Clear the user's answer for the new question
    } else {
      setQuizFinished(true); // If it's the last question, finish the quiz after skipping
    }
  };

  if (reviewing) {
    return (
      <View
        style={theme === "dark" ? styles.darkContainer : styles.reviewContainer}
      >
        <Text
          style={theme === "dark" ? styles.darkReviewTitle : styles.reviewTitle}
        >
          Review Incorrect Answers
        </Text>
        {incorrectAnswers.map((item, index) => (
          <View key={index} style={styles.incorrectItem}>
            <Text style={styles.incorrectQuestion}>
              Question: {item.question.word}
            </Text>
            <Text style={styles.yourAnswer}>
              Your Answer: {item.userAnswer}
            </Text>
            <Text style={styles.correctAnswer}>
              Correct Answer: {item.question.correctAnswer}
            </Text>
          </View>
        ))}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => setReviewing(false)}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (reviewingSkipped) {
    const skippedVocabulary = vocabulary.filter((_, index) =>
      skippedQuestions.includes(index)
    );
    return (
      <View
        style={theme === "dark" ? styles.darkContainer : styles.reviewContainer}
      >
        <Text
          style={theme === "dark" ? styles.darkReviewTitle : styles.reviewTitle}
        >
          Skipped Questions
        </Text>
        {skippedVocabulary.map((item, index) => (
          <View key={index} style={styles.skippedItem}>
            <Text style={styles.skippedQuestion}>Question: {item.word}</Text>
            <Text style={styles.correctAnswer}>
              Correct Answer: {item.definition}
            </Text>
            {/* Optionally, you could allow the user to answer these now */}
          </View>
        ))}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => setReviewingSkipped(false)}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (quizFinished) {
    return (
      <View style={theme === "dark" ? styles.darkContainer : styles.container}>
        <Text style={theme === "dark" ? styles.darkTitle : styles.title}>
          Quiz Finished!
        </Text>
        <Text
          style={theme === "dark" ? styles.darkResultText : styles.resultText}
        >
          Your score: {score} / {NUMBER_OF_QUESTIONS}
        </Text>
        {incorrectAnswers.length > 0 && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => setReviewing(true)}
          >
            <Text style={styles.reviewButtonText}>
              Review Incorrect Answers
            </Text>
          </TouchableOpacity>
        )}
        {skippedQuestions.length > 0 && (
          <TouchableOpacity
            style={styles.reviewSkippedButton}
            onPress={() => setReviewingSkipped(true)}
          >
            <Text style={styles.reviewSkippedButtonText}>
              Review Skipped Questions
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            setReviewing(false);
            setIncorrectAnswers([]);
            setSkippedQuestions([]); // Reset skipped questions on try again
            generateQuiz();
          }}
        >
          <Text style={styles.startButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={theme === "dark" ? styles.darkContainer : styles.container}>
        <Text style={theme === "dark" ? styles.darkTitle : styles.title}>
          Daily Quiz
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={generateQuiz}>
          <Text style={styles.startButtonText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={theme === "dark" ? styles.darkContainer : styles.container}>
      <Text
        style={
          theme === "dark" ? styles.darkQuestionNumber : styles.questionNumber
        }
      >{`Question ${currentQuestionIndex + 1} / ${NUMBER_OF_QUESTIONS}`}</Text>
      <Text
        style={theme === "dark" ? styles.darkQuestionText : styles.questionText}
      >
        {currentQuestion.format === "word-to-definition"
          ? "What is the definition of:"
          : "What is the word for the following definition:"}
      </Text>
      <Text
        style={theme === "dark" ? styles.darkWordToDefine : styles.wordToDefine}
      >
        {currentQuestion.format === "word-to-definition"
          ? currentQuestion.word
          : currentQuestion.definition}
      </Text>

      {currentQuestion.type === "multiple-choice" &&
        currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              isFeedbackVisible &&
                option === currentQuestion.correctAnswer &&
                styles.correctAnswerButton,
              isFeedbackVisible &&
                currentQuestion.type === "multiple-choice" &&
                userAnswer === option &&
                userAnswer !== currentQuestion.correctAnswer &&
                styles.incorrectAnswerButton,
            ]}
            onPress={() => handleAnswer(option)}
            disabled={isFeedbackVisible}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

      {currentQuestion.type === "fill-in-the-blank" && (
        <View style={styles.fillInBlankContainer}>
          <TextInput
            style={styles.fillInBlankInput}
            placeholder="Your answer"
            value={userAnswer}
            onChangeText={(text) => setUserAnswer(text)}
            editable={!isFeedbackVisible}
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => handleAnswer(userAnswer.trim().toLowerCase())}
            disabled={isFeedbackVisible}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}

      {isFeedbackVisible && (
        <Text
          style={
            feedback.startsWith("Correct")
              ? styles.correctFeedbackText
              : styles.incorrectFeedbackText
          }
        >
          {feedback}
        </Text>
      )}

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkipQuestion}
        disabled={isFeedbackVisible}
      >
        <Text style={styles.skipButtonText}>Skip Question</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#e0f7fa",
    alignItems: "center",
    justifyContent: "center",
  },
  darkContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  darkTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#eee",
  },
  darkTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  startButton: {
    backgroundColor: "green",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  questionText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  darkQuestionText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    color: "#eee",
  },
  wordToDefine: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    fontStyle: "italic",
  },
  darkWordToDefine: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    fontStyle: "italic",
    color: "#eee",
  },
  optionButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  optionText: {
    fontSize: 16,
  },
  fillInBlankContainer: {
    width: "80%",
    marginTop: 20,
    alignItems: "center",
  },
  fillInBlankInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 5,
    width: "100%",
  },
  submitButton: {
    backgroundColor: "blue",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  questionNumber: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  darkQuestionNumber: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#eee",
  },
  resultText: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
  },
  darkResultText: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#eee",
  },
  // Reviewing Style
  reviewContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  darkReviewTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#eee",
  },
  incorrectItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  incorrectQuestion: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  yourAnswer: {
    fontSize: 14,
    color: "red",
    marginBottom: 3,
  },
  correctAnswer: {
    fontSize: 14,
    color: "green",
  },
  doneButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  doneButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  reviewButton: {
    backgroundColor: "#ffc107", // Amber color for review button
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  reviewButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Skip Button
  skipButton: {
    backgroundColor: "#6c757d", // Grey color for skip button
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
    width: "50%",
  },
  skipButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  reviewSkippedButton: {
    backgroundColor: "#17a2b8", // Info color for review skipped button
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  reviewSkippedButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  skippedItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  skippedQuestion: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  // Correct and Incorrect Feedback
  correctFeedbackText: {
    color: "green",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
  },
  incorrectFeedbackText: {
    color: "red",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
  },
  correctAnswerButton: {
    backgroundColor: "rgba(0, 255, 0, 0.3)", // Light green
  },
  incorrectAnswerButton: {
    backgroundColor: "rgba(255, 0, 0, 0.3)", // Light red
  },
});

export default QuizScreen;
