import prisma from "../db/prisma.js";
import { PHOTO_SOURCE } from "../constants/photoSource.js";
import { ROLES } from "../constants/roles.js";
import { generateFileHash } from "../helpers/hashFile.js";

import { generatePhotoEmbedding } from "../services/faceEmbedding.service.js";


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

    // 1️⃣ Fetch person
    const person = await prisma.case_person.findUnique({
      where: { id: personId },
      select: { category: true },
    });

    if (!person) {
      fs.unlinkSync(req.file.path); // cleanup
      return res.status(404).json({
        success: false,
        message: "Person not found",
      });
    }

    // 2️⃣ Wanted → admin only
    if (
      person.category === "WANTED" &&
      ![ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role)
    ) {
      fs.unlinkSync(req.file.path); // cleanup
      return res.status(403).json({
        success: false,
        message: "Only admins can upload photos for wanted persons",
      });
    }

    // 3️⃣ Generate file hash
    const fileHash = await generateFileHash(req.file.path);

    // 4️⃣ Duplicate check
    const existingPhoto = await prisma.case_person_photos.findUnique({
      where: { file_hash: fileHash },
    });

    if (existingPhoto) {
      fs.unlinkSync(req.file.path); // 🧹 remove duplicate file
      return res.status(409).json({
        success: false,
        message: "Duplicate image already uploaded",
      });
    }

    const finalIsPrimaryRequested =
      is_primary === true || is_primary === "true";

    // 5️⃣ Transaction (safe insert)
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
          file_hash: fileHash, // ✅ IMPORTANT
          is_primary: finalIsPrimary,
          image_type: "PHOTO",
        },
      });
    });

    // 6️⃣ Generate embedding (outside transaction)
    try {
      const result = await generatePhotoEmbedding(req.file.path);

      const vectorLiteral = `[${result.embedding.join(",")}]`;

      await prisma.$executeRaw`
        INSERT INTO face_embeddings (
          case_person_id,
          photo_id,
          embedding,
          model_name,
          model_version
        )
        VALUES (
          ${personId}::uuid,
          ${photo.id}::uuid,
          ${vectorLiteral}::vector,
          ${result.model_name},
          ${result.model_version}
        )
      `;

      await prisma.case_person_photos.update({
        where: { id: photo.id },
        data: {
          face_detected: true,
          embedding_generated: true,
        },
      });
    } catch (mlError) {
      console.warn("Embedding generation failed:", mlError.message);

      await prisma.case_person_photos.update({
        where: { id: photo.id },
        data: {
          face_detected: false,
          embedding_generated: false,
        },
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        id: photo.id,
        is_primary: photo.is_primary,
      },
    });
  } catch (err) {
    // ⚠️ Handle primary conflict
    if (err.message === "PRIMARY_EXISTS") {
      fs.existsSync(req.file?.path) && fs.unlinkSync(req.file.path);

      return res.status(409).json({
        success: false,
        message: "Primary photo already exists for this person",
      });
    }

    // ⚠️ Handle UNIQUE constraint (race condition)
    if (err.code === "P2002" && err.meta?.target?.includes("file_hash")) {
      fs.existsSync(req.file?.path) && fs.unlinkSync(req.file.path);

      return res.status(409).json({
        success: false,
        message: "Duplicate image already uploaded",
      });
    }

    console.error(err);

    fs.existsSync(req.file?.path) && fs.unlinkSync(req.file.path);

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

export const deletePersonPhoto = async (req, res) => {
  try {

    await prisma.case_person_photos.delete({
      where: {
        id: req.params.photoId
      }
    })

    res.status(200).json({
      success: true
    })

  } catch (err) {

    console.error(err)

    res.status(500).json({
      success:false
    })

  }
}