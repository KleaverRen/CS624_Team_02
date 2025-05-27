const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const authMiddleware = require("../middleware/auth");

// All quiz routes require authentication
router.use(authMiddleware.authenticateToken);

router.get("/", quizController.getQuiz);
router.get("/:quizId", quizController.getQuizById);
router.post("/submit", quizController.submitQuiz);
router.get("/incorrect-answers", quizController.getIncorrectAnswers); // Get all incorrect answers for the user
router.get(
  "/:quizId/incorrect-answers",
  quizController.getIncorrectAnswersByQuiz
); // Get incorrect answers for a specific quiz

module.exports = router;
