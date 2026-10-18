const jwt = require("jsonwebtoken");

function authenticateUser(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId =
      decoded.id ??
      decoded.userId ??
      decoded.user_id ??
      decoded.sub;

    if (!userId) {
      console.error(
        "JWT payload has no recognized user ID field:",
        Object.keys(decoded)
      );

      return res.status(401).json({
        success: false,
        message: "User ID missing from authentication token",
      });
    }

    req.user = {
      ...decoded,
      id: userId,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
}

module.exports = authenticateUser;