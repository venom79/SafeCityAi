import express from "express"

import authMiddleware from "../middlewares/auth.middleware.js"
import superAdminMiddleware from "../middlewares/superAdmin.middleware.js"

import {
    getAdmins,
  getUsers,
  toggleUserBan
} from "../controllers/userManagement.controller.js"

const router = express.Router()

router.get(
  "/",
  authMiddleware,
  superAdminMiddleware,
  getUsers
)

router.patch(
  "/:id/toggle-ban",
  authMiddleware,
  superAdminMiddleware,
  toggleUserBan
)

router.get(
  "/admins",
  authMiddleware,
  superAdminMiddleware,
  getAdmins
)

export default router