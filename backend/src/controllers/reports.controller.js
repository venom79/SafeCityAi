import prisma from "../db/prisma.js"

export const generateReport = async (req, res) => {
  try {

    const { startDate, endDate } = req.query

    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined


    /* -----------------------------
       FETCH DATA
    ------------------------------ */

    const logs = await prisma.cctv_logs.findMany({
      where: {
        detected_at: {
          gte: start,
          lte: end
        }
      },
      include: {
        cctv_cameras: true,
        case_person: true
      }
    })

    const alerts = await prisma.alerts.findMany({
      where: {
        created_at: {
          gte: start,
          lte: end
        }
      },
      include: {
        cctv_cameras: true,
        case_person: true
      }
    })


    /* -----------------------------
       DETECTION FUNNEL
    ------------------------------ */

    const possibleDetections = logs.filter(
      l => l.detection_status === "POSSIBLE"
    ).length

    const confirmedDetections = logs.filter(
      l => l.detection_status === "CONFIRMED"
    ).length

    const totalDetections = logs.length
    const totalAlerts = alerts.length


    /* -----------------------------
       AI ACCURACY
    ------------------------------ */

    const detectionAccuracy =
      possibleDetections > 0
        ? confirmedDetections / possibleDetections
        : 0


    /* -----------------------------
       CAMERA RISK RANKING
    ------------------------------ */

    const cameraActivity = {}

    logs.forEach(l => {

      const camera = l.cctv_cameras?.camera_name || "Unknown Camera"

      cameraActivity[camera] = (cameraActivity[camera] || 0) + 1

    })


    /* -----------------------------
       MOST DETECTED PERSONS
    ------------------------------ */

    const personDetections = {}

    logs.forEach(l => {

      if (!l.detected_person_id) return

      const name =
        l.case_person?.full_name ||
        l.case_person?.alias

      // skip unknown / empty names
      if (!name) return

      personDetections[name] = (personDetections[name] || 0) + 1

    })


    /* -----------------------------
       DETECTION TREND (daily)
    ------------------------------ */

    const detectionTrend = {}

    logs.forEach(l => {

      const day = l.detected_at.toISOString().split("T")[0]

      detectionTrend[day] = (detectionTrend[day] || 0) + 1

    })


    /* -----------------------------
       ALERT TREND
    ------------------------------ */

    const alertTrend = {}

    alerts.forEach(a => {

      const day = a.created_at.toISOString().split("T")[0]

      alertTrend[day] = (alertTrend[day] || 0) + 1

    })


    /* -----------------------------
       HOURLY DETECTION ACTIVITY
    ------------------------------ */

    const hourlyActivity = {}

    logs.forEach(l => {

      const hour = new Date(l.detected_at).getHours()

      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1

    })


    /* -----------------------------
       CONFIDENCE DISTRIBUTION
    ------------------------------ */

    const confidenceDistribution = {
      "0.5-0.6": 0,
      "0.6-0.7": 0,
      "0.7-0.8": 0,
      "0.8-0.9": 0,
      "0.9-1.0": 0
    }

    logs.forEach(l => {

      if (!l.confidence) return

      if (l.confidence < 0.6) confidenceDistribution["0.5-0.6"]++
      else if (l.confidence < 0.7) confidenceDistribution["0.6-0.7"]++
      else if (l.confidence < 0.8) confidenceDistribution["0.7-0.8"]++
      else if (l.confidence < 0.9) confidenceDistribution["0.8-0.9"]++
      else confidenceDistribution["0.9-1.0"]++

    })


    /* -----------------------------
       ALERT LIFECYCLE
    ------------------------------ */

    const openAlerts = alerts.filter(a => a.status === "OPEN").length
    const acknowledgedAlerts = alerts.filter(a => a.status === "ACKNOWLEDGED").length
    const resolvedAlerts = alerts.filter(a => a.status === "RESOLVED").length


    /* -----------------------------
       RESPONSE TIME
    ------------------------------ */

    const responseTimes = alerts
      .filter(a => a.acknowledged_at && a.created_at)
      .map(a =>
        (new Date(a.acknowledged_at) - new Date(a.created_at)) / 1000
      )

    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a,b)=>a+b,0)/responseTimes.length
        : 0


    /* -----------------------------
       AVERAGE CONFIDENCE
    ------------------------------ */

    const confidences = logs
      .filter(l => l.confidence)
      .map(l => l.confidence)

    const avgConfidence =
      confidences.length > 0
        ? confidences.reduce((a,b)=>a+b,0)/confidences.length
        : 0


    /* -----------------------------
       RESPONSE
    ------------------------------ */

    res.json({

      summary: {
        totalDetections,
        possibleDetections,
        confirmedDetections,
        totalAlerts,
        openAlerts,
        acknowledgedAlerts,
        resolvedAlerts,
        detectionAccuracy,
        avgConfidence,
        avgResponseTime
      },

      charts: {
        cameraActivity,
        personDetections,
        detectionTrend,
        alertTrend,
        hourlyActivity,
        confidenceDistribution
      },

      alerts,
      logs

    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      message: "Failed to generate report"
    })

  }
}


