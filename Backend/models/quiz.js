// models/quiz.js
const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  questions: [
    // Array of question objects
    {
      text: {
        type: String,
        required: true,
      },
      options: [
        // Array of option objects, each with its own _id
        {
          text: {
            type: String,
            required: true,
          },
          // Mongoose automatically adds _id to subdocuments, but being explicit is clear
          _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        },
      ],
      // Stores the _id of the correct option from the 'options' array
      correctOptionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      // Mongoose automatically adds _id to subdocuments for questions as well
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Quiz", QuizSchema);
