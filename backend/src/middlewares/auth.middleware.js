import { verifyAccessToken } from "../helpers/jwt.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // No header
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Expect: Bearer <token>
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = parts[1];

  try {
    const payload = verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      id: payload.userId,
      role: payload.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
