const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const authMiddleware = require("../middleware/auth");

// All progress routes require authentication
router.use(authMiddleware.authenticateToken);

router.post("/quiz-results", progressController.recordQuizResult);
router.get("/quiz-results", progressController.getQuizResults);
router.get("/quiz-results/:id", progressController.getQuizResultById);
router.get("/", progressController.getOverallProgress);

module.exports = router;
