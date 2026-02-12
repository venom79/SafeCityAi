import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import requireRole from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { faceSearch } from "../controllers/faceSearch.controller.js";

const router = Router();

/**
 * Face vector similarity search
 * Used by:
 * - Sketch matching
 * - CCTV live matching
 * - Admin review tools
 */
router.post(
  "/",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  faceSearch
);

export default router;
