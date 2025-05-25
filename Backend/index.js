require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const vocabularyRoutes = require("./routes/vocabularyRoutes");
const progressRoutes = require("./routes/progressRoutes");
const quizRoutes = require("./routes/quizRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Check for JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.warn(
    "Warning: JWT_SECRET is not set. Using default secret. This is not secure for production."
  );
}

// CORS configuration
app.use(cors());
// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "http://localhost:3002",
//       "https://msagnfm-rothpanhaseth-8081.exp.direct/",
//       "0.0.0.0",
//       "*",
//     ], // Added '*' for File 2 and existing origins
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Session-Id"],
//     exposedHeaders: ["X-Session-Id"],
//     credentials: true, // Keep credentials: true from file 1
//   })
// );

// Middleware
app.use(express.json()); // For parsing application/json

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", vocabularyRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/user", userRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

// MongoDB connection
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MongoDB connection string is missing.");
  process.exit(1);
}

mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 5000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: "majority",
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error details:", {
      message: err.message,
      code: err.code,
      name: err.name,
    });
    process.exit(1);
  });

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
