import prisma from "../db/prisma.js";
import { hashPassword, comparePassword } from "../helpers/password.js";
import { signAccessToken } from "../helpers/jwt.js";
import {sendResetEmail} from "../helpers/email.js"
import crypto from "crypto"
import bcrypt from "bcrypt";
import { generateRefreshToken, hashRefreshToken, getRefreshTokenExpiry } from "../helpers/refreshToken.js";

export const register = async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (phone && phone.length !== 10) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }


    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const password_hash = await hashPassword(password);

    const user = await prisma.users.create({
      data: {
        email,
        full_name,
        password_hash,
        phone,
        role: "USER",
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
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          telegram_chat_id: user.telegram_chat_id
            ? user.telegram_chat_id.toString()
            : null
        }
      }
    });

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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await prisma.users.findUnique({ where: { email } })

    // 🔥 ALWAYS return success (no email leak)
    if (!user) {
      return res.json({
        success: true,
        message: "If the email exists, a reset link has been sent"
      })
    }

    // generate token
    const rawToken = crypto.randomBytes(32).toString("hex")

    // hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex")

    await prisma.users.update({
      where: { email },
      data: {
        reset_token: hashedToken,
        reset_token_expiry: new Date(Date.now() + 15 * 60 * 1000) // 15 min
      }
    })

    const resetLink = `http://localhost:5173/reset-password/${rawToken}`

    await sendResetEmail(email, resetLink)

    return res.json({
      success: true,
      message: "If the email exists, a reset link has been sent"
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex")

    const user = await prisma.users.findFirst({
      where: {
        reset_token: hashedToken,
        reset_token_expiry: {
          gte: new Date()
        }
      }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.users.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      }
    })

    return res.json({
      success: true,
      message: "Password reset successful"
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
}
