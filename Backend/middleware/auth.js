// middleware/auth.js
const jwt = require("jsonwebtoken");

// IMPORTANT: This secret must be the same as the one used to SIGN your JWT tokens.
// In a production environment, load this from environment variables.
const jwtSecret = process.env.JWT_SECRET; // Use environment variable!

exports.authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  // Expected format: "Bearer YOUR_JWT_TOKEN"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract the token part

  if (token == null) {
    // No token provided
    return res.status(401).json({ message: "Authentication token required" });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      // Token is invalid (e.g., expired, malformed, wrong signature)
      console.error("JWT Verification Error:", err);
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // If verification is successful, the 'user' object will contain the decoded payload.
    // We assume your JWT payload looks something like { userId: '123', email: 'test@example.com' }
    req.userId = user.userId; // Attach the userId from the token payload to the request object
    next(); // Pass control to the next middleware or route handler
  });
};
