import { Router } from "express";
import { acceptCase,
    addCasePerson,
    assignCase,
    closeCase,
    confirmWithdrawCase,
    createDraftCase,
    deleteCasePerson,
    getCaseById, 
    getCasePersons,
    getFullCase,
    getMyDraftCases,
    registerCase,
    rejectCase,
    requestWithdrawCase,
    saveComplainant,
    submitCase,
    updateCaseDetails,
    viewAllCase
} from "../controllers/case.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import requireCaseAccess from "../middlewares/caseAccess.middleware.js";
import requireRole from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import requireDraft from "../middlewares/requireDraft.js";
const router = Router();

//requires authorization header
router.post("/draft", authMiddleware, createDraftCase);
router.patch("/:id/details", authMiddleware,requireCaseAccess, requireDraft, updateCaseDetails);

//complanant details
router.patch("/:id/complainant", authMiddleware, requireCaseAccess, requireDraft, saveComplainant);

router.post("/", authMiddleware, registerCase) 
router.get("/", authMiddleware, viewAllCase);
router.get("/drafts/my", authMiddleware, getMyDraftCases)
router.get("/:id", authMiddleware, requireCaseAccess, getCaseById);
router.post("/:id/accept",authMiddleware,requireRole(ROLES.SUPER_ADMIN),requireCaseAccess,acceptCase);
router.post("/:id/reject",authMiddleware,requireRole(ROLES.SUPER_ADMIN),requireCaseAccess,rejectCase);
router.post("/:id/assign",authMiddleware,requireRole(ROLES.SUPER_ADMIN),requireCaseAccess,assignCase);

//user actions
router.post("/:id/withdraw",authMiddleware,requireRole(ROLES.USER),requireCaseAccess,requestWithdrawCase);

//admin actions
router.post("/:id/withdraw/confirm",authMiddleware,requireRole(ROLES.USER),requireCaseAccess,confirmWithdrawCase);
router.post("/:id/close",authMiddleware,requireRole(ROLES.ADMIN,ROLES.SUPER_ADMIN),requireCaseAccess,closeCase);


//case person details
router.post("/:id/person",authMiddleware,requireCaseAccess,requireDraft,addCasePerson);
router.get("/:id/person",authMiddleware,requireCaseAccess,getCasePersons);
router.delete("/:id/person/:personId",authMiddleware,requireCaseAccess,requireDraft,deleteCasePerson);


// get data for drafted case
router.get("/:id/full", authMiddleware, requireCaseAccess, getFullCase);

//submit draft
router.post("/:id/submit", authMiddleware, requireCaseAccess, requireDraft, submitCase);

export default router;

