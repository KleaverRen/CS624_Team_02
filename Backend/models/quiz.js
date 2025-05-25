// models/quiz.js
const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  questions: [
    {
      word: {
        type: String,
        required: true,
      },
      options: [String],
      correctAnswer: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = Quiz;
