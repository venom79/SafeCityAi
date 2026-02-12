import { useState } from "react"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

const dummyAlerts = [
  {
    id: "1",
    alert_type: "FACE_MATCH",
    status: "OPEN",
    confidence: 0.94,
    person_name: "Rahul Sharma",
    is_primary: true,
    case_number: "WANT-82917321",
    camera: "CAM-002",
    location: "Railway Platform 2",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    alert_type: "FACE_MATCH",
    status: "ACKNOWLEDGED",
    confidence: 0.81,
    person_name: "Ravi",
    is_primary: false,
    case_number: "WANT-82917321",
    camera: "CAM-001",
    location: "Bus Stand Entrance",
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "3",
    alert_type: "FACE_MATCH",
    status: "RESOLVED",
    confidence: 0.88,
    person_name: "Unknown Person",
    is_primary: false,
    case_number: "MISS-55198231",
    camera: "CAM-004",
    location: "Market Square",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
]

const statusStyles = {
  OPEN: "bg-red-100 text-red-700",
  ACKNOWLEDGED: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-700",
  DISMISSED: "bg-gray-200 text-gray-700",
}

const Alerts = () => {
  const [alerts, setAlerts] = useState(dummyAlerts)
  const [filter, setFilter] = useState("ALL")

  const handleAcknowledge = (id) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === id ? { ...a, status: "ACKNOWLEDGED" } : a
      )
    )
  }

  const handleResolve = (id) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === id ? { ...a, status: "RESOLVED" } : a
      )
    )
  }

  const handleDismiss = (id) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === id ? { ...a, status: "DISMISSED" } : a
      )
    )
  }

  const filteredAlerts =
    filter === "ALL"
      ? alerts
      : alerts.filter(a => a.status === filter)

  return (
    <div className="w-full space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">
          Alerts Control Center
        </h1>

        <div className="flex gap-3 flex-wrap">
          {["ALL", "OPEN", "ACKNOWLEDGED", "RESOLVED", "DISMISSED"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 text-sm rounded-lg transition ${
                filter === type
                  ? "bg-black text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* ALERT LIST */}
      <div className="space-y-6">

        {filteredAlerts.length === 0 && (
          <div className="text-gray-500 text-sm py-20 text-center">
            No alerts found.
          </div>
        )}

        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-gray-50 rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            {/* LEFT SECTION */}
            <div className="space-y-3 flex-1">

              <div>
                <h2 className="text-lg font-semibold">
                  {alert.person_name}
                  {alert.is_primary && (
                    <span className="ml-2 text-xs bg-black text-white px-2 py-1 rounded">
                      Primary
                    </span>
                  )}
                </h2>

                <p className="text-sm text-gray-500">
                  Case: {alert.case_number}
                </p>
              </div>

              <div className="text-sm text-gray-700">
                Detected at <span className="font-medium">{alert.camera}</span> • {alert.location}
              </div>

              <div className="text-xs text-gray-500">
                Confidence: {(alert.confidence * 100).toFixed(0)}% •{" "}
                {new Date(alert.created_at).toLocaleString()}
              </div>

            </div>

            {/* RIGHT SECTION */}
            <div className="flex flex-col items-end gap-4">

              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  statusStyles[alert.status]
                }`}
              >
                {alert.status}
              </span>

              <div className="flex gap-3 flex-wrap">

                {alert.status === "OPEN" && (
                  <>
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                      <AlertTriangle size={16} />
                      Acknowledge
                    </button>

                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                      <XCircle size={16} />
                      Dismiss
                    </button>
                  </>
                )}

                {alert.status === "ACKNOWLEDGED" && (
                  <>
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <CheckCircle size={16} />
                      Resolve
                    </button>

                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                      <XCircle size={16} />
                      Dismiss
                    </button>
                  </>
                )}

              </div>

            </div>
          </div>
        ))}

      </div>

    </div>
  )
}

export default Alerts
