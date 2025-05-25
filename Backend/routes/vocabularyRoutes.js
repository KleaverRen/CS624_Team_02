// routes/vocabularyRoutes.js
const express = require("express");
const router = express.Router();
const vocabularyController = require("../controllers/vocabularyController");
const authMiddleware = require("../middleware/auth"); // Import your authentication middleware

// All user routes will be protected by authMiddleware
router.use(authMiddleware.authenticateToken);

// Apply the authentication middleware to each route that requires a logged-in user
router.post("/words", vocabularyController.addWord);
router.get("/words", vocabularyController.getVocabulary);
router.delete("/words/:wordId", vocabularyController.deleteWord);
router.put("/words/:id", vocabularyController.updateWord); // Assuming 'id' is the word ID for update

module.exports = router;
