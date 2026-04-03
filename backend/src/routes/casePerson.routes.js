import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import {
  uploadPersonPhoto,
  getPersonPhotos,
  deletePersonPhoto,
} from "../controllers/casePersonPhoto.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getActivePersonsWithPrimaryPhoto } from "../controllers/casePerson.controller.js";

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

router.delete(
  "/:personId/photos/:photoId",
  authMiddleware,
  deletePersonPhoto
);

router.get(
  "/active-persons",
  authMiddleware,
  getActivePersonsWithPrimaryPhoto
);

export default router;