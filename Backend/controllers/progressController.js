const QuizResult = require("../models/quizResult");

// Record a quiz result
exports.recordQuizResult = async (req, res) => {
  const { score, totalQuestions, results } = req.body;
  const userId = req.userId;

  try {
    const newResult = new QuizResult({
      userId,
      score,
      totalQuestions,
      results,
    });
    await newResult.save();
    res.status(201).json({
      message: "Quiz result recorded successfully",
      result: newResult,
    });
  } catch (error) {
    console.error("Error recording quiz result:", error);
    res.status(500).json({ message: "Failed to record quiz result" });
  }
};

// Get all quiz results for a user
exports.getQuizResults = async (req, res) => {
  const userId = req.userId;

  try {
    const results = await QuizResult.find({ userId }).sort({ date: -1 });
    res.status(200).json(results);
  } catch (error) {
    console.error("Error getting quiz results:", error);
    res.status(500).json({ message: "Failed to retrieve quiz results" });
  }
};

// Get a single quiz result by ID
exports.getQuizResultById = async (req, res) => {
  const { id } = req.params; // Assuming the ID will come from the URL parameters

  try {
    const result = await QuizResult.findById(id);

    if (!result) {
      return res.status(404).json({ message: "Quiz result not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting quiz result by ID:", error);
    // Check if the error is due to an invalid ID format (e.g., not a valid ObjectId)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid Quiz Result ID format" });
    }
    res.status(500).json({ message: "Failed to retrieve quiz result by ID" });
  }
};

// Get overall progress statistics (e.g., average score)
exports.getOverallProgress = async (req, res) => {
  const userId = req.userId;

  try {
    const results = await QuizResult.find({ userId });
    if (results.length === 0) {
      return res.status(200).json({ averageScore: 0, totalQuizzesTaken: 0 });
    }

    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const totalQuizzesTaken = results.length;
    const averageScore = totalScore / totalQuizzesTaken;

    res.status(200).json({ averageScore, totalQuizzesTaken });
  } catch (error) {
    console.error("Error getting overall progress:", error);
    res.status(500).json({ message: "Failed to retrieve overall progress" });
  }
};
