import { Router } from "express";
import { acceptCase, assignCase, getCaseById, registerCase, rejectCase, viewAllCase } from "../controllers/case.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import requireCaseAccess from "../middlewares/caseAccess.middleware.js";
import requireRole from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
const router = Router();

//requires authorization header
router.post("/", authMiddleware, registerCase) 
router.get("/", authMiddleware, viewAllCase);
router.get("/:id", authMiddleware, requireCaseAccess, getCaseById);
router.post("/:id/accept",authMiddleware,requireRole(ROLES.SUPER_ADMIN),requireCaseAccess,acceptCase);
router.post("/:id/reject",authMiddleware,requireRole(ROLES.SUPER_ADMIN),requireCaseAccess,rejectCase);
router.post("/:id/assign",authMiddleware,requireRole(ROLES.SUPER_ADMIN),requireCaseAccess,assignCase);
export default router;