function buildReport(alert) {

  const person = alert.case_person
  const camera = alert.cctv_cameras
  const log = alert.cctv_logs
  const caseData = alert.cases
  const assignedOfficer = caseData?.users_cases_assigned_adminTousers

  return {

    report_id: alert.id,

    alert_information: {
      alert_type: alert.alert_type,
      status: alert.status,
      confidence: alert.confidence,
      message: alert.message,
      created_at: alert.created_at,
      acknowledged_at: alert.acknowledged_at,
      resolved_at: alert.resolved_at
    },

    case_information: caseData && {
      case_number: caseData.case_number,
      title: caseData.title,
      description: caseData.description,
      case_type: caseData.case_type,
      last_seen_location: caseData.last_seen_location,
      last_seen_time: caseData.last_seen_time,

      assigned_officer: {
        name: assignedOfficer?.full_name,
        email: assignedOfficer?.email
      }
    },

    detected_person: person && {
      name: person.full_name,
      alias: person.alias,
      gender: person.gender,
      age: person.age,
      height_cm: person.height_cm,
      weight_kg: person.weight_kg,
      skin_tone: person.skin_tone,
      eye_color: person.eye_color,
      hair_color: person.hair_color,
      clothing: person.last_known_clothing,
      marks: person.distinguishing_marks,
      description: person.description
    },

    detection_details: log && {
      detection_status: log.detection_status,
      confidence: log.confidence,
      detected_at: log.detected_at,
      ai_model: log.model_name,
      model_version: log.model_version,
      snapshot: log.snapshot_path
    },

    camera_information: camera && {
      camera_code: camera.camera_code,
      camera_name: camera.camera_name,
      location: camera.location_description,
      latitude: camera.latitude,
      longitude: camera.longitude
    },

    officers: {
      acknowledged_by: alert.users_alerts_acknowledged_byTousers?.full_name,
      resolved_by: alert.users_alerts_resolved_byTousers?.full_name
    }
  } 
}

export const generateAlertReport = async (req, res) => {
  try {

    const { alertId } = req.params

    const alert = await prisma.alerts.findUnique({
      where: { id: alertId },
      include: {
        cases: {
          include: {
            users_cases_assigned_adminTousers: true
          }
        },
        case_person: {
          include: {
            case_person_photos: true
          }
        },
        cctv_cameras: true,
        cctv_logs: true,
        users_alerts_resolved_byTousers: true,
        users_alerts_acknowledged_byTousers: true
      }
    })

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" })
    }

    if (alert.status !== "RESOLVED") {
      return res.status(400).json({
        message: "Report can only be generated for RESOLVED alerts"
      })
    }

    res.json({
      success: true,
      report: buildReport(alert)
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to generate report" })
  }
}