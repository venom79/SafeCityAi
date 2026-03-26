import express from "express"
import { generateReport } from "../controllers/reports.controller.js"

const router = express.Router()

router.get("/", generateReport)

export default router