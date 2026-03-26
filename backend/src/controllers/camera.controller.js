import { CAMERA_STATUS } from "../constants/cameraStatus.js"
import prisma from "../db/prisma.js"

const MEDIA_SERVER = process.env.MEDIA_SERVER_URL

/**
 * Create CCTV Camera
 */
export const createCamera = async (req, res) => {
  try {

    const {
      camera_name,
      location_description,
      latitude,
      longitude,
      ip_address,
      stream_url
    } = req.body

    // generate camera code automatically
    const count = await prisma.cctv_cameras.count()
    const camera_code = `cam${count + 1}`

    const camera = await prisma.cctv_cameras.create({
      data: {
        camera_code,
        camera_name,
        location_description,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        ip_address,
        stream_url,
        installed_by: req.user.id,
        installed_at: new Date()
      }
    })

    return res.status(201).json({
      ...camera,
      webrtc_url: `${MEDIA_SERVER}/${camera.camera_code}`
    })

  } catch (err) {
    console.error("Camera creation failed:", err)
    return res.status(500).json({
      message: "Failed to add camera"
    })
  }
}


/**
 * Get All Cameras
 */
export const getCameras = async (req, res) => {
  try {

    const cameras = await prisma.cctv_cameras.findMany({
      orderBy: { created_at: "desc" }
    })

    const result = cameras.map((camera) => ({
      ...camera,
      webrtc_url: `${MEDIA_SERVER}/${camera.camera_code}`
    }))

    return res.json(result)

  } catch (err) {
    console.error("Fetch cameras error:", err)

    return res.status(500).json({
      message: "Failed to fetch cameras"
    })
  }
}

export const updateCamera = async (req, res) => {
  try {

    const { id } = req.params

    const {
      camera_name,
      location_description,
      latitude,
      longitude,
      ip_address,
      stream_url,
      camera_type
    } = req.body

    const camera = await prisma.cctv_cameras.update({
      where: { id },
      data: {
        camera_name,
        location_description,
        latitude,
        longitude,
        ip_address,
        stream_url,
        camera_type,
        updated_at: new Date()
      }
    })

    return res.json(camera)

  } catch (err) {

    console.error("Camera update failed:", err)

    return res.status(500).json({
      message: "Failed to update camera"
    })

  }
}

export const updateCameraStatus = async (req, res) => {
  try {

    const { id } = req.params
    const { status } = req.body

    const allowedStatuses = Object.values(CAMERA_STATUS)

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid camera status"
      })
    }

    const camera = await prisma.cctv_cameras.update({
      where: { id },
      data: {
        status: CAMERA_STATUS[status] ?? status,
        updated_at: new Date()
      }
    })

    return res.json(camera)

  } catch (err) {

    console.error("Status update failed:", err)

    return res.status(500).json({
      message: "Failed to update camera status"
    })

  }
}

export const deleteCamera = async (req, res) => {
  try {

    const { id } = req.params

    await prisma.cctv_cameras.delete({
      where: { id }
    })

    return res.json({
        success: true,
        message: "Camera deleted"
    })

  } catch (err) {

    console.error("Camera deletion failed:", err)

    return res.status(500).json({
        success: false,
        message: "Failed to delete camera"
    })

  }
}
