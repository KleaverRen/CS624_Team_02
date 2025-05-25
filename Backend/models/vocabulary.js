// models/vocabulary.js
const mongoose = require("mongoose");

const VocabularySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, // For efficient querying by user
  },
  word: {
    type: String,
    required: true,
    trim: true,
  },
  definition: {
    type: String,
    required: true,
    trim: true,
  },
  addedDate: {
    type: Date,
    default: Date.now,
  },
});

const Vocabulary = mongoose.model("Vocabulary", VocabularySchema);

module.exports = Vocabulary;
