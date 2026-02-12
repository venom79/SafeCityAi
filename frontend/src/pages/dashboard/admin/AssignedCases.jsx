import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/axios"
import { toast } from "sonner"

const statusColors = {
  SUBMITTED: {
    badge: "bg-yellow-100 text-yellow-800",
    border: "border-l-yellow-500",
  },
  APPROVED: {
    badge: "bg-green-100 text-green-800",
    border: "border-l-green-500",
  },
  UNDER_REVIEW: {
    badge: "bg-blue-100 text-blue-800",
    border: "border-l-blue-500",
  },
  REJECTED: {
    badge: "bg-red-100 text-red-800",
    border: "border-l-red-500",
  },
  WITHDRAW_REQUESTED: {
    badge: "bg-orange-100 text-orange-800",
    border: "border-l-orange-500",
  },
  WITHDRAWN: {
    badge: "bg-gray-200 text-gray-800",
    border: "border-l-gray-400",
  },
  CLOSED: {
    badge: "bg-black text-white",
    border: "border-l-black",
  },
}

const AssignedCases = () => {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchCases()
  }, [statusFilter, typeFilter])

  const fetchCases = async () => {
    try {
      setLoading(true)

      const params = {}

      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.caseType = typeFilter

      const res = await api.get("/cases", { params })

      setCases(res.data.data)

    } catch (err) {
      toast.error("Failed to load assigned cases")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">

      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-2xl font-semibold">
          Assigned Cases
        </h2>
        <p className="text-sm text-gray-500">
          Cases currently under your responsibility.
        </p>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="flex flex-wrap gap-4">

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-4 py-2 text-sm bg-white"
        >
          <option value="">All Status</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="WITHDRAW_REQUESTED">Withdraw Requested</option>
          <option value="WITHDRAWN">Withdrawn</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-md px-4 py-2 text-sm bg-white"
        >
          <option value="">All Types</option>
          <option value="MISSING">Missing</option>
          <option value="WANTED">Wanted</option>
        </select>

      </div>

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="flex justify-center py-20">
          <p className="text-gray-500">Loading cases...</p>
        </div>
      )}

      {/* ================= EMPTY ================= */}
      {!loading && !cases.length && (
        <div className="text-center py-20">
          <h3 className="text-lg font-semibold mb-2">
            No Cases Found
          </h3>
          <p className="text-gray-500 text-sm">
            No cases match the selected filters.
          </p>
        </div>
      )}

      {/* ================= CARDS ================= */}
      <div className="space-y-4">
        {!loading &&
          cases.map((item) => {
            const style = statusColors[item.status] || {
              badge: "bg-gray-200 text-gray-800",
              border: "border-l-gray-400",
            }

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/dashboard/admin/cases/${item.id}`)}
                className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer border-l-4 ${style.border}`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  {/* LEFT */}
                  <div className="space-y-2">

                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-xs font-mono bg-gray-100 px-3 py-1 rounded-md">
                        {item.case_number}
                      </span>

                      <span className="text-sm text-gray-500">
                        {item.case_type}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-500">
                      Created on{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-6">

                    <span
                      className={`px-4 py-2 rounded-full text-xs font-medium ${style.badge}`}
                    >
                      {item.status.replaceAll("_", " ")}
                    </span>

                    <span className="text-sm font-medium text-gray-600 hover:text-black transition">
                      View Details →
                    </span>

                  </div>

                </div>
              </div>
            )
          })}
      </div>

    </div>
  )
}

export default AssignedCases
