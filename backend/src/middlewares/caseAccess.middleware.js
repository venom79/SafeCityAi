import prisma from "../db/prisma.js";
import { ROLES } from "../constants/roles.js";

const requireCaseAccess = async (req, res, next) => {
  try {
    const { id: caseId } = req.params;
    const { id: userId, role } = req.user;

    if (!caseId) {
      return res.status(400).json({
        success: false,
        message: "Missing case id",
      });
    }

    const caseRecord = await prisma.cases.findUnique({
      where: { id: caseId },
    });

    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

     // SUPER_ADMIN → always allowed
    if (role === ROLES.SUPER_ADMIN) {
      req.case = caseRecord;
      return next();
    }

    // USER → must be creator
    if (role === ROLES.USER && caseRecord.created_by === userId) {
      req.case = caseRecord;  
      return next();
    }

    // ADMIN → must be assigned admin
    if (role === ROLES.ADMIN && caseRecord.assigned_admin === userId || caseRecord.created_by === userId) {
      req.case = caseRecord;  
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default requireCaseAccess;
