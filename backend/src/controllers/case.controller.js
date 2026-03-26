import {CASE_STATUS} from "../constants/caseStatus.js"
import {CASE_TYPE} from "../constants/caseType.js"
import { ROLES } from "../constants/roles.js";
import prisma from "../db/prisma.js";

export const createDraftCase = async (req, res) => {
  try {
    const created_by = req.user.id;
    const { caseType } = req.body;

    if (!Object.values(CASE_TYPE).includes(caseType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid case type",
      });
    }

    const draftTitle =
      caseType === CASE_TYPE.MISSING
        ? `Draft_missingperson_${Date.now()}`
        : `Draft_wantedperson_${Date.now()}`;

    const draft = await prisma.cases.create({
      data: {
        title: draftTitle,
        case_type: caseType,
        created_by,
        status: CASE_STATUS.DRAFT,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Draft created Successfuly",
      data: {
        caseId: draft.id,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const getFullCase = async (req, res) => {
  try {

    const caseData = await prisma.cases.findUnique({
      where: { id: req.case.id },
      include: {
        complainants: true,
        case_person: {
          include: {
            case_person_photos: true
          }
        }
      }
    })

    return res.status(200).json({
      success: true,
      data: caseData
    })

  } catch (err) {
    console.error(err)

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

export const getMyDraftCases = async (req, res) => {
  try {

    const userId = req.user.id

    let { page = 1, limit = 10 } = req.query

    page = Math.max(parseInt(page), 1)
    limit = Math.min(parseInt(limit), 20)

    const skip = (page - 1) * limit

    const [drafts, total] = await Promise.all([

      prisma.cases.findMany({
        where: {
          created_by: userId,
          status: CASE_STATUS.DRAFT,
          is_active: true
        },

        select: {
          id: true,
          title: true,
          case_type: true,
          created_at: true,
          updated_at: true
        },

        orderBy: {
          updated_at: "desc"
        },

        skip,
        take: limit
      }),

      prisma.cases.count({
        where: {
          created_by: userId,
          status: CASE_STATUS.DRAFT,
          is_active: true
        }
      })

    ])

    return res.status(200).json({
      success: true,

      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },

      data: drafts
    })

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })

  }
}

export const updateCaseDetails = async (req, res) => {
  try {
    const { title, description, lastSeenLocation, lastSeenTime } = req.body;

    await prisma.cases.update({
      where: { id: req.case.id },
      data: {
        title,
        description,
        last_seen_location: lastSeenLocation,
        last_seen_time: lastSeenTime,
      },
    });

    res.status(200).json({
      success: true,
      message: "Case details saved",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const saveComplainant = async (req, res) => {
  try {
    const {
      full_name,
      phone,
      email,
      gender,
      age,
      relation,
      aadhaar,
      address,
    } = req.body;

    const parsedAge = age ? parseInt(age) : null

    if (parsedAge && (parsedAge < 0 || parsedAge > 120)) {
      return res.status(400).json({
        success:false,
        message:"Invalid age"
      })
    }

    await prisma.complainants.upsert({
      where: {
        case_id: req.case.id,
      },
      update: {
        full_name,
        phone,
        email,
        gender,
        age: parsedAge,
        relation, 
        aadhaar,
        address,
      },
      create: {
        case_id: req.case.id,
        full_name,
        phone,
        email,
        gender,
        age: parsedAge,
        relation,
        aadhaar,
        address,
      },
    });

    res.status(200).json({
      success: true,
      message: "Complainant saved",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const submitCase = async (req, res) => {
  try {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-8);

    const case_number =
      req.case.case_type === CASE_TYPE.MISSING
        ? `MISS-${suffix}`
        : `WANT-${suffix}`;

    await prisma.cases.update({
      where: { id: req.case.id },
      data: {
        status: CASE_STATUS.SUBMITTED,
        case_number,
      },
    });

    res.status(200).json({
      success: true,
      message: "Case submitted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

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

    const where = {
      status: {
        not: CASE_STATUS.DRAFT
      }
    };

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
        category: true,
        full_name: true,
        alias: true,
        gender: true,
        age: true,
        height_cm: true,
        weight_kg: true,
        skin_tone: true,
        eye_color: true,
        hair_color: true,
        last_known_clothing: true,
        distinguishing_marks: true,
        description: true,
        is_primary: true,
        created_at: true,
        updated_at: true,
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

export const deleteCasePerson = async (req, res) => {
  try {

    const { personId } = req.params

    const person = await prisma.case_person.findUnique({
      where: { id: personId }
    })

    if (!person || person.case_id !== req.case.id) {
      return res.status(404).json({
        success: false,
        message: "Person not found in this case"
      })
    }

    await prisma.case_person.delete({
      where: { id: personId }
    })

    return res.status(200).json({
      success: true,
      message: "Person removed successfully"
    })

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })

  }
}

export const requestWithdrawCase = async (req, res) => {
  try {

    if (req.case.status === CASE_STATUS.WITHDRAW_REQUESTED) {
      return res.status(409).json({
        success: false,
        message: "Withdrawal request already submitted",
      });
    }

    // Only case creator can request withdrawal
    if (req.case.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the case creator can request withdrawal",
      });
    }

    // Only allowed states
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

    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Withdrawal reason is required",
      });
    }

    await prisma.cases.update({
      where: { id: req.case.id },
      data: {
        status: CASE_STATUS.WITHDRAW_REQUESTED,
        withdraw_reason: reason.trim(),
        withdraw_requested_at: new Date(),
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

export const getWithdrawRequests = async (req, res) => {
  try {

    const cases = await prisma.cases.findMany({
      where: {
        status: CASE_STATUS.WITHDRAW_REQUESTED
      },
      orderBy: {
        withdraw_requested_at: "desc"
      },
      select: {
        id: true,
        case_number: true,
        title: true,
        case_type: true,
        description: true,
        status: true,
        withdraw_reason: true,
        withdraw_requested_at: true,
        created_at: true
      }
    });

    res.json({
      success: true,
      data: cases
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch withdrawal requests"
    });

  }
};

export const rejectWithdrawRequest = async (req, res) => {
  try {

    const caseId = req.params.id;

    const caseData = await prisma.cases.findUnique({
      where: { id: caseId },
      select: {
        status: true,
        assigned_admin: true
      }
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found"
      });
    }

    if (caseData.status !== CASE_STATUS.WITHDRAW_REQUESTED) {
      return res.status(400).json({
        success: false,
        message: "No withdrawal request to reject"
      });
    }

    const newStatus =
      caseData.assigned_admin
        ? CASE_STATUS.UNDER_REVIEW
        : CASE_STATUS.APPROVED;

    const updatedCase = await prisma.cases.update({
      where: { id: caseId },
      data: {
        status: newStatus,
        withdraw_reason: null,
        withdraw_requested_at: null,
      }
    });

    return res.json({
      success: true,
      data: updatedCase
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to reject withdrawal request"
    });

  }
};

export const getComplainantByCase = async (req, res) => {
  try {

    const caseId = req.case.id

    const complainant = await prisma.complainants.findUnique({
      where: {
        case_id: caseId
      }
    })

    if (!complainant) {
      return res.status(404).json({
        message: "Complainant not found"
      })
    }

    res.json({
      success: true,
      data: complainant
    })

  } catch (err) {

    console.error(err)

    res.status(500).json({
      message: "Failed to fetch complainant"
    })

  }
}