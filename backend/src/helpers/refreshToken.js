import crypto from "crypto";

const REFRESH_TOKEN_BYTES = 64; // strong entropy
const REFRESH_TOKEN_TTL_DAYS = 7;

export const generateRefreshToken = () => {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
};

export const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const getRefreshTokenExpiry = () => {
  const expires = new Date();
  expires.setDate(expires.getDate() + REFRESH_TOKEN_TTL_DAYS);
  return expires;
};
