import prisma from "../db/prisma.js";
import { saveSnapshot } from "../helpers/snapshot.js"
import { broadcastLog } from "../websocket/server.js"
// import bot from "../services/telegramBot.js"

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

    if (similarity < 0.60) {
      console.log("Low similarity:", similarity.toFixed(3))
      continue
    }

    let detectionStatus = similarity >= 0.70 ? "CONFIRMED" : "POSSIBLE"

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
    
    const person = await prisma.case_person.findUnique({
      where: { id: bestMatch.case_person_id },
      select: {
        full_name: true,
        alias: true,
        category: true,
        cases: {
          select: {
            case_number: true,
            assigned_admin: true
          }
        }
      }
    })

    const camera = await prisma.cctv_cameras.findUnique({
      where: { id: cameraId },
      select: { camera_code: true }
    })

    const admin = await prisma.users.findUnique({
      where: { id: person?.cases?.assigned_admin },
      select: {
        telegram_chat_id: true,
        full_name: true
      }
    })

    // ------------------------
    // BROADCAST TO DASHBOARD
    // ------------------------

    broadcastLog({
      id: log.id,
      camera_id: cameraId,
      camera_code: camera.camera_code,

      detection_status: detectionStatus,
      confidence: similarity,

      person_id: bestMatch.case_person_id,
      person_name: person?.full_name || "Unknown",
      alias: person?.alias || null,
      category: person?.category || null,
      case_number: person?.cases?.case_number,

      bbox: bbox,
      snapshot_path: snapshotPath,

      detected_at: log.detected_at
    })

    // ------------------------
    // ALERT COOLDOWN
    // ------------------------

    if (similarity > 0.70) {

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

      
      // if (admin?.telegram_chat_id) {

      //   const mapLink = `https://maps.google.com/?q=${camera.latitude},${camera.longitude}`

      //   const message = `
      //     🚨 SafeCity AI Alert

      //     Person: ${person?.full_name || person?.alias || "Unknown"}
      //     Case: ${person?.cases?.case_number}

      //     Camera: ${camera.camera_code}

      //     Confidence: ${(similarity * 100).toFixed(1)}%

      //     Location:
      //     ${mapLink}
      //     `

      //   try {

      //     if (snapshotPath) {

      //       await bot.sendPhoto(
      //         admin.telegram_chat_id,
      //         `${process.env.SERVER_URL}/${snapshotPath}`,
      //         { caption: message }
      //       )

      //     } else {

      //       await bot.sendMessage(admin.telegram_chat_id, message)

      //     }

      //   } catch (err) {

      //     console.error("Telegram alert failed:", err)

      //   }

      // }
      // }

      console.log("🚨 ALERT CREATED")
    }

  }

}