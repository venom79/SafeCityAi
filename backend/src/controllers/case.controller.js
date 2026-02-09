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

    // ADMIN self-assign logic 
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

        await prisma.cases.update({
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

export const addCasePerson = async (req, res) => {
  try {
    const {
      full_name,
      alias,
      gender,
      age,
      height_cm,
      weight_kg,
      skin_tone,
      eye_color,
      hair_color,
      last_known_clothing,
      distinguishing_marks,
      description,
      category,
      is_primary,
    } = req.body;

    // Validate category
    if (!Object.values(CASE_TYPE).includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid person category",
      });
    }

    // Category must match case type
    if (category !== req.case.case_type) {
      return res.status(400).json({
        success: false,
        message: "Person category must match case type",
      });
    }

    // Check if primary already exists for this case
    const existingPrimary = await prisma.case_person.findFirst({
      where: {
        case_id: req.case.id,
        is_primary: true,
      },
    });

    let finalIsPrimary = Boolean(is_primary);

    // If client tries to set primary but one already exists → reject
    if (finalIsPrimary && existingPrimary) {
      return res.status(409).json({
        success: false,
        message: "Primary person already exists for this case",
      });
    }

    // If no primary exists yet → auto-assign
    if (!existingPrimary) {
      finalIsPrimary = true;
    }

    // 4️⃣ Create case person (backend enforces case_id)
    const person = await prisma.case_person.create({
      data: {
        case_id: req.case.id,
        category,
        full_name,
        alias,
        gender,
        age,
        height_cm,
        weight_kg,
        skin_tone,
        eye_color,
        hair_color,
        last_known_clothing,
        distinguishing_marks,
        description,
        is_primary: finalIsPrimary,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: person.id,
        is_primary: person.is_primary,
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

export const getCasePersons = async (req, res) => {
  try {
    const casePersons = await prisma.case_person.findMany({
      where: {
        case_id: req.case.id,
      },
      select: {
        id: true,
        full_name: true,
        category: true,
        gender: true,
        age: true,
        is_primary: true,
      },
      orderBy: [
        { is_primary: "desc" },
        { created_at: "asc" },
      ],
    });

    return res.status(200).json({
      success: true,
      data: casePersons,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const requestWithdrawCase = async (req, res) => {
  try {
    if (req.user.role !== ROLES.USER) {
      return res.status(403).json({
        success: false,
        message: "Only case owner can request withdrawal",
      });
    }

    if (
      ![
        CASE_STATUS.SUBMITTED,
        CASE_STATUS.UNDER_REVIEW,
        CASE_STATUS.APPROVED,
      ].includes(req.case.status)
    ) {
      return res.status(409).json({
        success: false,
        message: "Case cannot be withdrawn in current state",
      });
    }

    await prisma.cases.update({
      where: { id: req.case.id },
      data: {
        status: CASE_STATUS.WITHDRAW_REQUESTED,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Withdrawal request submitted",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const confirmWithdrawCase = async (req, res) => {
  try {
    if (req.case.status !== CASE_STATUS.WITHDRAW_REQUESTED) {
      return res.status(409).json({
        success: false,
        message: "No withdrawal request pending",
      });
    }

    await prisma.cases.update({
      where: { id: req.case.id },
      data: {
        status: CASE_STATUS.WITHDRAWN,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Case withdrawn successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const closeCase = async (req, res) => {
  try {
    const allowedStatuses = [
      CASE_STATUS.UNDER_REVIEW,
      CASE_STATUS.APPROVED,
      CASE_STATUS.WITHDRAWN,
    ];

    if (!allowedStatuses.includes(req.case.status)) {
      return res.status(409).json({
        success: false,
        message: `Case cannot be closed from status ${req.case.status}`,
      });
    }

    await prisma.cases.update({
      where: { id: req.case.id },
      data: {
        status: CASE_STATUS.CLOSED,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Case closed successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

