import prisma from "../db/prisma.js";
import { hashPassword, comparePassword } from "../helpers/password.js";
import { signAccessToken } from "../helpers/jwt.js";

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

    return res.status(201).json({ id: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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

    const accessToken = signAccessToken({
      userId: user.id,
      role: user.role,
    });

    res.json({ accessToken: accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
