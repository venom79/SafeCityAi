import { useEffect, useState } from "react"
import { Bell, X } from "lucide-react"
import api from "@/lib/axios"

const MyAlerts = () => {

  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedAlert, setSelectedAlert] = useState(null)
  const [alertDetails, setAlertDetails] = useState(null)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get("/alerts")
        setAlerts(res.data.data || [])
      } catch (err) {
        console.error("Failed to fetch alerts", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const openAlert = async (alert) => {
    try {
      setSelectedAlert(alert)

      const res = await api.get(`/alerts/${alert.id}`)
      setAlertDetails(res.data.data)

    } catch (err) {
      console.error("Failed to fetch alert details", err)
    }
  }

  const closeModal = () => {
    setSelectedAlert(null)
    setAlertDetails(null)
  }

  // Disable background scroll when modal is open
  useEffect(() => {
    if (selectedAlert) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [selectedAlert])

  return (
    <div className="w-full space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Bell size={22} />
          Detection Updates
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Recent detection events related to your missing person cases.
        </p>
      </div>


      {/* ALERT LIST */}
      <div className="space-y-6">

        {loading && (
          <div className="text-gray-500 text-sm py-20 text-center">
            Loading alerts...
          </div>
        )}

        {!loading && alerts.length === 0 && (
          <div className="text-gray-500 text-sm py-20 text-center">
            No detection updates available.
          </div>
        )}

        {alerts.map(alert => (
          <div
            key={alert.id}
            onClick={() => openAlert(alert)}
            className="bg-gray-50 rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:bg-gray-100 transition"
          >

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
                Spotted at{" "}
                <span className="font-medium">{alert.camera}</span> • {alert.location}
              </div>

              <div className="text-xs text-gray-500">
                Match Confidence{" "}
                <span className="font-medium">
                  {(alert.confidence * 100).toFixed(0)}%
                </span>{" "}
                • {new Date(alert.created_at).toLocaleString()}
              </div>

            </div>

          </div>
        ))}

      </div>


      {/* MODAL */}
      {selectedAlert && alertDetails && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

          <div className="bg-white rounded-xl max-w-lg w-full p-6 relative max-h-[80vh] overflow-y-auto">

            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-gray-500 hover:text-black"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-4">
              Detection Details
            </h2>


            {alertDetails.cctv_logs?.snapshot_path && (
              <div className="flex justify-center mb-4">
                <img
                  src={`${import.meta.env.VITE_API_URL}${alertDetails.cctv_logs.snapshot_path}`}
                  alt="Detection snapshot"
                  className="max-h-60 rounded-lg object-contain"
                />
              </div>
            )}

            <div className="space-y-2 text-sm">

              <p>
                <span className="font-medium">Person:</span>{" "}
                {alertDetails.case_person?.full_name}
              </p>

              <p>
                <span className="font-medium">Case:</span>{" "}
                {alertDetails.cases?.case_number}
              </p>

              <p>
                <span className="font-medium">Location:</span>{" "}
                {alertDetails.cctv_cameras?.location_description}
              </p>

              <p>
                <span className="font-medium">Confidence:</span>{" "}
                {(alertDetails.confidence * 100).toFixed(0)}%
              </p>

              <p>
                <span className="font-medium">Detected At:</span>{" "}
                {new Date(alertDetails.created_at).toLocaleString()}
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

export default MyAlerts