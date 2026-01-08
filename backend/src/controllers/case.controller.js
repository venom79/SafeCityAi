import {CASE_STATUS} from "../constants/caseStatus.js"
import {CASE_TYPE} from "../constants/caseType.js"
import { ROLES } from "../constants/roles.js";
import prisma from "../db/prisma.js";


export const registerCase = async (req, res) => {
  try {
    const created_by = req.user.id;
    const { title, description, lastSeenLocation, caseType, lastSeenTime, assignToSelf } = req.body;

    if (!title || !caseType) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing fields",
      });
    }

    if (![CASE_TYPE.MISSING, CASE_TYPE.WANTED].includes(caseType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid case type",
      });
    }

    // generate case number
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-8);
    const case_number =
      caseType === CASE_TYPE.MISSING
        ? `MISS-${suffix}`
        : `WANT-${suffix}`;

    const data = {
      title,
      description,
      case_type: caseType,
      case_number,
      last_seen_time: lastSeenTime,
      last_seen_location: lastSeenLocation,
      created_by,
      status: CASE_STATUS.SUBMITTED,
    };

    // ADMIN self-assign logic (explicit + safe)
    if (req.user.role === ROLES.ADMIN && assignToSelf === true) {
      data.status = CASE_STATUS.UNDER_REVIEW;
      data.assigned_admin = req.user.id;
      data.assigned_at = new Date();
    }

    const createdCase = await prisma.cases.create({ data });

    return res.status(201).json({
      success: true,
      message: "Case created successfully",
      data: {
        id: createdCase.id,
        caseNumber: createdCase.case_number,
        status: createdCase.status,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const viewAllCase = async (req, res) => {
  try {
    const user = req.user;

    if (![ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    let { status, caseType, page, limit } = req.query;

    if (status) status = status.toUpperCase();
    if (caseType) caseType = caseType.toUpperCase();

    if (status && !Object.values(CASE_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    if (caseType && !Object.values(CASE_TYPE).includes(caseType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid case type value",
      });
    }

    page = Math.max(parseInt(page) || 1, 1);
    limit = Math.min(parseInt(limit) || 10, 50);
    const skip = (page - 1) * limit;

    const where = {};

    if (status) where.status = status;
    if (caseType) where.case_type = caseType;

    if (user.role === ROLES.USER) {
      where.created_by = user.id;
    }

    if (user.role === ROLES.ADMIN) {
      where.assigned_admin = user.id;
    }

    const [cases, total] = await Promise.all([
      prisma.cases.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.cases.count({ where }),
    ]);


    return res.status(200).json({
      success: true,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: cases,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCaseById = async (req, res) => {
    try{
        res.status(200).json({
            success: true,
            data: req.case
        })

    }catch(err){
        console.error(err);
        return res.status(500).json({
        success: false,
        message: "Internal server error",
        });
    }
}

export const acceptCase = async (req, res) => {
    try{
        const caseId = req.params.id;
        if(req.case.status !== CASE_STATUS.SUBMITTED || !req.case.is_active){
            return res.status(409).json({
                success: false,
                message: "Action Not allowed"
            })
        }

        const updatedCase = await prisma.cases.update({
            where: {
                id: caseId
            },
            data: {
                status: CASE_STATUS.APPROVED
            }        
        });
        return res.status(200).json({
            success: true,
            message: "Status Updated Succesfully",
        })

    }catch(err){
        console.error(err);
        return res.status(500).json({
        success: false,
        message: "Internal server error",
        });
    }
}

export const rejectCase = async (req, res) => {
    try{
        const caseId = req.params.id;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required",
            });
        }

        if(req.case.status != CASE_STATUS.SUBMITTED || !req.case.is_active){
            return res.status(409).json({
                success: false,
                message: "Action Not allowed"
            })
        }

        const updatedCase = await prisma.cases.update({
            where: {
                id: caseId
            },
            data: {
                status: CASE_STATUS.REJECTED,
                rejection_reason: reason,
            }        
        });
        return res.status(200).json({
            success: true,
            message: "Status Updated Succesfully",
        })

    }catch(err){
        console.error(err);
        return res.status(500).json({
        success: false,
        message: "Internal server error",
        });
    }
}

export const assignCase = async (req, res) => {
    try{
        const {adminId} = req.body;

        if (req.case.assigned_admin) {
            return res.status(409).json({
                success: false,
                message: "Case is already assigned",
            });
        }

        if(!adminId){   
            return res.status(400).json({
                success: false,
                message: "Admin id is required"
            })
        }

        if(req.case.status != CASE_STATUS.APPROVED || !req.case.is_active){
            return res.status(409).json({
                success: false,
                message: "Case cannot be assigned in its current state"
            })
        }

        const admin = await prisma.users.findUnique({where:{id: adminId}});
        if(!admin || admin.role != ROLES.ADMIN){
            return res.status(400).json({
                success: false,
                message: "assignee is not admin"
            })
        }

        const updatedCase = await prisma.cases.update({
            where:{
                id: req.case.id
            },
            data: {
                status: CASE_STATUS.UNDER_REVIEW,
                assigned_admin: adminId,
                assigned_at: new Date()
            }
        })

        res.status(200).json({
            success: true,
            message: "Case assigned successfuly",
        })

    }catch(err){
        console.error(err);
        return res.status(500).json({
        success: false,
        message: "Internal server error",
        });
    }
}