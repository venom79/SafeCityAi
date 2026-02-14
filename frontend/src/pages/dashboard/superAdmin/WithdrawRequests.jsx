import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { CheckCircle } from "lucide-react"

const statusColors = {
  WITHDRAW_REQUESTED: "bg-orange-100 text-orange-800",
  WITHDRAWN: "bg-gray-200 text-gray-800",
}

const typeColors = {
  MISSING: "bg-blue-100 text-blue-800",
  WANTED: "bg-red-100 text-red-800",
}

const dummyWithdrawCases = [
  {
    id: "1",
    case_number: "MISS-22119921",
    title: "Missing Person – Central Market",
    case_type: "MISSING",
    status: "WITHDRAW_REQUESTED",
    description: "Family requested withdrawal after locating the person.",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    case_number: "WANT-82917321",
    title: "Wanted Suspect – Theft Case",
    case_type: "WANTED",
    status: "WITHDRAW_REQUESTED",
    description: "Complainant withdrew charges.",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
]

const WithdrawRequests = () => {
  const navigate = useNavigate()

  const [cases, setCases] = useState(dummyWithdrawCases)
  const [selectedCase, setSelectedCase] = useState(null)
  const [processing, setProcessing] = useState(false)

  const handleConfirmWithdraw = async () => {
    try {
      setProcessing(true)

      // TODO: Replace with real API
      // await api.post(`/cases/${selectedCase.id}/withdraw/confirm`)

      setCases(prev =>
        prev.filter(c => c.id !== selectedCase.id)
      )

      toast.success("Withdrawal confirmed successfully")
      setSelectedCase(null)

    } catch {
      toast.error("Failed to confirm withdrawal")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="w-full space-y-10">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-semibold">
          Withdrawal Requests
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review cases where users have requested withdrawal.
        </p>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {cases.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No pending withdrawal requests.
        </div>
      )}

      {/* ================= LIST ================= */}
      <div className="space-y-6">

        {cases.map((item) => (
          <div
            key={item.id}
            className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col md:flex-row justify-between gap-6"
          >

            {/* LEFT SIDE */}
            <div
              className="space-y-3 flex-1 cursor-pointer"
              onClick={() =>
                navigate(`/dashboard/superadmin/cases/${item.id}`)
              }
            >

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
            <div className="flex flex-col justify-between items-end">

              <div className="text-sm text-gray-500">
                Created:
                <div className="font-medium text-gray-700">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex flex-col items-end gap-4 mt-6">

                <button
                  onClick={() =>
                    navigate(`/dashboard/superadmin/cases/${item.id}`)
                  }
                  className="text-black font-medium"
                >
                  View Details →
                </button>

                <button
                  onClick={() => setSelectedCase(item)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <CheckCircle size={16} />
                  Confirm Withdraw
                </button>

              </div>

            </div>

          </div>
        ))}

      </div>

      {/* ================= CONFIRM MODAL ================= */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-6 shadow-lg">

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">
                Confirm Withdrawal
              </h2>
              <p className="text-sm text-gray-600">
                This will permanently mark case{" "}
                <span className="font-medium">
                  {selectedCase.case_number}
                </span>{" "}
                as withdrawn.
              </p>
              <p className="text-xs text-red-500">
                Ensure investigation and verification are complete before proceeding.
              </p>
            </div>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setSelectedCase(null)}
                disabled={processing}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmWithdraw}
                disabled={processing}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {processing ? "Processing..." : "Confirm"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default WithdrawRequests