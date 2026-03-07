import { useState, useRef } from "react"
import { UploadCloud, Loader2 } from "lucide-react"

const detectionStyles = {
  UNKNOWN: "bg-gray-200 text-gray-700",
  POSSIBLE: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-700",
  FALSE_POSITIVE: "bg-red-100 text-red-700",
  REVIEWED: "bg-blue-100 text-blue-700",
}

const detectionOptions = [
  "UNKNOWN",
  "POSSIBLE",
  "CONFIRMED",
  "FALSE_POSITIVE",
  "REVIEWED",
]

const SketchScan = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const inputRef = useRef(null)

  const handleFile = (selectedFile) => {
    if (!selectedFile) return
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    handleFile(droppedFile)
  }

  const handleMatch = () => {
    if (!file) return
    setLoading(true)

    // Simulated backend response
    setTimeout(() => {
      setResults([
        {
          id: "1",
          name: "Rahul Sharma",
          case_number: "WANT-82917321",
          similarity: 0.93,
          status: "UNKNOWN",
          photo: "http://localhost:8080/uploads/sketchScanDemo/main.jpg",
        },
        {
          id: "2",
          name: "Ravi Kumar",
          case_number: "MISS-22119921",
          similarity: 0.88,
          status: "UNKNOWN",
          photo: "http://localhost:8080/uploads/sketchScanDemo/2.jpg",
        },
        {
          id: "3",
          name: "Arjun Singh",
          case_number: "WANT-55199211",
          similarity: 0.81,
          status: "UNKNOWN",
          photo: "http://localhost:8080/uploads/sketchScanDemo/3.jpg",
        },
        {
          id: "4",
          name: "Unknown Subject",
          case_number: "MISS-88827122",
          similarity: 0.76,
          status: "UNKNOWN",
          photo: "http://localhost:8080/uploads/sketchScanDemo/4.jpg",
        },
        {
          id: "5",
          name: "Vikram Patel",
          case_number: "WANT-33445566",
          similarity: 0.72,
          status: "UNKNOWN",
          photo: "http://localhost:8080/uploads/sketchScanDemo/5.jpg",
        },
      ])
      setLoading(false)
    }, 2000)
  }

  const updateStatus = (id, newStatus) => {
    setResults(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: newStatus } : r
      )
    )
  }

  return (
    <div className="w-full space-y-12">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">
          Sketch Scan Intelligence
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a suspect sketch and match against stored embeddings.
        </p>
      </div>

      {/* UPLOAD AREA */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-black transition bg-gray-50"
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {!preview ? (
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <UploadCloud size={40} />
            <p className="text-sm">
              Drag & drop sketch here or click to upload
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <img
              src={preview}
              alt="Sketch preview"
              className="max-h-64 rounded-lg shadow-sm"
            />
            <p className="text-xs text-gray-500">
              {file?.name}
            </p>
          </div>
        )}
      </div>

      {/* MATCH BUTTON */}
      <div>
        <button
          onClick={handleMatch}
          disabled={!file || loading}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Matching...
            </span>
          ) : (
            "Match Sketch"
          )}
        </button>
      </div>

      {/* RESULTS */}
      {results.length > 0 && (
        <div className="space-y-8">

          <h2 className="text-lg font-semibold">
            Top 5 Candidates
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

            {results.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-gray-50 rounded-xl shadow-sm p-5 flex flex-col"
              >

                {/* PHOTO */}
                <div className="mb-4">
                  <img
                    src={candidate.photo}
                    alt="candidate"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>

                {/* INFO */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-sm font-semibold">
                    {candidate.name}
                  </h3>

                  <p className="text-xs text-gray-500">
                    {candidate.case_number}
                  </p>

                  <p className="text-xs text-gray-700">
                    Similarity:{" "}
                    <span className="font-semibold">
                      {(candidate.similarity * 100).toFixed(1)}%
                    </span>
                  </p>
                </div>

                {/* STATUS BADGE */}
                <div className="mt-3">
                  <span
                    className={`text-[10px] px-3 py-1 rounded-full font-medium ${detectionStyles[candidate.status]}`}
                  >
                    {candidate.status}
                  </span>
                </div>

                {/* DECISION DROPDOWN */}
                <div className="mt-3">
                  <select
                    value={candidate.status}
                    onChange={(e) =>
                      updateStatus(candidate.id, e.target.value)
                    }
                    className="w-full border rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {detectionOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            ))}

          </div>

        </div>
      )}


    </div>
  )
}

export default SketchScan
