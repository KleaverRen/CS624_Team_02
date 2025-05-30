const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    // The 'results' array directly mirrors the structure used in your frontend's map function
    results: [
      {
        questionId: {
          // Used as 'key' in the frontend, so it should be unique for each question
          type: mongoose.Schema.Types.ObjectId, // Assuming your questions have MongoDB ObjectIds
          required: true,
        },
        question: {
          // Corresponds to 'result.question.text'
          text: { type: String, required: true },
          // You can add more fields here if your question object has other properties you want to store
          // For example: imageUrl: { type: String }
        },
        selectedOption: {
          // Corresponds to 'result.selectedOption?.text'
          text: { type: String, required: false }, // 'Not Answered' will be handled by frontend if null/undefined
          // If you store option IDs, you might add: optionId: { type: mongoose.Schema.Types.ObjectId }
        },
        correctOption: {
          // Corresponds to 'result.correctOption?.text'
          text: { type: String, required: true },
          // If you store option IDs, you might add: optionId: { type: mongoose.Schema.Types.ObjectId }
        },
        isCorrect: {
          // Corresponds to 'result.isCorrect'
          type: Boolean,
          required: true,
        },
        _id: false, // Prevents Mongoose from adding a default _id to subdocuments in this array
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const QuizResult = mongoose.model("QuizResult", quizResultSchema);

module.exports = QuizResult;
