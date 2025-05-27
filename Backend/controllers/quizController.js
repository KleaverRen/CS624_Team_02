const Vocabulary = require("../models/vocabulary");
const Quiz = require("../models/quiz");
const QuizResult = require("../models/quizResult");
const IncorrectAnswer = require("../models/incorrectAnswer");
const mongoose = require("mongoose");

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
      const correctDefinition = wordObj.definition;
      const correctWord = wordObj.word;

      // Create an array of potential options including the correct one
      const allDefinitions = userVocabulary.map((item) => item.definition);

      // Filter out the correct definition from the incorrect options pool
      const incorrectOptionsPool = allDefinitions.filter(
        (def) => def !== correctDefinition
      );

      // Shuffle and slice incorrect options
      const shuffledIncorrectOptions = [...incorrectOptionsPool]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      // Combine correct and incorrect definitions
      const rawOptions = [...shuffledIncorrectOptions, correctDefinition];

      // Map raw options to the new schema's option format { text: "...", _id: "..." }
      // We generate _id's here because Mongoose will assign them when saving,
      // but we need to know the correct one beforehand.
      const optionsWithIds = rawOptions
        .sort(() => 0.5 - Math.random())
        .map((optionText) => ({
          text: optionText,
          _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId for each option
        }));

      // Find the _id of the correct option
      const correctOption = optionsWithIds.find(
        (opt) => opt.text === correctDefinition
      );
      const correctOptionId = correctOption ? correctOption._id : null;

      if (!correctOptionId) {
        console.error("Error: Correct option not found in generated options.");
        // Handle this error appropriately, perhaps by re-generating the question
        // or returning an error for this specific question.
        // For now, we'll return an invalid question which will likely cause issues downstream.
      }

      return {
        text: correctWord, // Renamed 'word' to 'text' as per new schema
        options: optionsWithIds,
        correctOptionId: correctOptionId,
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
      userId: userId, // Assuming userId is still relevant for Quiz model, though not in the provided schema
      title: quizTitle,
      questions: quizQuestions,
    });
    await newQuiz.save();

    res.status(200).json({
      quizId: newQuiz._id,
      title: quizTitle,
      questions: newQuiz.questions, // Return the saved questions which now have _ids
    }); // Return the quizId and title
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

    const quizQuestions = quiz.questions; // This should contain your questions with options

    let score = 0;
    const results = []; // Combined array for all question outcomes
    const incorrectAnswersForDb = []; // Array specifically for storing incorrect answers in DB

    for (const question of quizQuestions) {
      // Find the user's answer for this specific question
      const userAnswerObj = answers.find(
        (ans) => ans.questionId === question._id.toString() // Assuming question has an _id
      );
      const userSelectedOptionId = userAnswerObj?.selectedOptionId; // Assuming user sends selected option ID
      // Find the user's selected option text from the question's options
      const selectedOption = question.options.find(
        (opt) => opt._id.toString() === userSelectedOptionId
      );
      // Find the correct option text from the question's options
      const correctOption = question.options.find(
        (opt) => opt._id.toString() === question.correctOptionId.toString() // Assuming correctOptionId is stored
      );
      const isCorrect =
        userSelectedOptionId === question.correctOptionId.toString();
      if (isCorrect) {
        score++;
      }

      results.push({
        questionId: question._id.toString(), // Use question ID
        question: {
          text: question.text, // Assuming question.text holds the question prompt
        },
        selectedOption: {
          text: selectedOption ? selectedOption.text : "Not Answered", // Get text or "Not Answered"
        },
        correctOption: {
          text: correctOption ? correctOption.text : "N/A", // Get text or "N/A"
        },
        isCorrect: isCorrect,
      });

      // If incorrect and an answer was provided, prepare for DB storage
      if (!isCorrect && userSelectedOptionId) {
        incorrectAnswersForDb.push({
          userId: userId,
          quizId: quizId,
          questionId: question._id.toString(),
          userSelectedOptionId: userSelectedOptionId,
          correctOptionId: question.correctOptionId,
          // You might want to store more details here for debugging or specific analysis
        });
      }
    }

    const totalQuestions = quizQuestions.length;

    // Save the quiz result
    const newQuizResult = new QuizResult({
      userId: userId,
      score: score,
      totalQuestions: totalQuestions,
      results: results, // Store the combined results array
    });
    await newQuizResult.save();

    // Save incorrect answers to the database
    if (incorrectAnswersForDb.length > 0) {
      await IncorrectAnswer.insertMany(incorrectAnswersForDb);
    }

    // Delete the quiz after submission
    await Quiz.findByIdAndDelete(quizId);

    res.status(200).json({
      score,
      totalQuestions,
      results, // Include the combined results array
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
    res.status(500).json({
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
    res.status(500).json({
      message: "Failed to get incorrect answers for this quiz",
      error: error.message,
    });
  }
};
