const Vocabulary = require("../models/vocabulary");
const Quiz = require("../models/quiz");
const QuizResult = require("../models/quizResult");
const IncorrectAnswer = require("../models/incorrectAnswer");

const generateQuizTitle = () => {
  const prefixes = [
    "Vocabulary Challenge:",
    "Word Power Quiz:",
    "Lexicon Test:",
    "Mindful Words:",
    "Daily Dose of Vocab:",
    "The Great Word Hunt:",
    "Brain Boost:",
    "Verbal Voyage:",
    "Word Wizard:",
    "Language Ladder:",
  ];

  const suffixes = [
    "Level Up!",
    "Sharpen Your Lexicon",
    "Expand Your Vocabulary",
    "Test Your Knowledge",
    "Word Mastery",
    "The Ultimate Word Challenge",
    "Are You a Wordsmith?",
    "Unlock New Words",
    "The Definition Derby",
    "Conquer the Language!",
  ];

  const randomPrefixIndex = Math.floor(Math.random() * prefixes.length);
  const randomSuffixIndex = Math.floor(Math.random() * suffixes.length);

  return `${prefixes[randomPrefixIndex]} ${suffixes[randomSuffixIndex]}`;
};

const generateQuiz = async (userId, numberOfQuestions = 5) => {
  try {
    const userVocabulary = await Vocabulary.find({ userId });

    if (userVocabulary.length < numberOfQuestions) {
      return [];
    }

    const selectedWords = [];
    const shuffledVocabulary = [...userVocabulary].sort(
      () => 0.5 - Math.random()
    );
    selectedWords.push(...shuffledVocabulary.slice(0, numberOfQuestions));

    const quizQuestions = selectedWords.map((wordObj) => {
      const correctAnswer = wordObj.definition;
      const correctWord = wordObj.word;

      const incorrectOptions = userVocabulary
        .filter(
          (otherWordObj) =>
            otherWordObj._id.toString() !== wordObj._id.toString()
        )
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((item) => item.definition);

      const options = [...incorrectOptions, correctAnswer].sort(
        () => 0.5 - Math.random()
      );

      return {
        word: correctWord,
        options: options,
        correctAnswer: correctAnswer,
      };
    });

    return quizQuestions;
  } catch (error) {
    console.error("Error generating dynamic quiz:", error);
    throw new Error("Failed to generate quiz from vocabulary");
  }
};

// Get a quiz for the user and save it
exports.getQuiz = async (req, res) => {
  const userId = req.userId;
  const numberOfQuestions = parseInt(req.query.count) || 5;

  try {
    const quizQuestions = await generateQuiz(userId, numberOfQuestions);

    if (quizQuestions.length === 0) {
      return res
        .status(400)
        .json({ message: "Not enough words to generate a quiz." });
    }

    const quizTitle = generateQuizTitle();

    // Save the generated quiz
    const newQuiz = new Quiz({
      userId: userId,
      title: quizTitle,
      questions: quizQuestions,
    });
    await newQuiz.save();

    res.status(200).json({ quizId: newQuiz._id, title: quizTitle }); // Return the quizId and title
  } catch (error) {
    console.error("Error generating and saving quiz:", error);
    res.status(500).json({
      message: "Failed to generate and save quiz",
      error: error.message,
    });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error getting quiz by ID:", error);
    res
      .status(500)
      .json({ message: "Failed to get quiz", error: error.message });
  }
};

// Submit quiz answers based on the saved quiz and save incorrect answers
exports.submitQuiz = async (req, res) => {
  const userId = req.userId;
  const { quizId, answers } = req.body;

  try {
    // Retrieve the saved quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quizQuestions = quiz.questions;

    let score = 0;
    const incorrectAnswers = [];

    for (const question of quizQuestions) {
      const userAnswer = answers.find(
        (ans) => ans.word === question.word
      )?.userAnswer;
      if (userAnswer && userAnswer === question.correctAnswer) {
        score++;
      } else if (userAnswer) {
        // Save incorrect answer
        incorrectAnswers.push({
          quizId: quizId,
          word: question.word,
          userAnswer: userAnswer,
          correctAnswer: question.correctAnswer,
        });
      }
    }

    const totalQuestions = quizQuestions.length;

    // Save the quiz result
    const newQuizResult = new QuizResult({
      userId: userId,
      score: score,
      totalQuestions: totalQuestions,
    });
    await newQuizResult.save();

    // Save incorrect answers
    if (incorrectAnswers.length > 0) {
      await IncorrectAnswer.insertMany(incorrectAnswers);
    }

    // Delete the quiz after submission
    await Quiz.findByIdAndDelete(quizId);

    res.status(200).json({
      score,
      totalQuestions,
      message: "Quiz submitted and result saved successfully",
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res
      .status(500)
      .json({ message: "Failed to submit quiz", error: error.message });
  }
};

// Get incorrect answers for a user (all quizzes)
exports.getIncorrectAnswers = async (req, res) => {
  const userId = req.userId;

  try {
    // Find all quizzes taken by the user
    const quizResults = await QuizResult.find({ userId }).distinct("quizId");

    // Find all incorrect answers for those quizzes
    const incorrectAnswers = await IncorrectAnswer.find({
      quizId: { $in: quizResults },
    }).sort({ createdAt: -1 });

    res.status(200).json(incorrectAnswers);
  } catch (error) {
    console.error("Error getting incorrect answers:", error);
    res
      .status(500)
      .json({
        message: "Failed to get incorrect answers",
        error: error.message,
      });
  }
};

// Get incorrect answers for a specific quiz
exports.getIncorrectAnswersByQuiz = async (req, res) => {
  const { quizId } = req.params;
  const userId = req.userId; // Optionally verify if the quiz belongs to the user

  try {
    // Optionally verify if the quiz belongs to the user
    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.userId.toString() !== userId) {
      return res
        .status(404)
        .json({ message: "Quiz not found or does not belong to the user" });
    }

    const incorrectAnswers = await IncorrectAnswer.find({
      quizId: quizId,
    }).sort({ createdAt: -1 });
    res.status(200).json(incorrectAnswers);
  } catch (error) {
    console.error("Error getting incorrect answers for quiz:", error);
    res
      .status(500)
      .json({
        message: "Failed to get incorrect answers for this quiz",
        error: error.message,
      });
  }
};
