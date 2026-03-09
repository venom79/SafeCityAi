import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/axios"
import { toast } from "sonner"

const statusColors = {
  DRAFT: "bg-gray-200 text-gray-800",
}

const typeColors = {
  MISSING: "bg-blue-100 text-blue-800",
  WANTED: "bg-red-100 text-red-800",
}

const DraftCases = () => {
  const navigate = useNavigate()

  const [draftCases, setDraftCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      const res = await api.get("/cases/drafts/my")

      setDraftCases(res.data.data || [])

    } catch (err) {
      console.error(err)
      toast.error("Failed to load drafts")
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = (id) => {
    localStorage.setItem("draftCaseId", id)

    navigate(`/dashboard/user/register-case?draft=${id}`)
  }

  return (
    <div className="w-full space-y-10">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Draft Cases
        </h1>
      </div>

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="text-center py-20 text-gray-500">
          Loading drafts...
        </div>
      )}

      {/* ================= EMPTY STATE ================= */}
      {!loading && draftCases.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No draft cases available.
        </div>
      )}

      {/* ================= DRAFT LIST ================= */}
      <div className="space-y-6">

        {draftCases.map((item) => (
          <div
            key={item.id}
            className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col md:flex-row justify-between gap-6"
          >

            {/* LEFT SIDE */}
            <div className="space-y-3 flex-1">

              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-semibold">
                  {item.title || "Untitled Draft"}
                </h2>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${typeColors[item.case_type]}`}
                >
                  {item.case_type}
                </span>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors.DRAFT}`}
                >
                  Draft
                </span>
              </div>

              <p className="text-sm text-gray-500">
                Draft ID: {item.id}
              </p>

            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col justify-between items-end">

              <div className="text-sm text-gray-500">
                Last Edited:
                <div className="font-medium text-gray-700">
                  {new Date(item.updated_at).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => handleContinue(item.id)}
                className="mt-6 bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Continue Editing →
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}

export default DraftCases