import { useEffect, useState, useRef } from "react"
import api from "@/lib/axios"

const CCTV = () => {

  const [cameras, setCameras] = useState([])
  const [logs, setLogs] = useState([])
  const [previewCam, setPreviewCam] = useState(null)

  const logContainerRef = useRef(null)
  const videoRefs = useRef({})
  const readers = useRef({})

  /* ================= FETCH CAMERAS ================= */

  useEffect(() => {

    const fetchCameras = async () => {
      try {

        const res = await api.get("/cameras")
        setCameras(res.data.slice(0, 4))

      } catch (err) {
        console.error("Camera fetch failed:", err)
      }
    }

    fetchCameras()

  }, [])

  /* ================= ATTACH STREAM ================= */

  useEffect(() => {

    cameras.forEach((cam) => {

      console.log("Creating reader for", cam.camera_code)

      if (!cam?.webrtc_url) return

      const video = videoRefs.current[cam.camera_code]
      if (!video) return

      if (readers.current[cam.camera_code]) return

      try {

        const reader = new window.MediaMTXWebRTCReader({

          url: `${cam.webrtc_url}/whep`,

          onError: (err) => {
            console.error("Stream error:", err)
          },

          onTrack: (evt) => {
            video.srcObject = evt.streams[0]
          }

        })

        readers.current[cam.camera_code] = reader

      } catch (err) {
        console.error("Reader creation failed:", err)
      }

    })

  }, [cameras])

  /* ================= WEBSOCKET ================= */

  useEffect(() => {

    const ws = new WebSocket("ws://localhost:8080")

    ws.onopen = () => {
      console.log("CCTV websocket connected")
    }

    ws.onmessage = (event) => {

      const data = JSON.parse(event.data)

      if (data.type === "NEW_DETECTION") {

        setLogs(prev => [
          ...prev.slice(-50),
          {
            id: crypto.randomUUID(),
            camera: data.payload.camera_code || data.payload.camera_id,
            person: data.payload.person_name,
            case_number: data.payload.case_number,
            status: data.payload.detection_status,
            confidence: data.payload.confidence?.toFixed(2),
            time: new Date(
              data.payload.detected_at || Date.now()
            ).toLocaleTimeString()
          }
        ])

      }

    }

    return () => ws.close()

  }, [])

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {

    if (logContainerRef.current) {
      logContainerRef.current.scrollTop =
        logContainerRef.current.scrollHeight
    }

  }, [logs])

  /* ================= Clean up ================= */

  useEffect(() => {

    return () => {
      Object.values(readers.current).forEach(reader => {
        try {
          reader.close()
        } catch {}
      })
    }

  }, [])

  /* ================= CAMERA SLOTS ================= */

  const slots = [...cameras]

  while (slots.length < 4) {
    slots.push(null)
  }

  return (

    <div className="w-full h-[calc(100vh-120px)] flex">

      {/* CAMERA GRID */}

      <div className="w-[60%] p-6 grid grid-cols-2 gap-6">

        {slots.map((cam, index) => {

          const isConnected = cam && cam.webrtc_url

          return (

            <div
              key={index}
              onClick={() => cam && setPreviewCam(cam)}
              className="relative rounded-2xl overflow-hidden shadow-xl bg-black cursor-pointer"
            >

              {isConnected ? (

                <>
                  <video
                    ref={(el) => {
                      if (cam) videoRefs.current[cam.camera_code] = el
                    }}
                    autoPlay
                    muted
                    playsInline
                    className="h-48 w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/20" />

                  <div className="absolute top-4 left-4 text-xs bg-black/70 text-white px-3 py-1 rounded-full font-mono">
                    {cam.camera_code}
                  </div>

                  <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
                    {cam.camera_name}
                  </div>

                  <div
                    className={`absolute bottom-4 right-4 text-xs px-3 py-1 rounded-full
                    ${
                      cam.status === "ACTIVE"
                        ? "bg-green-600"
                        : cam.status === "MAINTENANCE"
                        ? "bg-yellow-600"
                        : "bg-gray-600"
                    } text-white`}
                  >
                    {cam.status}
                  </div>

                </>

              ) : (

                <div className="h-48 flex items-center justify-center text-gray-500 font-mono">
                  No Camera Found
                </div>

              )}

            </div>

          )

        })}

      </div>

      {/* TERMINAL LOGS */}

      <div className="w-[40%] p-6">

        <div className="h-full bg-black rounded-2xl flex flex-col">

          <div className="px-6 py-4 border-b border-green-700 text-green-400 font-mono text-sm">
            Detection Logs
          </div>

          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-xs text-green-400 space-y-2"
          >

            {logs.map((log) => (

              <div key={log.id}>

                <span className="text-green-500">
                  [{log.time}]
                </span>{" "}

                <span className="text-white">
                  {log.camera}
                </span>{" "}

                →

                <span className="text-blue-400 ml-1">
                  {log.person}
                </span>

                →

                <span className="text-blue-400 ml-1">
                  {log.case_number}
                </span>

                →

                <span
                  className={`ml-1 ${
                    log.status === "CONFIRMED"
                      ? "text-red-400"
                      : log.status === "POSSIBLE"
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

      {/* ================= PREVIEW MODAL ================= */}

      {previewCam && (

        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

          <div className="relative bg-black rounded-xl overflow-hidden w-[80%] h-[80%]">

            <button
              onClick={() => setPreviewCam(null)}
              className="absolute top-4 right-4 text-white bg-black/70 px-3 py-1 rounded z-10"
            >
              ✕
            </button>

            <video
              ref={(el) => {

                if (!previewCam || !el) return

                if (readers.current[`preview_${previewCam.camera_code}`]) return

                const reader = new window.MediaMTXWebRTCReader({

                  url: `${previewCam.webrtc_url}/whep`,

                  onTrack: (evt) => {
                    el.srcObject = evt.streams[0]
                  },

                  onError: (err) => {
                    console.error("Preview stream error:", err)
                  }

                })

                readers.current[`preview_${previewCam.camera_code}`] = reader

              }}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />

            <div className="absolute bottom-4 left-4 text-white bg-black/60 px-3 py-2 rounded">
              {previewCam.camera_code} — {previewCam.camera_name}
            </div>

          </div>

        </div>

      )}

    </div>

  )

}

export default CCTV