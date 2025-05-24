// controllers/userController.js
const User = require("../models/user"); // Assuming you have a User model

exports.getUserProfile = async (req, res) => {
  try {
    // req.userId is set by the authMiddleware from the JWT token
    const user = await User.findById(req.userId).select("-password"); // Exclude password from the result
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return the user's profile data
    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      // Add any other profile fields you want to expose
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res
      .status(500)
      .json({ message: "Server error fetching profile", error: error.message });
  }
};
