import { CASE_STATUS } from "../constants/caseStatus.js";
import prisma from "../db/prisma.js";

export const getDashboard = async (req, res) => {
  try {

    const userId = req.user.id;

    // Base filter to exclude draft cases
    const caseFilter = {
      created_by: userId,
      status: { not: CASE_STATUS.DRAFT }
    };

    const [
      totalCases,
      activeCases,
      closedCases,
      totalResolvedAlerts,
      recentCases,
      recentAlerts
    ] = await Promise.all([

      prisma.cases.count({
        where: caseFilter
      }),

      prisma.cases.count({
        where: {
          ...caseFilter,
          is_active: true
        }
      }),

      prisma.cases.count({
        where: {
          ...caseFilter,
          is_active: false
        }
      }),

      prisma.alerts.count({
        where: {
          status: "RESOLVED",
          cases: caseFilter
        }
      }),

      prisma.cases.findMany({
        where: caseFilter,
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
          cases: caseFilter
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

    ]);

    console

    return res.status(200).json({
      stats: {
        total_cases: totalCases,
        active_cases: activeCases,
        closed_cases: closedCases,
        alerts: totalResolvedAlerts
      },
      recent_cases: recentCases,
      recent_alerts: recentAlerts
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard"
    });
  }
};