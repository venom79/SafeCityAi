import { useEffect, useState, useRef } from "react"

// ================= DUMMY CAMERAS =================
const dummyCameras = [
  {
    id: "1",
    code: "CAM-001",
    name: "Bus Stand Entrance",
    status: "ACTIVE",
    image:
      "https://c8.alamy.com/comp/2YCFRBF/handout-cctv-issued-by-the-metropolitan-police-dated-892023-of-daniel-khalife-at-a-newsagents-in-grove-park-road-chiswick-london-which-was-shown-to-a-jury-at-the-old-bailey-london-during-his-trial-khalife-23-is-alleged-to-have-fled-his-army-barracks-in-january-2023-when-he-realised-he-would-face-criminal-charges-over-allegations-he-passed-classified-information-on-to-the-middle-eastern-countrys-intelligence-service-later-while-on-remand-he-is-alleged-to-have-escaped-from-hmp-wandsworth-in-september-2023-by-tying-himself-to-the-underside-of-a-food-delivery-truck-using-bedsheets-i-2YCFRBF.jpg",
  },
  {
    id: "2",
    code: "CAM-002",
    name: "Railway Platform 2",
    status: "",
    image: null,
  },
  {
    id: "3",
    code: "CAM-003",
    name: "Mall Parking",
    status: "MAINTENANCE",
    image: null,
  },
  {
    id: "4",
    code: "CAM-004",
    name: "Highway Checkpost",
    status: "ACTIVE",
    image: null,
  },
]

// ================= LOG GENERATOR =================
const generateDummyLog = () => {
  const statuses = ["CONFIRMED", "PENDING", "FALSE_POSITIVE"]
  const cameras = ["CAM-001"]

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

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => [...prev.slice(-50), generateDummyLog()])
    }, 2000)

    return () => clearInterval(interval)
  }, [])

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

        {dummyCameras.map((cam) => {
          const isConnected = !!cam.image

          return (
            <div
              key={cam.id}
              className="relative rounded-2xl overflow-hidden shadow-xl group bg-black"
            >
              {isConnected ? (
                <>
                  {/* CCTV Image */}
                  <img
                    src={cam.image}
                    alt={cam.name}
                    className="h-48 w-full object-cover grayscale brightness-75 group-hover:brightness-90 transition duration-500"
                  />

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/30" />

                  {/* Scanline Effect */}
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:100%_3px]" />

                  {/* Camera Code */}
                  <div className="absolute top-4 left-4 text-xs bg-black/70 text-white px-3 py-1 rounded-full font-mono">
                    {cam.code}
                  </div>

                  {/* Camera Name */}
                  <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
                    {cam.name}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute bottom-4 right-4 text-xs px-3 py-1 rounded-full font-medium bg-green-600 text-white">
                    {cam.status}
                  </div>

                  {/* Timestamp */}
                  <div className="absolute top-4 right-4 text-xs text-green-400 font-mono">
                    {new Date().toLocaleTimeString()}
                  </div>
                </>
              ) : (
                <>
                  {/* Empty Feed (same styling preserved) */}
                  <div className="h-48 w-full flex items-center justify-center text-gray-500 font-mono">
                    No Camera Connected
                  </div>
                </>
              )}
            </div>
          )
        })}

      </div>

      {/* ================= TERMINAL LOGS ================= */}
      <div className="w-[40%] p-6">

        <div className="h-full bg-black rounded-2xl shadow-2xl flex flex-col">

          <div className="px-6 py-4 border-b border-green-700 text-green-400 font-mono text-sm">
            Detection Logs
          </div>

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