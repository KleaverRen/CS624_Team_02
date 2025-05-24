// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const InvalidatedToken = require("../models/invalidatedToken"); // Import new model

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Check if the token is blacklisted (invalidated)
    const isInvalidated = await InvalidatedToken.findOne({ token });
    if (isInvalidated) {
      return res
        .status(401)
        .json({ message: "Token is invalidated, please log in again." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Assuming your JWT payload has an 'id' field for the user
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired, please log in again." });
    }
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
