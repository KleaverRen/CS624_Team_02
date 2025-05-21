const express = require("express");
const router = express.Router();
const vocabularyController = require("../controllers/vocabularyController");
const authMiddleware = require("../middleware/authMiddleware"); // We'll create this next

// All vocabulary routes require authentication
router.use(authMiddleware);

router.post("/words", vocabularyController.addWord);
router.get("/words", vocabularyController.getVocabulary);
router.delete("/words/:wordId", vocabularyController.deleteWord);

module.exports = router;
