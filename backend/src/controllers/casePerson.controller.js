import prisma from "../db/prisma.js";

export const getActivePersonsWithPrimaryPhoto = async (req, res) => {
  try {

    const persons = await prisma.case_person.findMany({
      where: {
        category: {
          in: ["MISSING", "WANTED"],
        },
        cases: {
          status: "UNDER_REVIEW",
          is_active: true,
        },
      },

      orderBy: {
        created_at: "desc",
      },

      include: {
        cases: {
          select: {
            title: true,
            case_type: true,

            // ✅ JOIN ADMIN
            users_cases_assigned_adminTousers: {
              select: {
                full_name: true,
                phone: true,
              },
            },
          },
        },

        case_person_photos: {
          where: {
            is_primary: true,
          },
          select: {
            file_path: true,
          },
          take: 1,
        },
      },
    });

    const BASE_URL = "http://localhost:8080/";

    const formatted = persons.map((p) => ({
      person_id: p.id,
      full_name: p.full_name,
      category: p.category,

      case_title: p.cases?.title,
      case_type: p.cases?.case_type,

      // ✅ ADMIN INFO
      admin_name:
        p.cases?.users_cases_assigned_adminTousers?.full_name || null,

      admin_phone:
        p.cases?.users_cases_assigned_adminTousers?.phone || null,

      photo: p.case_person_photos[0]
        ? `${BASE_URL}${p.case_person_photos[0].file_path}`
        : null,
    }));

    return res.json({
      success: true,
      data: formatted,
    });

  } catch (err) {
    console.error("Get persons error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch persons",
    });
  }
};