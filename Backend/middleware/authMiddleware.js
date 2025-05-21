const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Assuming "Bearer <token>" format

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      req.userId = user.userId; // Attach user ID to the request object
      next(); // Proceed to the next middleware or route handler
    });
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
};

module.exports = authMiddleware;
