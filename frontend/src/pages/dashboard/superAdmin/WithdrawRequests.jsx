import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { CheckCircle, XCircle } from "lucide-react"
import api from "@/lib/axios"

const statusColors = {
  WITHDRAW_REQUESTED: "bg-orange-100 text-orange-800",
  WITHDRAWN: "bg-gray-200 text-gray-800",
}

const typeColors = {
  MISSING: "bg-blue-100 text-blue-800",
  WANTED: "bg-red-100 text-red-800",
}

const WithdrawRequests = () => {

  const navigate = useNavigate()

  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedCase, setSelectedCase] = useState(null)
  const [processing, setProcessing] = useState(false)

  const fetchWithdrawRequests = async () => {

    try {

      const res = await api.get("/cases/withdraw-requests")

      setCases(res.data.data)

    } catch (err) {

      console.error(err)
      toast.error("Failed to load withdrawal requests")

    } finally {

      setLoading(false)

    }

  }

  useEffect(() => {
    fetchWithdrawRequests()
  }, [])

  const handleConfirmWithdraw = async () => {

    try {

      setProcessing(true)

      await api.post(`/cases/${selectedCase.id}/withdraw/confirm`)

      setCases(prev =>
        prev.filter(c => c.id !== selectedCase.id)
      )

      toast.success("Withdrawal confirmed")

      setSelectedCase(null)

    } catch {

      toast.error("Failed to confirm withdrawal")

    } finally {

      setProcessing(false)

    }

  }

  const handleRejectWithdraw = async (id) => {

    try {

      await api.post(`/cases/${id}/withdraw/reject`)

      setCases(prev =>
        prev.filter(c => c.id !== id)
      )

      toast.success("Withdrawal request rejected")

    } catch {

      toast.error("Failed to reject request")

    }

  }

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading withdrawal requests...
      </div>
    )
  }

  return (
    <div className="w-full space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">
          Withdrawal Requests
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review cases where users have requested withdrawal.
        </p>
      </div>

      {cases.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No pending withdrawal requests.
        </div>
      )}

      <div className="space-y-6">

        {cases.map((item) => (

          <div
            key={item.id}
            className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col md:flex-row justify-between gap-6"
          >

            {/* LEFT */}
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

              <div className="space-y-2">

                <p className="text-sm text-gray-600">
                  {item.description
                    ? item.description.slice(0, 120) + "..."
                    : "No description provided"}
                </p>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">

                  <p className="font-medium text-orange-800">
                    Withdraw Reason
                  </p>

                  <p className="text-orange-700">
                    {item.withdraw_reason || "No reason provided"}
                  </p>

                </div>

              </div>

            </div>

            {/* RIGHT */}
            <div className="flex flex-col justify-between items-end">

              <div className="text-sm text-gray-500">

                Requested:

                <div className="font-medium text-gray-700">
                  {item.withdraw_requested_at
                    ? new Date(item.withdraw_requested_at).toLocaleString()
                    : new Date(item.created_at).toLocaleString()}
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

                <div className="flex gap-3">

                  <button
                    onClick={() => setSelectedCase(item)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <CheckCircle size={16} />
                    Confirm
                  </button>

                  <button
                    onClick={() => handleRejectWithdraw(item.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>

                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* CONFIRM MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">

          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-6 shadow-lg">

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

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmWithdraw}
                disabled={processing}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg"
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