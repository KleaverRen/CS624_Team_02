const mongoose = require("mongoose");

const QuizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // You can add more details about the quiz if needed,
  // like the type of quiz, the words involved, etc.
});

const QuizResult = mongoose.model("QuizResult", QuizResultSchema);

module.exports = QuizResult;
