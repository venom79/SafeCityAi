import { useState } from "react"
import { Bell } from "lucide-react"

const dummyAlerts = [
  {
    id: "1",
    case_type: "MISSING",
    confidence: 0.94,
    person_name: "Rahul Sharma",
    is_primary: true,
    case_number: "MISS-82917321",
    camera: "CAM-002",
    location: "Railway Platform 2",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    case_type: "MISSING",
    confidence: 0.81,
    person_name: "Ravi",
    is_primary: false,
    case_number: "MISS-22119921",
    camera: "CAM-001",
    location: "Bus Stand Entrance",
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
]

const MyAlerts = () => {
  const [alerts] = useState(dummyAlerts)

  return (
    <div className="w-full space-y-10">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Bell size={22} />
          Detection Updates
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Recent detection events related to your missing person cases.
        </p>
      </div>

      {/* ================= ALERT LIST ================= */}
      <div className="space-y-6">

        {alerts.length === 0 && (
          <div className="text-gray-500 text-sm py-20 text-center">
            No detection updates available.
          </div>
        )}

        {alerts.map(alert => (
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
                Spotted at{" "}
                <span className="font-medium">{alert.camera}</span> •{" "}
                {alert.location}
              </div>

              <div className="text-xs text-gray-500">
                Match Confidence:{" "}
                <span className="font-medium">
                  {(alert.confidence * 100).toFixed(0)}%
                </span>{" "}
                • {new Date(alert.created_at).toLocaleString()}
              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}

export default MyAlerts