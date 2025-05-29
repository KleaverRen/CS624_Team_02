// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth"); // Make sure to import authMiddleware

// All user routes will be protected by authMiddleware
router.use(authMiddleware.authenticateToken);

// GET /api/user/profile - Get authenticated user's profile
router.get("/profile", userController.getUserProfile);
// PUT /api/user/profile - Update authenticated user's profile
router.patch("/profile", userController.updateUserProfile);

module.exports = router;
