import prisma from "../db/prisma.js";
import { PHOTO_SOURCE } from "../constants/photoSource.js";
import { ROLES } from "../constants/roles.js";

export const uploadPersonPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo file is required",
      });
    }

    const { is_primary } = req.body;
    const personId = req.params.personId;

    // 1️⃣ Fetch person category (MISSING / WANTED)
    const person = await prisma.case_person.findUnique({
      where: { id: personId },
      select: { category: true },
    });

    if (!person) {
      return res.status(404).json({
        success: false,
        message: "Person not found",
      });
    }

    // 2️⃣ Business rule:
    // Wanted → only ADMIN / SUPER_ADMIN
    if (
      person.category === "WANTED" &&
      ![ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Only admins can upload photos for wanted persons",
      });
    }

    // 3️⃣ Proper boolean parsing
    const finalIsPrimaryRequested =
      is_primary === true || is_primary === "true";

    // 4️⃣ Transaction to avoid race conditions
    const photo = await prisma.$transaction(async (tx) => {
      const existingPrimary = await tx.case_person_photos.findFirst({
        where: {
          case_person_id: personId,
          is_primary: true,
        },
      });

      let finalIsPrimary = finalIsPrimaryRequested;

      if (finalIsPrimary && existingPrimary) {
        throw new Error("PRIMARY_EXISTS");
      }

      if (!existingPrimary) {
        finalIsPrimary = true;
      }

      return tx.case_person_photos.create({
        data: {
          case_person_id: personId,
          uploaded_by: req.user.id,
          source:
            req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPER_ADMIN
              ? PHOTO_SOURCE.ADMIN_UPLOAD
              : PHOTO_SOURCE.USER_UPLOAD,
          file_path: req.file.path,
          is_primary: finalIsPrimary,
          image_type: "PHOTO",
        },
      });
    });

    return res.status(201).json({
      success: true,
      data: {
        id: photo.id,
        is_primary: photo.is_primary,
      },
    });
  } catch (err) {
    if (err.message === "PRIMARY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Primary photo already exists for this person",
      });
    }

    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getPersonPhotos = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const photos = await prisma.case_person_photos.findMany({
      where: {
        case_person_id: req.params.personId,
      },
      select: {
        id: true,
        file_path: true,
        is_primary: true,
        status: true,
        created_at: true,
      },
      orderBy: [
        { is_primary: "desc" },
        { created_at: "asc" },
      ],
    });

    const data = photos.map((p) => ({
      ...p,
      file_url: `${baseUrl}/${p.file_path.replace(/\\/g, "/")}`,
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
