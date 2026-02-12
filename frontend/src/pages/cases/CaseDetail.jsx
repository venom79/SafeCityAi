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

  const navigate = useNavigate()


  useEffect(() => {
    fetchCaseDetails()
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
            <p className="font-medium mt-1">{caseData.last_seen_location || "N/A"}</p>
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
          <p className="text-sm">{caseData.description || "No description provided"}</p>
        </div>
      </div>

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

    </div>
  )
}

export default CaseDetail
