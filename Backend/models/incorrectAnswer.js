// models/IncorrectAnswer.js
const mongoose = require("mongoose");

const incorrectAnswerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to your User model
      required: true,
    },
    quizId: {
      // The ID of the quiz where this question was answered incorrectly
      type: mongoose.Schema.Types.ObjectId,
      // Optional: If you plan to keep the original Quiz documents, you can add 'ref: 'Quiz'' here.
      // However, given your current logic deletes the Quiz, it might just be for historical context.
      required: true,
    },
    questionId: {
      // The ID of the specific question that was answered incorrectly
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question", // Optional: If you have a separate 'Question' model
      required: true,
    },
    userSelectedOptionId: {
      // The ID of the option the user chose
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    correctOptionId: {
      // The ID of the correct option for that question
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // You can add more fields here if you decide to store more details, for example:
    // timestamp: { type: Date, default: Date.now }, // To know when it was answered incorrectly
    // attempts: { type: Number, default: 1 }, // If you want to track how many times it was wrong
    // tags: [{ type: String }], // For categorization
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const IncorrectAnswer = mongoose.model(
  "IncorrectAnswer",
  incorrectAnswerSchema
);

module.exports = IncorrectAnswer;
