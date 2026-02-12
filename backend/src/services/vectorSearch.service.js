import prisma from "../db/prisma.js";

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
