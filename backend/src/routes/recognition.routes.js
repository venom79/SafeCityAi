import express from "express"
import { handleRecognition } from "../controllers/recognition.controller.js"

const router = express.Router()

router.post("/", handleRecognition)

export default router