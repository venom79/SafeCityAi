import fs from "fs"
import path from "path"

const SNAPSHOT_DIR = "snapshots"

export const saveSnapshot = async (faceBase64, cameraId) => {

  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true })
  }

  const filename = `${cameraId}_${Date.now()}.jpg`
  const filepath = path.join(SNAPSHOT_DIR, filename)

  const buffer = Buffer.from(faceBase64, "base64")

  await fs.promises.writeFile(filepath, buffer)

  return `/snapshots/${filename}`
}