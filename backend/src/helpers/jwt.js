import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRY = "15m";

export const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
