import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import requireRole from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { faceSearch, saveSketchDecision } from "../controllers/faceSearch.controller.js";
import uploadMemory from "../middlewares/uploadMemory.middleware.js"
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
  uploadMemory.single("image"),
  faceSearch
);

router.post(
  "/decision",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  saveSketchDecision
)

export default router;
