// models/invalidatedToken.js
const mongoose = require("mongoose");

const InvalidatedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate tokens are stored
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 0, // This will automatically delete documents once expiresAt is reached
  },
});

module.exports = mongoose.model("InvalidatedToken", InvalidatedTokenSchema);
