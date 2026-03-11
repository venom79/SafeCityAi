import { useState, useEffect } from "react"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import api from "@/lib/axios"

const API_URL = import.meta.env.VITE_API_URL

const statusStyles = {
  OPEN: "bg-red-100 text-red-700",
  ACKNOWLEDGED: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-700",
  DISMISSED: "bg-gray-200 text-gray-700",
}

const Alerts = () => {

  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)

  const [selectedAlert, setSelectedAlert] = useState(null)
  const [alertDetails, setAlertDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const fetchAlerts = async () => {
    try {

      const res = await api.get("/alerts")
      setAlerts(res.data.data)

    } catch (err) {

      console.error("Failed to fetch alerts", err)

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlertDetails = async (id) => {

    try {

      setDetailsLoading(true)

      const res = await api.get(`/alerts/${id}`)

      setAlertDetails(res.data.data)

    } catch (err) {

      console.error("Failed to fetch alert details", err)

    } finally {

      setDetailsLoading(false)

    }
  }

  const openAlert = (alert) => {
    setSelectedAlert(alert)
    fetchAlertDetails(alert.id)
  }

  const closeModal = () => {
    setSelectedAlert(null)
    setAlertDetails(null)
  }

  const updateStatus = async (id, status) => {

    try {

      await api.patch(`/alerts/${id}/status`, { status })

      setAlerts(prev =>
        prev.map(a =>
          a.id === id ? { ...a, status } : a
        )
      )

      if (alertDetails) {
        setAlertDetails(prev => ({ ...prev, status }))
      }

    } catch (err) {

      console.error("Failed to update alert", err)

    }
  }

  const filteredAlerts =
    filter === "ALL"
      ? alerts
      : alerts.filter(a => a.status === filter)

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading alerts...
      </div>
    )
  }

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
            onClick={() => openAlert(alert)}
            className="bg-gray-50 cursor-pointer rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-100 transition"
          >

            <div className="space-y-3 flex-1">

              <div>
                <h2 className="text-lg font-semibold">
                  {alert.person_name || "Unknown"}
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
                {alert.location || "Unknown location"}
              </div>

              <div className="text-xs text-gray-500">
                Confidence: {(alert.confidence * 100).toFixed(0)}% •{" "}
                {new Date(alert.created_at).toLocaleString()}
              </div>

            </div>

            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                statusStyles[alert.status]
              }`}
            >
              {alert.status}
            </span>

          </div>

        ))}

      </div>

      {/* MODAL */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl w-full max-w-xl p-6 space-y-5">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Alert Details
              </h2>

              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-black"
              >
                Close
              </button>
            </div>

            {detailsLoading ? (
              <div className="text-center text-gray-500">
                Loading details...
              </div>
            ) : (

              alertDetails && (

                <div className="space-y-4">

                  <div>
                    <strong>Person:</strong>{" "}
                    {alertDetails.case_person?.full_name || "Unknown"}
                  </div>

                  <div>
                    <strong>Case:</strong>{" "}
                    {alertDetails.cases?.case_number}
                  </div>

                  <div>
                    <strong>Location:</strong>{" "}
                    {alertDetails.cctv_cameras?.location_description}
                  </div>

                  <div>
                    <strong>Detected at:</strong>{" "}
                    {new Date(alertDetails.created_at).toLocaleString()}
                  </div>

                  <div>
                    <strong>Confidence:</strong>{" "}
                    {(alertDetails.confidence * 100).toFixed(0)}%
                  </div>

                  <div>
                    <strong>Message:</strong>{" "}
                    {alertDetails.message}
                  </div>

                  {/* SNAPSHOT */}
                  {alertDetails.cctv_logs?.snapshot_path && (
                    <div className="flex justify-center">
                      <img
                        src={`${API_URL}${alertDetails.cctv_logs.snapshot_path}`}
                        alt="Detection Snapshot"
                        className="max-h-64 w-auto rounded-lg border object-contain"
                      />
                    </div>
                  )}

                  {/* STATUS ACTIONS */}

                  <div className="flex gap-3 pt-2">

                    {alertDetails.status === "OPEN" && (
                      <>
                        <button
                          onClick={() => updateStatus(alertDetails.id, "ACKNOWLEDGED")}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg"
                        >
                          <AlertTriangle size={16} />
                          Acknowledge
                        </button>

                        <button
                          onClick={() => updateStatus(alertDetails.id, "DISMISSED")}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg"
                        >
                          <XCircle size={16} />
                          Dismiss
                        </button>
                      </>
                    )}

                    {alertDetails.status === "ACKNOWLEDGED" && (
                      <>
                        <button
                          onClick={() => updateStatus(alertDetails.id, "RESOLVED")}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
                        >
                          <CheckCircle size={16} />
                          Resolve
                        </button>

                        <button
                          onClick={() => updateStatus(alertDetails.id, "DISMISSED")}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg"
                        >
                          <XCircle size={16} />
                          Dismiss
                        </button>
                      </>
                    )}

                  </div>

                </div>

              )

            )}

          </div>

        </div>
      )}

    </div>
  )
}

export default Alerts