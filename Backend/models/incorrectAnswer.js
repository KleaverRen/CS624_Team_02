// models/IncorrectAnswer.js
const mongoose = require("mongoose");

const IncorrectAnswerSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
    index: true,
  },
  word: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: String,
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
});

const IncorrectAnswer = mongoose.model(
  "IncorrectAnswer",
  IncorrectAnswerSchema
);

module.exports = IncorrectAnswer;
