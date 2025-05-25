const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const InvalidatedToken = require("../models/invalidatedToken");
// Signup Controller
exports.signup = async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    const newUser = new User({
      username,
      email,
      password,
      firstName,
      lastName,
    });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

// Login Controller
exports.login = async (req, res) => {
  const { identifier, password } = req.body; // Identifier can be username or email

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .status(200)
      .json({ message: "Logged in successfully", token, userId: user._id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login" });
  }
};

// Logout Controller
exports.logout = async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    // Decode the token to get its expiration time
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return res.status(400).json({ message: "Invalid token provided." });
    }

    const expiresAt = new Date(decoded.exp * 1000); // Convert Unix timestamp to Date object

    // Save the token to the blacklist
    const invalidatedToken = new InvalidatedToken({ token, expiresAt });
    await invalidatedToken.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};
