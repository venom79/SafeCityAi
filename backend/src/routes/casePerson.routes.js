import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import {
  uploadPersonPhoto,
  getPersonPhotos,
} from "../controllers/casePersonPhoto.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/:personId/photos",
  authMiddleware,
  upload.single("photo"),
  uploadPersonPhoto
);

router.get(
  "/:personId/photos",
  authMiddleware,
  getPersonPhotos
);

export default router;