const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const authMiddleware = require("../middleware/authMiddleware");

// All progress routes require authentication
router.use(authMiddleware);

router.post("/quiz-results", progressController.recordQuizResult);
router.get("/quiz-results", progressController.getQuizResults);
router.get("/progress", progressController.getOverallProgress);

module.exports = router;
