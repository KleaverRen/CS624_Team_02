const QuizResult = require("../models/quizResult");

// Record a quiz result
exports.recordQuizResult = async (req, res) => {
  const { score, totalQuestions } = req.body;
  const userId = req.userId;

  try {
    const newResult = new QuizResult({ userId, score, totalQuestions });
    await newResult.save();
    res
      .status(201)
      .json({
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
