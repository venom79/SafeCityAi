import prisma from "../db/prisma.js"

export const getDashboard = async (req, res) => {
  try {

    const userId = req.user.id

    const [
      totalCases,
      activeCases,
      closedCases,
      totalResolvedAlerts,
      recentCases,
      recentAlerts
    ] = await Promise.all([

      prisma.cases.count({
        where: { created_by: userId }
      }),

      prisma.cases.count({
        where: {
          created_by: userId,
          is_active: true
        }
      }),

      prisma.cases.count({
        where: {
          created_by: userId,
          is_active: false
        }
      }),

      prisma.alerts.count({
        where: {
          status: "RESOLVED",
          cases: {
            created_by: userId
          }
        }
      }),

      prisma.cases.findMany({
        where: { created_by: userId },
        orderBy: { created_at: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          created_at: true
        }
      }),

      prisma.alerts.findMany({
        where: {
          status: "RESOLVED",
          cases: {
            created_by: userId
          }
        },
        orderBy: { created_at: "desc" },
        take: 5,
        select: {
          id: true,
          message: true,
          alert_type: true,
          confidence: true,
          created_at: true,
          camera_id: true
        }
      })

    ])

    res.json({
      stats: {
        total_cases: totalCases,
        active_cases: activeCases,
        closed_cases: closedCases,
        alerts: totalResolvedAlerts
      },
      recent_cases: recentCases,
      recent_alerts: recentAlerts
    })

  } catch (err) {
    console.error("Dashboard error:", err)
    res.status(500).json({ message: "Failed to load dashboard" })
  }
}