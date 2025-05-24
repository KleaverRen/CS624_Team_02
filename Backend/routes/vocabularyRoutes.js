// routes/vocabularyRoutes.js
const express = require("express");
const router = express.Router();
const vocabularyController = require("../controllers/vocabularyController");
const authMiddleware = require("../middleware/auth"); // Import your authentication middleware

// Apply the authentication middleware to each route that requires a logged-in user
router.post(
  "/words",
  authMiddleware.authenticateToken,
  vocabularyController.addWord
);
router.get(
  "/words",
  authMiddleware.authenticateToken,
  vocabularyController.getVocabulary
);
router.delete(
  "/words/:wordId",
  authMiddleware.authenticateToken,
  vocabularyController.deleteWord
);
router.put(
  "/words/:id",
  authMiddleware.authenticateToken,
  vocabularyController.updateWord
); // Assuming 'id' is the word ID for update

module.exports = router;
