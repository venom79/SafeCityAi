import prisma from "../db/prisma.js";

export const faceSearch = async (req, res) => {
  try {
    const { embedding, threshold = 0.6, limit = 5 } = req.body;

    if (!Array.isArray(embedding) || embedding.length !== 512) {
      return res.status(400).json({
        success: false,
        message: "Invalid embedding",
      });
    }

    const vectorLiteral = `[${embedding.join(",")}]`;

    const results = await prisma.$queryRaw`
      SELECT
        fe.id AS embedding_id,
        fe.case_person_id,
        fe.photo_id,
        (fe.embedding <=> ${vectorLiteral}::vector) AS distance
      FROM face_embeddings fe
      WHERE (fe.embedding <=> ${vectorLiteral}::vector) <= ${threshold}
      ORDER BY distance ASC
      LIMIT ${limit};
    `;

    return res.status(200).json({
      success: true,
      count: results.length,
      matches: results,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
