import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import requireRole from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

router.get("/admin-only",authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  (req, res) => {
    res.json({ message: "Welcome Admin", user: req.user });
  }
);

export default router;
