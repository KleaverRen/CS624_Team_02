const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const authMiddleware = require("../middleware/authMiddleware");

// All quiz routes require authentication
router.use(authMiddleware);

router.get("/quiz", quizController.getQuiz);
router.get("/quiz/:quizId", quizController.getQuizById);
router.post("/quiz/submit", quizController.submitQuiz);
router.get("/incorrect-answers", quizController.getIncorrectAnswers); // Get all incorrect answers for the user
router.get(
  "/quiz/:quizId/incorrect-answers",
  quizController.getIncorrectAnswersByQuiz
); // Get incorrect answers for a specific quiz

module.exports = router;
