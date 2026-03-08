import prisma from "../db/prisma.js";
import { saveSnapshot } from "../helpers/snapshot.js"

export const searchFaceEmbedding = async (embedding, limit = 5) => {
  const vectorLiteral = `[${embedding.join(",")}]`;

  const results = await prisma.$queryRaw`
    SELECT
      fe.id AS embedding_id,
      fe.case_person_id,
      cp.case_id,
      fe.photo_id,
      fe.embedding <=> ${vectorLiteral}::vector AS distance
    FROM face_embeddings fe
    JOIN case_person cp
      ON cp.id = fe.case_person_id
    WHERE fe.embedding_status = 'ACTIVE'
    ORDER BY fe.embedding <=> ${vectorLiteral}::vector
    LIMIT ${limit};
  `;

  return results;
};

export const processRecognitions = async (cameraId, frameId, detections) => {

  for (const det of detections) {

    const embedding = det.embedding
    const bbox = det.bbox
    const faceImage = det.face_image

    // ------------------------
    // VECTOR SEARCH
    // ------------------------

    const matches = await searchFaceEmbedding(embedding, 1)

    if (!matches.length) {
      console.log("No match found")
      continue
    }

    const bestMatch = matches[0]

    const similarity = 1 - bestMatch.distance

    if (similarity < 0.65) {
      console.log("Low similarity:", similarity.toFixed(3))
      continue
    }

    let detectionStatus = similarity >= 0.80 ? "CONFIRMED" : "POSSIBLE"

    // ------------------------
    // CCTV LOG COOLDOWN
    // ------------------------

    const recentLog = await prisma.cctv_logs.findFirst({
      where: {
        camera_id: cameraId,
        detected_person_id: bestMatch.case_person_id,
        detected_at: {
          gte: new Date(Date.now() - 10 * 1000)
        }
      }
    })

    if (recentLog) {
      console.log("Skipping log due to cooldown")
      continue
    }

    // ------------------------
    // SNAPSHOT SAVE
    // Only for POSSIBLE / CONFIRMED
    // ------------------------

    let snapshotPath = null

    if (faceImage) {
      try {
        snapshotPath = await saveSnapshot(faceImage, cameraId)
      } catch (err) {
        console.error("Snapshot save failed:", err)
      }
    }

    // ------------------------
    // STORE CCTV LOG
    // ------------------------

    const log = await prisma.cctv_logs.create({
      data: {
        camera_id: cameraId,
        detected_person_id: bestMatch.case_person_id,
        detection_status: detectionStatus,
        confidence: similarity,

        bbox_x1: bbox[0],
        bbox_y1: bbox[1],
        bbox_x2: bbox[2],
        bbox_y2: bbox[3],

        snapshot_path: snapshotPath,

        model_name: "facenet",
        model_version: "v1"
      }
    })

    console.log("CCTV log stored")

    // ------------------------
    // ALERT COOLDOWN
    // ------------------------

    if (similarity > 0.80) {

      const recentAlert = await prisma.alerts.findFirst({
        where: {
          camera_id: cameraId,
          person_id: bestMatch.case_person_id,
          created_at: {
            gte: new Date(Date.now() - 60 * 1000)
          }
        }
      })

      if (recentAlert) {
        console.log("Skipping alert due to cooldown")
        continue
      }

      await prisma.alerts.create({
        data: {
          alert_type: "CCTV_MATCH",
          status: "OPEN",

          case_id: bestMatch.case_id,
          person_id: bestMatch.case_person_id,

          camera_id: cameraId,
          cctv_log_id: log.id,

          confidence: similarity,

          message: "High confidence CCTV match detected"
        }
      })

      console.log("🚨 ALERT CREATED")
    }

  }

}