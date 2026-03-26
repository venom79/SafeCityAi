import express from "express"
import { createCamera, deleteCamera, getCameras, updateCamera, updateCameraStatus } from "../controllers/camera.controller.js"
import authMiddleware from "../middlewares/auth.middleware.js"
import roleMiddleware from "../middlewares/role.middleware.js"
import { ROLES } from "../constants/roles.js"

const router = express.Router()

router.post("/", authMiddleware, roleMiddleware(ROLES.SUPER_ADMIN,ROLES.ADMIN), createCamera)

router.get("/", authMiddleware, roleMiddleware(ROLES.SUPER_ADMIN,ROLES.ADMIN), getCameras)

router.put("/:id", authMiddleware, roleMiddleware(ROLES.SUPER_ADMIN,ROLES.ADMIN), updateCamera)

router.patch("/:id/status", authMiddleware, roleMiddleware(ROLES.SUPER_ADMIN,ROLES.ADMIN), updateCameraStatus)

router.delete("/:id", authMiddleware, roleMiddleware(ROLES.SUPER_ADMIN,ROLES.ADMIN), deleteCamera)
export default router