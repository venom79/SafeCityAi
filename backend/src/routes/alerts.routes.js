import express from "express";
import { getAlertDetails, getAlerts, updateAlertStatus } from "../controllers/alerts.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAlerts);
router.get("/:id", authMiddleware, getAlertDetails);

// change alert status
router.patch("/:id/status", authMiddleware, updateAlertStatus)

export default router;