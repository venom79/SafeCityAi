import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/axios"
import { toast } from "sonner"

const statusColors = {
  SUBMITTED: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAW_REQUESTED: "bg-orange-100 text-orange-800",
  WITHDRAWN: "bg-gray-200 text-gray-800",
  CLOSED: "bg-black text-white",
}

const typeColors = {
  MISSING: "bg-blue-100 text-blue-800",
  WANTED: "bg-red-100 text-red-800",
}

const CaseList = () => {
  const navigate = useNavigate()

  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCases()
  }, [statusFilter, typeFilter, page])

  const fetchCases = async () => {
    try {
      setLoading(true)

      const res = await api.get("/cases", {
        params: {
          status: statusFilter || undefined,
          caseType: typeFilter || undefined,
          page,
          limit: 10,
        },
      })

      setCases(res.data.data)
      setTotalPages(res.data.meta.totalPages)

    } catch {
      toast.error("Failed to load cases")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-10">

      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap justify-between items-center gap-4">

        <h1 className="text-2xl font-semibold">
          All Cases
        </h1>

        <div className="flex gap-3 flex-wrap">

          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1)
              setStatusFilter(e.target.value)
            }}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Status</option>
            {Object.keys(statusColors).map(status => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setPage(1)
              setTypeFilter(e.target.value)
            }}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Types</option>
            <option value="MISSING">Missing</option>
            <option value="WANTED">Wanted</option>
          </select>

        </div>
      </div>

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="text-center py-20 text-gray-500">
          Loading cases...
        </div>
      )}

      {/* ================= CASE LIST ================= */}
      {!loading && cases.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No cases found.
        </div>
      )}

      <div className="space-y-6">

        {cases.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/dashboard/superadmin/cases/${item.id}`)}
            className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-6 flex flex-col md:flex-row justify-between gap-6"
          >

            {/* LEFT SIDE */}
            <div className="space-y-3 flex-1">

              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-semibold">
                  {item.title}
                </h2>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${typeColors[item.case_type]}`}
                >
                  {item.case_type}
                </span>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[item.status]}`}
                >
                  {item.status.replaceAll("_", " ")}
                </span>
              </div>

              <p className="text-sm text-gray-500">
                Case Number: {item.case_number}
              </p>

              <p className="text-sm text-gray-600">
                {item.description
                  ? item.description.slice(0, 120) + "..."
                  : "No description provided"}
              </p>

            </div>

            {/* RIGHT SIDE */}
            <div className="text-sm text-gray-500 flex flex-col justify-between items-end">

              <div>
                Created:
                <div className="font-medium text-gray-700">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="text-black font-medium mt-4">
                View Details →
              </div>

            </div>

          </div>
        ))}

      </div>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 pt-8">

          <button
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(prev => prev + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            Next
          </button>

        </div>
      )}

    </div>
  )
}

export default CaseList