import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/axios"
import { toast } from "sonner"
import { X, ChevronDown, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"


const statusColors = {
  SUBMITTED: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAW_REQUESTED: "bg-orange-100 text-orange-800",
  WITHDRAWN: "bg-gray-200 text-gray-800",
  CLOSED: "bg-black text-white",
}

const categoryColors = {
  MISSING: "bg-blue-100 text-blue-800",
  WANTED: "bg-red-100 text-red-800",
}

const CaseDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()

  const [caseData, setCaseData] = useState(null)
  const [persons, setPersons] = useState([])
  const [photosMap, setPhotosMap] = useState({})
  const [expandedPerson, setExpandedPerson] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [showWithdrawRequestModal, setShowWithdrawRequestModal] = useState(false)
  const [withdrawReason, setWithdrawReason] = useState("")
  const [withdrawRequestLoading, setWithdrawRequestLoading] = useState(false)
  const [admins, setAdmins] = useState([])
  const [adminsLoading, setAdminsLoading] = useState(false)


  const navigate = useNavigate()


  useEffect(() => {
    fetchCaseDetails()
    fetchAdmins()
  }, [id])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelectedImage(null)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  const fetchCaseDetails = async () => {
    try {
      setLoading(true)

      const [caseRes, personsRes] = await Promise.all([
        api.get(`/cases/${id}`),
        api.get(`/cases/${id}/person`)
      ])

      setCaseData(caseRes.data.data)
      setPersons(personsRes.data.data)

      const photoRequests = personsRes.data.data.map(person =>
        api.get(`/case-persons/${person.id}/photos`)
      )

      const photoResponses = await Promise.all(photoRequests)

      const photoMap = {}
      personsRes.data.data.forEach((person, index) => {
        photoMap[person.id] = photoResponses[index].data.data
      })

      setPhotosMap(photoMap)

    } catch {
      toast.error("Failed to load case details")
    } finally {
      setLoading(false)
    }
  }
  
  const fetchAdmins = async () => {
    try {

      if(user.role != "SUPER_ADMIN") return;

      setAdminsLoading(true)

      const res = await api.get("/users/admins")

      setAdmins(res.data.data)

    } catch (err) {

      console.error(err)
      toast.error("Failed to load admins")

    } finally {

      setAdminsLoading(false)

    }
  }

  const handleCloseCase = async () => {
    try {
      setClosing(true)

      await api.post(`/cases/${id}/close`)

      toast.success("Case closed successfully")
      setShowCloseModal(false)
      fetchCaseDetails()

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to close case")
    } finally {
      setClosing(false)
    }
  }

  const handleAccept = async () => {
    try {
      setActionLoading(true)
      await api.post(`/cases/${id}/accept`)
      toast.success("Case approved")
      fetchCaseDetails()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve case")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    try {
      if (!rejectReason.trim()) {
        toast.error("Rejection reason is required")
        return
      }

      setActionLoading(true)

      await api.post(`/cases/${id}/reject`, {
        reason: rejectReason,
      })

      toast.success("Case rejected")
      setShowRejectModal(false)
      setRejectReason("")
      fetchCaseDetails()

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject case")
    } finally {
      setActionLoading(false)
    }
  }

  const handleAssign = async () => {
    try {
      if (!selectedAdmin) {
        toast.error("Select an admin first")
        return
      }

      setActionLoading(true)

      await api.post(`/cases/${id}/assign`, {
        adminId: selectedAdmin,
      })

      toast.success("Case assigned successfully")
      setShowAssignModal(false)
      setSelectedAdmin("")
      fetchCaseDetails()

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign case")
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmWithdraw = async () => {
    try {
      setWithdrawLoading(true)

      await api.post(`/cases/${id}/withdraw/confirm`)

      toast.success("Case marked as withdrawn")
      setShowWithdrawModal(false)
      fetchCaseDetails()

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm withdrawal")
    } finally {
      setWithdrawLoading(false)
    }
  }

  const handleRejectWithdraw = async () => {
    try {

      setWithdrawLoading(true)

      await api.post(`/cases/${id}/withdraw/reject`)

      toast.success("Withdrawal request rejected")

      fetchCaseDetails()

    } catch (err) {

      toast.error(err.response?.data?.message || "Failed to reject withdrawal")

    } finally {

      setWithdrawLoading(false)

    }
  }

  const handleWithdrawRequest = async () => {
    try {

      if (!withdrawReason.trim()) {
        toast.error("Please provide a reason")
        return
      }

      setWithdrawRequestLoading(true)

      await api.post(`/cases/${id}/withdraw`, {
        reason: withdrawReason
      })

      toast.success("Withdraw request sent")

      setShowWithdrawRequestModal(false)
      setWithdrawReason("")

      fetchCaseDetails()

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request withdrawal")
    } finally {
      setWithdrawRequestLoading(false)
    }
  }

  if (loading) return <div className="py-20 text-center">Loading...</div>
  if (!caseData) return <div className="py-20 text-center">Case not found</div>

  return (
    <div className="max-w-6xl mx-auto space-y-14">

      {/* ================= BACK + HEADER ================= */}
      <div className="space-y-4">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div>
          <h1 className="text-2xl font-semibold">
            {caseData.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {caseData.case_number}
          </p>
        </div>

      </div>


      {/* ================= CASE INFO ================= */}

      <div className="bg-gray-50 rounded-xl shadow-sm p-8 space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">

          <div>
            <p className="text-gray-500">Status</p>
            <span className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[caseData.status]}`}>
              {caseData.status.replaceAll("_", " ")}
            </span>
          </div>

          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-medium mt-1">{caseData.case_type}</p>
          </div>

          <div>
            <p className="text-gray-500">Last Seen</p>
            <p className="font-medium mt-1">
              {caseData.last_seen_location || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-medium mt-1">
              {new Date(caseData.created_at).toLocaleDateString()}
            </p>
          </div>

        </div>

        <div>
          <p className="text-gray-500 text-sm mb-2">Description</p>
          <p className="text-sm">
            {caseData.description || "No description provided"}
          </p>
        </div>

        {caseData.status === "WITHDRAW_REQUESTED" && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 space-y-2">

            <p className="text-sm font-semibold text-orange-700">
              Withdrawal Request
            </p>

            <p className="text-sm text-orange-700">
              {caseData.withdraw_reason || "No reason provided"}
            </p>

            {caseData.withdraw_requested_at && (
              <p className="text-xs text-orange-600">
                Requested on{" "}
                {new Date(caseData.withdraw_requested_at).toLocaleString()}
              </p>
            )}

          </div>
        )}

      </div>

      {/* ================= USER ACTIONS ================= */}
      {user?.role === "USER" &&
        !["CLOSED", "WITHDRAW_REQUESTED", "WITHDRAWN"].includes(caseData.status) && (
        <div className="bg-orange-50 rounded-xl shadow-sm p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h3 className="text-sm font-semibold text-orange-700">
                Withdraw Case
              </h3>

              <p className="text-xs text-orange-600 mt-1">
                You can request withdrawal if the case is no longer needed.
              </p>
            </div>

            <button
              onClick={() => setShowWithdrawRequestModal(true)}
              className="px-5 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition cursor-pointer"
            >
              Request Withdrawal
            </button>

          </div>

        </div>
      )}

      {/* ================= ADMIN ACTIONS ================= */}
      {user?.role === "ADMIN" && caseData.status !== "CLOSED" && (
        <div className="bg-red-50 rounded-xl shadow-sm p-6 space-y-4">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h3 className="text-sm font-semibold text-red-700">
                Close Case
              </h3>
              <p className="text-xs text-red-600 mt-1">
                Case should only be closed after full investigation and completion.
              </p>
            </div>

            <button
              onClick={() => setShowCloseModal(true)}
              className="px-5 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
            >
              Close Case
            </button>

          </div>

        </div>
      )}

      {/* ================= SUPER ADMIN ACTIONS ================= */}
      {user?.role === "SUPER_ADMIN" && (

        <div className="bg-indigo-50 rounded-xl shadow-sm p-6 space-y-6">

          {/* SUBMITTED → ACCEPT / REJECT */}
          {caseData.status === "SUBMITTED" && (
            <div className="flex flex-wrap gap-4">

              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
              >
                {actionLoading ? "Processing..." : "Accept Case"}
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
              >
                Reject Case
              </button>

            </div>
          )}

          {caseData.status === "APPROVED" && (
            <div className="flex flex-wrap items-center gap-4">

              <select
                value={selectedAdmin}
                onChange={(e) => setSelectedAdmin(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm"
              >
                <option value="">
                  {adminsLoading ? "Loading admins..." : "Select Admin"}
                </option>

                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.full_name}
                  </option>
                ))}

              </select>

              <button
                onClick={handleAssign}
                disabled={actionLoading || !selectedAdmin}
                className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                Assign Admin
              </button>

            </div>
          )}

          {/* UNDER REVIEW → REASSIGN */}
          {caseData.status === "UNDER_REVIEW" && (
            <div className="flex flex-wrap items-center gap-4">

              <select
                value={selectedAdmin}
                onChange={(e) => setSelectedAdmin(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm"
              >
                <option value="">
                  {adminsLoading ? "Loading admins..." : "Reassign Admin"}
                </option>

                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.full_name}
                  </option>
                ))}

              </select>

              <button
                onClick={handleAssign}
                disabled={actionLoading || !selectedAdmin}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Reassign
              </button>

            </div>
          )}

          {/* WITHDRAW REQUESTED → CONFIRM WITHDRAW */}
          {caseData.status === "WITHDRAW_REQUESTED" && (
            <div className="bg-orange-50 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <h3 className="text-sm font-semibold text-orange-700">
                  Withdrawal Request Pending
                </h3>
                <p className="text-xs text-orange-600 mt-1">
                  The case owner has requested withdrawal. Review investigation status before confirming.
                </p>
              </div>

              <div className="flex gap-3">

                <button
                  onClick={handleRejectWithdraw}
                  disabled={withdrawLoading}
                  className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Reject Request
                </button>

                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Confirm Withdrawal
                </button>

              </div>

            </div>
          )}
        </div>
      )}

      {/* ================= PERSONS ================= */}
      <div className="space-y-10">

        <h2 className="text-lg font-semibold">Persons Involved</h2>

        {persons.map(person => (
          <div key={person.id} className="bg-gray-50 rounded-xl shadow-sm p-8 space-y-6">

            {/* BASIC INFO */}
            <div className="flex justify-between items-center flex-wrap gap-4">

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-medium">
                    {person.full_name}
                  </h3>

                  {person.alias && (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      Alias: {person.alias}
                    </span>
                  )}

                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${categoryColors[person.category]}`}>
                    {person.category}
                  </span>

                  {person.is_primary && (
                    <span className="text-xs bg-black text-white px-3 py-1 rounded-full">
                      Primary
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  {person.gender} • {person.age || "N/A"} years
                </p>
              </div>

              <button
                onClick={() =>
                  setExpandedPerson(
                    expandedPerson === person.id ? null : person.id
                  )
                }
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
              >
                View Detailed Profile
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    expandedPerson === person.id ? "rotate-180" : ""
                  }`}
                />
              </button>

            </div>

            {/* ADVANCED DETAILS */}
            {expandedPerson === person.id && (
              <div className="pt-6 border-t space-y-6 text-sm">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

                  <div>
                    <p className="text-gray-500">Height</p>
                    <p className="font-medium">{person.height_cm || "N/A"} cm</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Weight</p>
                    <p className="font-medium">{person.weight_kg || "N/A"} kg</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Skin Tone</p>
                    <p className="font-medium">{person.skin_tone || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Eye Color</p>
                    <p className="font-medium">{person.eye_color || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Hair Color</p>
                    <p className="font-medium">{person.hair_color || "N/A"}</p>
                  </div>

                </div>

                <div>
                  <p className="text-gray-500 mb-1">Last Known Clothing</p>
                  <p>{person.last_known_clothing || "N/A"}</p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Distinguishing Marks</p>
                  <p>{person.distinguishing_marks || "N/A"}</p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Additional Description</p>
                  <p>{person.description || "N/A"}</p>
                </div>

              </div>
            )}

            {/* PHOTOS */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600">Photos</p>

              <div className="flex gap-4 flex-wrap">
                {photosMap[person.id]?.map(photo => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedImage(photo.file_url)}
                    className="relative w-36 h-36 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={photo.file_url}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}

      </div>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white"
            >
              <X size={28} />
            </button>

            <img
              src={selectedImage}
              alt="preview"
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}


      {/* ================= CLOSE CASE MODAL ================= */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-6 shadow-lg">

            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Confirm Case Closure
              </h2>
              <p className="text-sm text-gray-600">
                This action will mark the case as CLOSED.
                Make sure investigation is fully completed before proceeding.
              </p>
            </div>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowCloseModal(false)}
                disabled={closing}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleCloseCase}
                disabled={closing}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
              >
                {closing ? "Closing..." : "Confirm Close"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ================= REJECT MODAL ================= */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-6 shadow-lg">

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">
                Reject Case
              </h2>
              <p className="text-sm text-gray-600">
                Provide a clear reason for rejecting this case.
              </p>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter rejection reason..."
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer"
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>

            </div>

          </div>
        </div>
      )}
      
      {/* ================= WITHDRAW RERQUEST MODAL ================= */}
      {showWithdrawRequestModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">

          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-6 shadow-lg">

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">
                Request Case Withdrawal
              </h2>

              <p className="text-sm text-gray-600">
                Provide a reason for withdrawing this case.
              </p>
            </div>

            <textarea
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter reason..."
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowWithdrawRequestModal(false)}
                disabled={withdrawRequestLoading}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleWithdrawRequest}
                disabled={withdrawRequestLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
              >
                {withdrawRequestLoading ? "Sending..." : "Send Request"}
              </button>

            </div>

          </div>

        </div>
      )}


      {/* ================= WITHDRAW CONFIRM MODAL ================= */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-6 shadow-lg">

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">
                Confirm Withdrawal
              </h2>
              <p className="text-sm text-gray-600">
                This will permanently mark the case as WITHDRAWN.
                Ensure the investigation has been properly reviewed.
              </p>
            </div>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowWithdrawModal(false)}
                disabled={withdrawLoading}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmWithdraw}
                disabled={withdrawLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
              >
                {withdrawLoading ? "Processing..." : "Confirm"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default CaseDetail
