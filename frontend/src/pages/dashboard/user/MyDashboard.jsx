import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { FilePlus, Bell, FolderOpen, ArrowRight } from "lucide-react"

const MyDashboard = () => {
  const navigate = useNavigate()

  // Dummy Data (Replace later with API)
  const [stats] = useState({
    totalCases: 4,
    activeCases: 2,
    closedCases: 1,
    alerts: 3,
  })

  const recentCases = [
    {
      id: "1",
      title: "Missing Person – Central Market",
      status: "UNDER_REVIEW",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Lost Child – Bus Stand",
      status: "APPROVED",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]

  const recentAlerts = [
    {
      id: "1",
      message: "Possible match detected at Railway Station",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      message: "Case status updated to UNDER REVIEW",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ]

  return (
    <div className="w-full space-y-10">

      {/* ================= HERO ================= */}
      <div className="bg-white rounded-xl shadow-sm p-8 border-l-4 border-black flex flex-col md:flex-row md:items-center md:justify-between gap-6">

        <div>
          <h1 className="text-2xl font-semibold">
            Case Management Dashboard
          </h1>

          <p className="text-gray-500 mt-2 max-w-xl">
            Monitor your reported cases, track investigation progress,
            and respond to alerts from one centralized control panel.
          </p>
        </div>

        <button
          onClick={() => navigate("register-case")}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-zinc-800 transition"
        >
          <FilePlus size={18} />
          Register New Case
        </button>

      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Total Cases</p>
          <p className="text-3xl font-semibold mt-2">{stats.totalCases}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Active Cases</p>
          <p className="text-3xl font-semibold mt-2">{stats.activeCases}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Closed Cases</p>
          <p className="text-3xl font-semibold mt-2">{stats.closedCases}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Alerts</p>
          <p className="text-3xl font-semibold mt-2">{stats.alerts}</p>
        </div>

      </div>

      {/* ================= RECENT CASES ================= */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Recent Cases
          </h2>

          <button
            onClick={() => navigate("my-cases")}
            className="text-sm text-black flex items-center gap-1 hover:underline"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        {recentCases.length === 0 && (
          <p className="text-sm text-gray-500">
            No cases registered yet.
          </p>
        )}

        {recentCases.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`cases/${item.id}`)}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{item.title}</h3>
              <span className="text-xs text-gray-500">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Status: {item.status.replaceAll("_", " ")}
            </p>
          </div>
        ))}

      </div>

      {/* ================= RECENT ALERTS ================= */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell size={18} />
            Recent Alerts
          </h2>

          <button
            onClick={() => navigate("alerts")}
            className="text-sm text-black flex items-center gap-1 hover:underline"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        {recentAlerts.length === 0 && (
          <p className="text-sm text-gray-500">
            No alerts available.
          </p>
        )}

        {recentAlerts.map(alert => (
          <div
            key={alert.id}
            className="p-4 bg-gray-50 rounded-lg"
          >
            <p className="text-sm text-gray-700">
              {alert.message}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {new Date(alert.created_at).toLocaleString()}
            </p>
          </div>
        ))}

      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div
          onClick={() => navigate("my-cases")}
          className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition"
        >
          <FolderOpen size={28} />
          <div>
            <h3 className="font-semibold">
              Manage My Cases
            </h3>
            <p className="text-sm text-gray-500">
              View progress and track investigation updates.
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate("alerts")}
          className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition"
        >
          <Bell size={28} />
          <div>
            <h3 className="font-semibold">
              View Alerts
            </h3>
            <p className="text-sm text-gray-500">
              Check matches and system notifications.
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}

export default MyDashboard