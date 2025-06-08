// controllers/userController.js
const User = require("../models/user"); // Assuming you have a User model

// getUserProfile function to fetch user profile data
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

// updateUserProfile function to update user profile data
exports.updateUserProfile = async (req, res) => {
  const { email, firstName, lastName } = req.body; // Destructure allowed fields from request body
  const userId = req.userId; // Get user ID from the authentication middleware

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the provided email already exists for another user
    if (email && email !== user.email) {
      const existingUserWithEmail = await User.findOne({ email });
      if (existingUserWithEmail) {
        return res.status(400).json({ message: "Email already in use." });
      }
      user.email = email; // Update email if provided and unique
    }

    // Update firstName if provided
    if (firstName) {
      user.firstName = firstName;
    }

    // Update lastName if provided
    if (lastName) {
      user.lastName = lastName;
    }

    await user.save(); // Save the updated user document

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        username: user.username, // Username is typically not updated via this route
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res
      .status(500)
      .json({ message: "Server error updating profile", error: error.message });
  }
};

// changePassword function to update user's password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId; // User ID from authMiddleware

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 1. Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password." });
    }

    // 2. Validate new password (optional, but recommended)
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long.",
      });
    }

    // 3. Hash the new password and save
    // If your User model has a pre-save hook to hash passwords,
    // you can just assign it:
    user.password = newPassword; // The pre-save hook will hash this

    await user.save(); // This will trigger the pre-save hook if set up

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      message: "Server error changing password",
      error: error.message,
    });
  }
};
