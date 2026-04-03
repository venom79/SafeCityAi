import { useState, useRef } from "react"
import { UploadCloud, Loader2, X, History, ChevronDown, ChevronUp } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"

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
  const [searched, setSearched] = useState(false)

  const [imageType, setImageType] = useState("SKETCH")
  const [threshold, setThreshold] = useState(0.6)

  const [modelName, setModelName] = useState(null)
  const [modelVersion, setModelVersion] = useState(null)
  const [sketchPhotoId, setSketchPhotoId] = useState(null)

  // --- HISTORY STATE ---
  const [showHistory, setShowHistory] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyData, setHistoryData] = useState([])

  const inputRef = useRef(null)

  const handleFile = (selectedFile) => {
    if (!selectedFile) return
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    setResults([])
    setSearched(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    handleFile(droppedFile)
  }

  const handleMatch = async () => {
    if (!file) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("image_type", imageType)
      formData.append("threshold", threshold)
      const res = await api.post("/face-search", formData)
      setResults(res.data.matches || [])
      setModelName(res.data.model)
      setModelVersion(res.data.version)
      setSketchPhotoId(res.data.sketch_photo_id)
      setSearched(true)
    } catch (err) {
      console.error(err)
      toast.error("Face search failed")
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setPreview(null)
    setResults([])
    setSearched(false)
    setThreshold(0.6)
    setImageType("SKETCH")
  }

  const updateStatus = async (candidate, newStatus) => {
    setResults(prev =>
      prev.map(r =>
        r.id === candidate.id ? { ...r, status: newStatus } : r
      )
    )
    try {
      await api.post("/face-search/decision", {
        sketch_photo_id: sketchPhotoId,
        candidate_person_id: candidate.candidate_person_id,
        candidate_photo_id: candidate.candidate_photo_id,
        case_id: candidate.case_id,
        similarity: candidate.similarity,
        decision: newStatus,
        model_name: modelName,
        model_version: modelVersion
      })
      toast.success("Decision saved successfully")
    } catch (err) {
      toast.error("Failed to save decision")
    }
  }

  // --- HISTORY FETCH ---
  const fetchHistory = async () => {
    if (showHistory) {
      setShowHistory(false)
      return
    }
    setHistoryLoading(true)
    setShowHistory(true)
    try {
      const res = await api.get("/face-search/history")
      setHistoryData(Array.isArray(res.data.data) ? res.data.data : [])
    } catch (err) {
      console.error(err)
      toast.error("Failed to load scan history")
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <div className="w-full space-y-12">

      {/* Fix slider rendering across browsers */}
      <style>{`
        input[type="range"].sketch-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: linear-gradient(
            to right,
            #000 0%,
            #000 ${((threshold - 0.4) / (0.95 - 0.4)) * 100}%,
            #d1d5db ${((threshold - 0.4) / (0.95 - 0.4)) * 100}%,
            #d1d5db 100%
          );
          outline: none;
          cursor: pointer;
        }
        input[type="range"].sketch-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #000;
          cursor: pointer;
        }
        input[type="range"].sketch-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #000;
          border: none;
          cursor: pointer;
        }
      `}</style>

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">
          Face Intelligence Search
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a sketch or photo to match against stored embeddings.
        </p>
      </div>

      {/* SEARCH SETTINGS */}
      <div className="bg-gray-50 rounded-xl p-6 flex flex-wrap gap-8 items-end">

        {/* IMAGE TYPE */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Image Type</label>
          <select
            value={imageType}
            onChange={(e) => setImageType(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="SKETCH">Sketch</option>
            <option value="PHOTO">Photo</option>
          </select>
        </div>

        {/* THRESHOLD SLIDER — fixed */}
        <div className="space-y-2 w-72">
          <label className="text-xs text-gray-500">Similarity Threshold</label>
          <input
            type="range"
            min="0.4"
            max="0.95"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="sketch-slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>40%</span>
            <span className="font-medium text-black">
              {(threshold * 100).toFixed(0)}%
            </span>
            <span>95%</span>
          </div>
        </div>

        {/* CLEAR BUTTON */}
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
        >
          <X size={16} />
          Clear
        </button>

        {/* HISTORY BUTTON */}
        <button
          onClick={fetchHistory}
          className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-black transition flex items-center gap-2"
        >
          {historyLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <History size={16} />
          )}
          View Scan History
          {showHistory && !historyLoading
            ? <ChevronUp size={14} />
            : <ChevronDown size={14} />
          }
        </button>

      </div>

      {/* HISTORY PANEL */}
      {showHistory && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Scan History</h2>

          {historyLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-8">
              <Loader2 size={18} className="animate-spin" />
              Loading history...
            </div>
          ) : historyData.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              No scan history found.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Sketch</th>
                    <th className="px-4 py-3 text-left">Matched Photo</th>
                    <th className="px-4 py-3 text-left">Candidate</th>
                    <th className="px-4 py-3 text-left">Case</th>
                    <th className="px-4 py-3 text-left">Similarity</th>
                    <th className="px-4 py-3 text-left">Decision</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historyData.map((entry, i) => (
                    <tr key={entry.id ?? i} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        {entry.sketch_image ? (
                          <img
                            src={entry.sketch_image}
                            alt="sketch"
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {entry.matched_image ? (
                          <img
                            src={entry.matched_image}
                            alt="matched"
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {entry.candidate_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {entry.case_number ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {entry.similarity_score != null
                          ? `${(entry.similarity_score * 100).toFixed(1)}%`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] px-3 py-1 rounded-full font-medium ${detectionStyles[entry.decision] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {entry.decision ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {entry.created_at
                          ? new Date(entry.created_at).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* UPLOAD AREA */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-black transition bg-gray-50"
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
            <p className="text-sm">Drag & drop image here or click to upload</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <img src={preview} alt="preview" className="max-h-64 rounded-lg shadow-sm" />
            <p className="text-xs text-gray-500">{file?.name}</p>
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
              Searching...
            </span>
          ) : (
            "Run Face Search"
          )}
        </button>
      </div>

      {/* NO MATCHES */}
      {searched && results.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-sm">No matches found for this image.</p>
        </div>
      )}

      {/* RESULTS */}
      {results.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-lg font-semibold">Top Matches</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {results.map(candidate => (
              <div
                key={candidate.id}
                className="bg-gray-50 rounded-xl shadow-sm p-5 flex flex-col hover:shadow-md transition"
              >
                <div className="mb-4">
                  <img
                    src={candidate.photo}
                    alt="candidate"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-sm font-semibold">{candidate.name}</h3>
                  <p className="text-xs text-gray-500">{candidate.case_number}</p>
                  <p className="text-xs text-gray-700">
                    Similarity{" "}
                    <span className="font-semibold">
                      {(candidate.similarity * 100).toFixed(1)}%
                    </span>
                  </p>
                </div>
                <div className="mt-3">
                  <span className={`text-[10px] px-3 py-1 rounded-full font-medium ${detectionStyles[candidate.status]}`}>
                    {candidate.status}
                  </span>
                </div>
                <div className="mt-3">
                  <select
                    value={candidate.status}
                    onChange={(e) => updateStatus(candidate, e.target.value)}
                    className="w-full border rounded-lg px-2 py-2 text-xs bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {detectionOptions.map(opt => (
                      <option key={opt} value={opt}>{opt.replace("_", " ")}</option>
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