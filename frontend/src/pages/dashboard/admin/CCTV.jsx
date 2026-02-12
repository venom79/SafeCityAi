import { useEffect, useState, useRef } from "react"

// ================= DUMMY CAMERAS =================
const dummyCameras = [
  { id: "1", code: "CAM-001", name: "Bus Stand Entrance", status: "ACTIVE" },
  { id: "2", code: "CAM-002", name: "Railway Platform 2", status: "ACTIVE" },
  { id: "3", code: "CAM-003", name: "Mall Parking", status: "MAINTENANCE" },
  { id: "4", code: "CAM-004", name: "Highway Checkpost", status: "ACTIVE" },
]

// ================= LOG GENERATOR =================
const generateDummyLog = () => {
  const statuses = ["CONFIRMED", "PENDING", "FALSE_POSITIVE"]
  const cameras = ["CAM-001", "CAM-002", "CAM-003", "CAM-004"]

  return {
    id: crypto.randomUUID(),
    camera: cameras[Math.floor(Math.random() * cameras.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    confidence: (Math.random() * 0.4 + 0.6).toFixed(2),
    time: new Date().toLocaleTimeString(),
  }
}

const CCTV = () => {
  const [logs, setLogs] = useState([])
  const logContainerRef = useRef(null)

  // Simulate live logs
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => [...prev.slice(-50), generateDummyLog()])
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Smooth auto scroll
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop =
        logContainerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="w-full h-[calc(100vh-120px)] flex">

      {/* ================= CAMERA GRID ================= */}
      <div className="w-[60%] p-6 grid grid-cols-2 gap-6 overflow-y-auto">

        {dummyCameras.map((cam) => (
          <div
            key={cam.id}
            className="bg-black rounded-2xl overflow-hidden shadow-xl relative"
          >
            <div className="h-44 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-gray-600 text-sm">
              Live Feed Preview
            </div>

            {/* Camera Label */}
            <div className="absolute top-4 left-4 text-xs bg-black/70 text-white px-3 py-1 rounded-full">
              {cam.code}
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-4 left-4 text-white text-sm">
              {cam.name}
            </div>

            <div
              className={`absolute bottom-4 right-4 text-xs px-3 py-1 rounded-full ${
                cam.status === "ACTIVE"
                  ? "bg-green-600 text-white"
                  : "bg-yellow-500 text-black"
              }`}
            >
              {cam.status}
            </div>
          </div>
        ))}

      </div>

      {/* ================= TERMINAL LOGS ================= */}
      <div className="w-[40%] p-6">

        <div className="h-full bg-black rounded-2xl shadow-2xl flex flex-col">

          {/* Header */}
          <div className="px-6 py-4 border-b border-green-700 text-green-400 font-mono text-sm">
            Detection Logs
          </div>

          {/* Logs */}
          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-xs text-green-400 space-y-2"
          >
            {logs.map((log) => (
              <div key={log.id} className="leading-relaxed">

                <span className="text-green-500">
                  [{log.time}]
                </span>{" "}

                <span className="text-white">
                  {log.camera}
                </span>{" "}
                →

                <span
                  className={`ml-1 ${
                    log.status === "CONFIRMED"
                      ? "text-red-400"
                      : log.status === "PENDING"
                      ? "text-yellow-400"
                      : "text-gray-400"
                  }`}
                >
                  {log.status}
                </span>{" "}
                | Confidence: {log.confidence}

              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  )
}

export default CCTV
