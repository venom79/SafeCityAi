import { Router } from "express";
import {
  acceptCase,
  addCasePerson,
  assignCase,
  closeCase,
  confirmWithdrawCase,
  createDraftCase,
  deleteCasePerson,
  getCaseById,
  getCasePersons,
  getComplainantByCase,
  getFullCase,
  getMyDraftCases,
  getWithdrawRequests,
  registerCase,
  rejectCase,
  rejectWithdrawRequest,
  requestWithdrawCase,
  saveComplainant,
  submitCase,
  updateCaseDetails,
  viewAllCase
} from "../controllers/case.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import requireCaseAccess from "../middlewares/caseAccess.middleware.js";
import requireRole from "../middlewares/role.middleware.js";
import requireDraft from "../middlewares/requireDraft.js";

import { ROLES } from "../constants/roles.js";

const router = Router();

/* =========================
   CASE CREATION & DRAFTS
========================= */

router.post("/draft", authMiddleware, createDraftCase);
router.get("/drafts/my", authMiddleware, getMyDraftCases);
router.post("/", authMiddleware, registerCase);
router.post("/:id/submit", authMiddleware, requireCaseAccess, requireDraft, submitCase);


/* =========================
   CASE DETAILS
========================= */

router.get("/", authMiddleware, viewAllCase);
router.get("/withdraw-requests", authMiddleware, requireRole(ROLES.SUPER_ADMIN), getWithdrawRequests);


/* =========================
   CASE WORKFLOW (ADMIN)
========================= */

router.post("/:id/accept",
  authMiddleware,
  requireRole(ROLES.SUPER_ADMIN),
  requireCaseAccess,
  acceptCase
);

router.post("/:id/reject",
  authMiddleware,
  requireRole(ROLES.SUPER_ADMIN),
  requireCaseAccess,
  rejectCase
);

router.post("/:id/assign",
  authMiddleware,
  requireRole(ROLES.SUPER_ADMIN),
  requireCaseAccess,
  assignCase
);

router.post("/:id/close",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  requireCaseAccess,
  closeCase
);


/* =========================
   WITHDRAW WORKFLOW
========================= */

router.post("/:id/withdraw",
  authMiddleware,
  requireRole(ROLES.USER),
  requireCaseAccess,
  requestWithdrawCase
);

router.post("/:id/withdraw/confirm",
  authMiddleware,
  requireRole(ROLES.SUPER_ADMIN),
  requireCaseAccess,
  confirmWithdrawCase
);

router.post("/:id/withdraw/reject",
  authMiddleware,
  requireRole(ROLES.SUPER_ADMIN),
  rejectWithdrawRequest
);


/* =========================
   CASE EDITING
========================= */

router.patch("/:id/details",
  authMiddleware,
  requireCaseAccess,
  requireDraft,
  updateCaseDetails
);

router.patch("/:id/complainant",
  authMiddleware,
  requireCaseAccess,
  requireDraft,
  saveComplainant
);


/* =========================
   CASE PERSON
========================= */

router.post("/:id/person",
  authMiddleware,
  requireCaseAccess,
  requireDraft,
  addCasePerson
);

router.get("/:id/person",
  authMiddleware,
  requireCaseAccess,
  getCasePersons
);

router.delete("/:id/person/:personId",
  authMiddleware,
  requireCaseAccess,
  requireDraft,
  deleteCasePerson
);

router.get(
  "/:id/complainant",
  authMiddleware,
  requireCaseAccess,
  getComplainantByCase
)

/* =========================
   FULL CASE DATA
========================= */

router.get("/:id/full",
  authMiddleware,
  requireCaseAccess,
  getFullCase
);


/* =========================
   SINGLE CASE (KEEP LAST)
========================= */

router.get("/:id",
  authMiddleware,
  requireCaseAccess,
  getCaseById
);

export default router;