import prisma from "../db/prisma.js"
import axios from "axios"
import fs from "fs"
import path from "path"
import crypto from "crypto"

export const faceSearch = async (req, res) => {
  try {

    const {
      image_type = "SKETCH",
      threshold = 0.6,
      limit = 5
    } = req.body

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required"
      })
    }

    const uploadDir = "uploads/sketch-search"

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generate hash first
    const hash = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex")

    // Check if this image already exists
    let sketchPhoto = await prisma.case_person_photos.findUnique({
      where: { file_hash: hash }
    })

    // If not exists → save file + DB record
    if (!sketchPhoto) {

      const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.jpg`

      const filePath = path.join(uploadDir, filename)

      fs.writeFileSync(filePath, req.file.buffer)

      sketchPhoto = await prisma.case_person_photos.create({
        data: {
          case_person_id: null,
          uploaded_by: req.user.id,
          source: "SEARCH_UPLOAD",
          file_path: filePath,
          file_hash: hash,
          image_type: "SKETCH",
          status: "UPLOADED"
        }
      })

    }

    const image_base64 = req.file.buffer.toString("base64")

    // Call embedding service
    const embeddingResponse = await axios.post(
      "http://localhost:8001/embedding",
      {
        image_base64,
        image_type
      }
    )

    const embedding = embeddingResponse.data.embedding
    const modelName = embeddingResponse.data.model_name
    const modelVersion = embeddingResponse.data.model_version

    const vectorLiteral = `[${embedding.join(",")}]`

    const distanceThreshold = 1 - parseFloat(threshold)

    // Vector similarity search
    const matches = await prisma.$queryRaw`
      SELECT DISTINCT ON (fe.case_person_id)
        fe.id AS embedding_id,
        fe.case_person_id,
        fe.photo_id,
        (fe.embedding <=> ${vectorLiteral}::vector) AS distance
      FROM face_embeddings fe
      WHERE (fe.embedding <=> ${vectorLiteral}::vector) <= ${distanceThreshold}
      ORDER BY fe.case_person_id, distance ASC
      LIMIT ${parseInt(limit)}
    `

    if (!matches.length) {
      return res.json({
        success: true,
        sketch_photo_id: sketchPhoto.id,
        matches: [],
        model: modelName,
        version: modelVersion
      })
    }

    const personIds = [...new Set(matches.map(m => m.case_person_id))]
    const photoIds = [...new Set(matches.map(m => m.photo_id))]

    const persons = await prisma.case_person.findMany({
      where: { id: { in: personIds } },
      include: {
        cases: true
      }
    })

    const photos = await prisma.case_person_photos.findMany({
      where: { id: { in: photoIds } },
      select: {
        id: true,
        file_path: true
      }
    })

    const personMap = new Map(persons.map(p => [p.id, p]))
    const photoMap = new Map(photos.map(p => [p.id, p]))

    const enriched = matches.map(match => {

      const person = personMap.get(match.case_person_id)
      const photo = photoMap.get(match.photo_id)

      return {
        id: match.embedding_id,
        candidate_person_id: match.case_person_id,
        candidate_photo_id: match.photo_id,
        case_id: person?.cases?.id,
        name: person?.full_name || "Unknown",
        case_number: person?.cases?.case_number,
        similarity: 1 - match.distance,
        photo: photo ? `http://localhost:8080/${photo.file_path}` : null,
        status: "UNKNOWN"
      }

    })

    return res.json({
      success: true,
      sketch_photo_id: sketchPhoto.id,
      matches: enriched,
      model: modelName,
      version: modelVersion
    })

  } catch (err) {

    console.error("Face search error:", err)

    return res.status(500).json({
      success: false,
      message: "Face search failed"
    })

  }
}

export const saveSketchDecision = async (req, res) => {
  try {

    const {
      sketch_photo_id,
      candidate_person_id,
      candidate_photo_id,
      case_id,
      similarity,
      decision,
      model_name,
      model_version
    } = req.body

    if (
      !candidate_person_id ||
      !candidate_photo_id ||
      !case_id ||
      !decision
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload"
      })
    }

    const record = await prisma.sketch_searches.create({
      data: {

        similarity_score: similarity,
        decision,
        model_name,
        model_version,

        // user performing the review
        users: {
          connect: { id: req.user.id }
        },

        // connect person
        case_person: {
          connect: { id: candidate_person_id }
        },

        // connect case
        cases: {
          connect: { id: case_id }
        },

        // candidate matched photo
        case_person_photos_sketch_searches_candidate_photo_idTocase_person_photos: {
          connect: { id: candidate_photo_id }
        },

        // uploaded sketch image
        case_person_photos_sketch_searches_sketch_photo_idTocase_person_photos: {
          connect: { id: sketch_photo_id }
        }

      }
    })

    return res.json({
      success: true,
      data: record
    })

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      success: false,
      message: "Failed to save decision"
    })

  }
}