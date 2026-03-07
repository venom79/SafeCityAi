import { CASE_STATUS } from "../constants/caseStatus.js";

export default function requireDraft(req, res, next) {
  if (req.case.status !== CASE_STATUS.DRAFT) {
    return res.status(409).json({
      success: false,
      message: "Case can no longer be edited",
    });
  }

  next();
}