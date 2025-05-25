const Vocabulary = require("../models/vocabulary");

// Add a new word to vocabulary
exports.addWord = async (req, res) => {
  const { word, definition } = req.body;
  const userId = req.userId; // User ID from authentication middleware

  try {
    const newWord = new Vocabulary({ userId, word, definition });
    await newWord.save();
    res.status(201).json({ message: "Word added successfully", word: newWord });
  } catch (error) {
    console.error("Error adding word:", error);
    res.status(500).json({ message: "Failed to add word" });
  }
};

// Get all vocabulary for a user
exports.getVocabulary = async (req, res) => {
  const userId = req.userId;

  try {
    const vocabulary = await Vocabulary.find({ userId }).sort({
      addedDate: -1,
    });
    res.status(200).json(vocabulary);
  } catch (error) {
    console.error("Error getting vocabulary:", error);
    res.status(500).json({ message: "Failed to retrieve vocabulary" });
  }
};

// Delete a word from vocabulary
exports.deleteWord = async (req, res) => {
  const { wordId } = req.params;
  const userId = req.userId;

  try {
    const deletedWord = await Vocabulary.findOneAndDelete({
      _id: wordId,
      userId,
    });
    if (!deletedWord) {
      return res
        .status(404)
        .json({ message: "Word not found or does not belong to the user" });
    }
    res.status(200).json({ message: "Word deleted successfully", deletedWord });
  } catch (error) {
    console.error("Error deleting word:", error);
    res.status(500).json({ message: "Failed to delete word" });
  }
};

exports.updateWord = async (req, res) => {
  const { id } = req.params; // Word ID from URL parameter
  const { word, definition } = req.body; // Updated word and definition from request body
  const userId = req.userId; // From authMiddleware

  try {
    const updatedVocabulary = await Vocabulary.findOneAndUpdate(
      { _id: id, userId: userId }, // Find by ID AND userId to ensure ownership
      { word, definition },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedVocabulary) {
      return res.status(404).json({
        message: "Word not found or you do not have permission to update it.",
      });
    }

    res
      .status(200)
      .json({ message: "Word updated successfully", word: updatedVocabulary });
  } catch (error) {
    console.error("Error updating word:", error);
    res
      .status(500)
      .json({ message: "Failed to update word", error: error.message });
  }
};
