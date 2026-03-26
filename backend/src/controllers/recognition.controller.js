import { processRecognitions } from "../services/vectorSearch.service.js"

export const handleRecognition = async (req, res) => {
  
  try {

    const { camera_id, frame_id, detections } = req.body

    await processRecognitions(camera_id, frame_id, detections)

    res.json({ status: "ok" })

  } catch (err) {

    console.error(err)
    res.status(500).json({ error: "Recognition failed" })

  }

}