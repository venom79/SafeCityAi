import prisma from "../db/prisma.js";

export const getAlerts = async (req, res) => {
  try {

    const userId = req.user.id
    const role = req.user.role

    let whereClause = {}

    if (role === "USER") {

      whereClause = {
        cases: {
          created_by: userId,
          status: { not: "DRAFT" }
        }
      }

    } else if (role === "ADMIN") {

      whereClause = {
        cases: {
          assigned_admin: userId
        }
      }

    } else if (role === "SUPER_ADMIN") {

      whereClause = {}

    }

    const alerts = await prisma.alerts.findMany({
      where: whereClause,

      orderBy: {
        created_at: "desc"
      },

      select: {
        id: true,
        alert_type: true,
        status: true,
        confidence: true,
        message: true,
        created_at: true,

        cases: {
          select: {
            case_number: true,
            case_type: true,
            assigned_admin: true
          }
        },

        case_person: {
          select: {
            full_name: true,
            is_primary: true
          }
        },

        cctv_cameras: {
          select: {
            location_description: true
          }
        }
      }
    })

    const formatted = alerts.map(a => ({
      id: a.id,
      status: a.status,
      case_type: a.cases?.case_type,
      confidence: a.confidence,
      person_name: a.case_person?.full_name,
      is_primary: a.case_person?.is_primary,
      case_number: a.cases?.case_number,
      location: a.cctv_cameras?.location_description,
      created_at: a.created_at,
      message: a.message
    }))

    return res.json({
      success: true,
      data: formatted
    })

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      success: false,
      message: "Failed to fetch alerts"
    })

  }
}

export const getAlertDetails = async (req, res) => {
  try {

    const alertId = req.params.id
    const userId = req.user.id
    const role = req.user.role

    let whereClause = {
      id: alertId
    }

    if (role === "USER") {

      whereClause.cases = {
        created_by: userId
      }

    } else if (role === "ADMIN") {

      whereClause.cases = {
        assigned_admin: userId
      }

    }

    const alert = await prisma.alerts.findFirst({
      where: whereClause,

      select: {
        id: true,
        alert_type: true,
        status: true,
        confidence: true,
        message: true,
        created_at: true,

        cases: {
          select: {
            case_number: true,
            case_type: true
          }
        },

        case_person: {
          select: {
            full_name: true,
            is_primary: true
          }
        },

        cctv_cameras: {
          select: {
            location_description: true
          }
        },

        cctv_logs: {
          select: {
            snapshot_path: true,
            detected_at: true
          }
        }
      }
    })

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found"
      })
    }

    return res.json({
      success: true,
      data: alert
    })

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      success: false,
      message: "Failed to fetch alert"
    })

  }
}

export const updateAlertStatus = async (req, res) => {
  try {

    const alertId = req.params.id
    const { status } = req.body

    const userId = req.user.id
    const role = req.user.role

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only admins can update alert status"
      })
    }

    const allowedStatuses = [
      "ACKNOWLEDGED",
      "RESOLVED",
      "DISMISSED"
    ]

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      })
    }

    let whereClause = { id: alertId }

    if (role === "ADMIN") {
      whereClause.cases = {
        assigned_admin: userId
      }
    }

    const alert = await prisma.alerts.findFirst({
      where: whereClause,
      select: { status: true }
    })

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found"
      })
    }

    // Prevent invalid transitions
    if (alert.status === "OPEN" && status === "RESOLVED") {
      return res.status(400).json({
        success: false,
        message: "Alert must be acknowledged first"
      })
    }

    const updateData = { status }

    if (status === "ACKNOWLEDGED") {
      updateData.acknowledged_by = userId
      updateData.acknowledged_at = new Date()
    }

    if (status === "RESOLVED") {
      updateData.resolved_by = userId
      updateData.resolved_at = new Date()
    }

    await prisma.alerts.update({
      where: { id: alertId },
      data: updateData
    })

    return res.json({
      success: true,
      message: "Alert status updated"
    })

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      success: false,
      message: "Failed to update alert status"
    })
  }
}