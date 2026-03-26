import express from "express"
import { generateAlertReport, generateReport } from "../controllers/reports.controller.js"
import authMiddleware from "../middlewares/auth.middleware.js"
import roleMiddleware from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router()

router.get("/", authMiddleware, roleMiddleware(ROLES.SUPER_ADMIN,ROLES.ADMIN), generateReport) // over all report

router.get("/:alertId/report", authMiddleware, roleMiddleware(ROLES.ADMIN,ROLES.SUPER_ADMIN), generateAlertReport)

export default router