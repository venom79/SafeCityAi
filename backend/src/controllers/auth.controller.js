import prisma from "../db/prisma.js";
import { hashPassword, comparePassword } from "../helpers/password.js";
import { signAccessToken } from "../helpers/jwt.js";
import { generateRefreshToken, hashRefreshToken, getRefreshTokenExpiry } from "../helpers/refreshToken.js";

export const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const password_hash = await hashPassword(password);

    const user = await prisma.users.create({
      data: {
        email,
        full_name,
        password_hash,
        role: "SUPER_ADMIN",
      },
    });

    return res.status(201).json({ 
      success: true,
      data:{
        id: user.id,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error"
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user || !user.password_hash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await comparePassword(password,user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "Account disabled" });
    }
    
    // Access token (short-lived)
    const accessToken = signAccessToken({
      userId: user.id,
      role: user.role,
    });

    //Refresh token (long-lived) long live aditya !!
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    await prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token_hash: refreshTokenHash,
        expires_at: getRefreshTokenExpiry(),
      },
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      }
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error"
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Missing refresh token" });
    }

    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken = await prisma.refresh_tokens.findFirst({
      where: {
        token_hash: tokenHash,
        revoked: false,
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        users: true,
      },
    });

    if (!storedToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = storedToken.users;

    if (!user.is_active) {
      return res.status(403).json({ message: "Account disabled" });
    }

    // Issue new access token
    const accessToken = signAccessToken({
      userId: user.id,
      role: user.role,
    });

    res.status(200).json({
      success:true,
      accessToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error"
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    }

    const tokenHash = hashRefreshToken(refreshToken);

    await prisma.refresh_tokens.updateMany({
      where: {
        token_hash: tokenHash,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};