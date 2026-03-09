import { createContext, useContext, useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import api from "@/lib/axios"

const CaseFormContext = createContext(null)

export const CaseFormProvider = ({ children }) => {

  const [step, setStep] = useState(1)
  const [agree, setAgree] = useState(false)
  const [caseType, setCaseType] = useState("MISSING")
  const [dragActive, setDragActive] = useState(false)

  const [caseId, setCaseId] = useState(null)
  const [searchParams] = useSearchParams()

  const [complainant, setComplainant] = useState({
    full_name: "",
    address: "",
    phone: "",
    email: "",
    gender: "",
    age: "",
    relation: "",
    aadhaar: ""
  })

  const [caseDetails, setCaseDetails] = useState({
    title: "",
    description: "",
    lastSeenLocation: "",
    lastSeenDate: "",
    lastSeenTime: ""
  })

  const [persons, setPersons] = useState([])
  const [selectedPersonIndex, setSelectedPersonIndex] = useState(null)

  const [newPerson, setNewPerson] = useState({
    full_name: "",
    alias: "",
    gender: "",
    age: "",
    height_cm: "",
    weight_kg: "",
    skin_tone: "",
    eye_color: "",
    hair_color: "",
    last_known_clothing: "",
    distinguishing_marks: "",
    description: "",
    photos: []
  })


  const resolveStep = (data) => {

    if (!data.complainants) {
      return 2
    }

    if (
      !data.title ||
      !data.last_seen_location ||
      !data.last_seen_time
    ) {
      return 3
    }

    if (!data.case_person || data.case_person.length === 0) {
      return 4
    }

    const hasPhotos = data.case_person.some(
      p => p.case_person_photos && p.case_person_photos.length > 0
    )

    if (!hasPhotos) {
      return 5
    }

    return 5
  }

  const loadDraft = async (id) => {
    try {

      const res = await api.get(`/cases/${id}/full`)

      const data = res.data.data

      setStep(resolveStep(data))
      
      setCaseType(data.case_type)

      if (data.complainants) {
        setComplainant({
          full_name: data.complainants.full_name || "",
          phone: data.complainants.phone || "",
          email: data.complainants.email || "",
          gender: data.complainants.gender || "",
          age: data.complainants.age || "",
          relation: data.complainants.relation || "",
          aadhaar: data.complainants.aadhaar || "",
          address: data.complainants.address || ""
        })
      }

      setCaseDetails({
        title: data.title || "",
        description: data.description || "",
        lastSeenLocation: data.last_seen_location || "",
        lastSeenDate: data.last_seen_time
          ? data.last_seen_time.split("T")[0]
          : "",
        lastSeenTime: data.last_seen_time
          ? data.last_seen_time.split("T")[1].slice(0,5)
          : ""
      })

      if (data.case_person) {

        const personsWithPhotos = data.case_person.map((person) => {

          const photos = (person.case_person_photos || []).map((p) => ({
            id: p.id,
            file_url: `http://localhost:8080/${p.file_path.replace(/\\/g, "/")}`
          }))

          return {
            ...person,
            photos
          }

        })

        setPersons(personsWithPhotos)
      }

    } catch (err) {
      console.error(err)
    }
  }

  /*
  ==========================
  RESTORE DRAFT ON REFRESH
  ==========================
  */

  useEffect(() => {
    const urlDraft = searchParams.get("draft")
    const storedDraft = localStorage.getItem("draftCaseId")

    const draftId = urlDraft || storedDraft

    if (!draftId) return

    setCaseId(draftId)
    localStorage.setItem("draftCaseId", draftId)

    loadDraft(draftId)

  }, [])

  /*
  ==========================
  CREATE DRAFT CASE
  ==========================
  */

  const createDraft = async () => {
    try {

      if (caseId) return caseId

      const res = await api.post("/cases/draft", {
        caseType
      })

      const newCaseId = res.data.data.caseId

      setCaseId(newCaseId)
      localStorage.setItem("draftCaseId", newCaseId)

      return newCaseId

    } catch (err) {
      console.error(err)
      toast.error("Failed to create draft")
    }
  }

  /*
  ==========================
  SAVE COMPLAINANT
  ==========================
  */

  const saveComplainant = async () => {
    try {

      const id = caseId || await createDraft()

      const res = await api.patch(`/cases/${id}/complainant`, {
        ...complainant,
        age: complainant.age ? Number(complainant.age) : null
      })

      toast.success("Complainant saved")

      return res.data.success;

    } catch (err) {
      console.error(err)
      toast.error("Failed to save complainant")
      return false;
    }
  }

  /*
  ==========================
  SAVE CASE DETAILS
  ==========================
  */

  const saveCaseDetails = async () => {
    try {

      const id = caseId || await createDraft()

      let lastSeenTime = null

      if (caseDetails.lastSeenDate && caseDetails.lastSeenTime) {
        lastSeenTime = new Date(
          `${caseDetails.lastSeenDate}T${caseDetails.lastSeenTime}:00`
        ).toISOString()
      }

      const res = await api.patch(`/cases/${id}/details`, {
        title: caseDetails.title,
        description: caseDetails.description,
        lastSeenLocation: caseDetails.lastSeenLocation,
        lastSeenTime
      })

      toast.success("Case details saved")

      return res.data.success;

    } catch (err) {
      console.error(err)
      toast.error("Failed to save case details")
      return false;
    }
  }

  /*
  ==========================
  ADD PERSON
  ==========================
  */

  const addPerson = async () => {

    if (!newPerson.full_name.trim()) {
      toast.error("Please enter the person's full name")
      return
    }

    try {

      const id = caseId || await createDraft()

      const res = await api.post(`/cases/${id}/person`, {
        ...newPerson,
        age: newPerson.age ? Number(newPerson.age) : null,
        height_cm: newPerson.height_cm ? Number(newPerson.height_cm) : null,
        weight_kg: newPerson.weight_kg ? Number(newPerson.weight_kg) : null,
        category: caseType
      })

      setPersons(prev => [
        ...prev,
        { ...newPerson, id: res.data.data.id, photos: [] }
      ])

      setNewPerson({
        full_name: "",
        alias: "",
        gender: "",
        age: "",
        height_cm: "",
        weight_kg: "",
        skin_tone: "",
        eye_color: "",
        hair_color: "",
        last_known_clothing: "",
        distinguishing_marks: "",
        description: "",
        photos: []
      })

      toast.success("Person added")

      return res.data.success;

    } catch (err) {
      console.error(err)
      toast.error("Failed to add person")
    }
  }

  /*
  ==========================
  REMOVE PERSON
  ==========================
  */

  const removePerson = async (personId) => {

    try {

      await api.delete(`/cases/${caseId}/person/${personId}`)

      setPersons(prev =>
        prev.filter(p => p.id !== personId)
      )

      toast.success("Person removed")

    } catch (err) {

      console.error(err)

      toast.error("Failed to remove person")

    }

  }


  /*
  ==========================
  PHOTOS
  ==========================
  */

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e, personIndex) => {
    e.preventDefault()
    e.stopPropagation()

    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
      .filter(file => file.type.startsWith("image/"))

    if (files.length > 0) addPhotos(files, personIndex)
  }

  const addPhotos = async (files, personIndex) => {

    try {

      const person = persons[personIndex]

      const uploadedPhotos = []

      for (const file of files) {

        const formData = new FormData()
        formData.append("photo", file)

        const res = await api.post(
          `/case-persons/${person.id}/photos`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        )

        uploadedPhotos.push({
          id: res.data.data.id,
          url: URL.createObjectURL(file)
        })
      }

      setPersons(prev => {

        const updated = [...prev]

        updated[personIndex] = {
          ...updated[personIndex],
          photos: [
            ...(updated[personIndex].photos || []),
            ...uploadedPhotos
          ]
        }

        return updated
      })

    } catch (err) {

      console.error(err)

      toast.error("Photo upload failed")

    }

  }

  const removePhoto = async (personIndex, photoIndex) => {

    try {

      const person = persons[personIndex]
      const photo = person.photos[photoIndex]

      await api.delete(`/case-persons/${person.id}/photos/${photo.id}`)

      setPersons(prev => {

        const updated = [...prev]

        updated[personIndex].photos.splice(photoIndex,1)

        return updated
      })

    } catch(err) {

      console.error(err)

      toast.error("Failed to delete photo")

    }

  }

  /*
  ==========================
  SUBMIT CASE
  ==========================
  */

  const handleSubmit = async () => {

    try {

      await api.post(`/cases/${caseId}/submit`)

      toast.success("Case submitted successfully")

      localStorage.removeItem("draftCaseId")

      setCaseId(null)
      setComplainant({
        full_name: "",
        address: "",
        phone: "",
        email: "",
        gender: "",
        age: "",
        relation: "",
        aadhaar: ""
      })

      setCaseDetails({
        title: "",
        description: "",
        lastSeenLocation: "",
        lastSeenDate: "",
        lastSeenTime: ""
      })
      setPersons([])
      setStep(1)
      setAgree(false)

      return true;
      
    } catch (err) {
      console.error(err)
      toast.error("Failed to submit case")

      return false;
    }
  }

  /*
  ==========================
  CONTEXT
  ==========================
  */

  return (
    <CaseFormContext.Provider value={{

      step, setStep,
      agree, setAgree,

      caseType, setCaseType,

      caseId, setCaseId,

      dragActive, setDragActive,

      complainant, setComplainant,
      caseDetails, setCaseDetails,

      persons, setPersons,
      selectedPersonIndex, setSelectedPersonIndex,

      newPerson, setNewPerson,

      createDraft,
      saveComplainant,
      saveCaseDetails,

      addPerson,
      removePerson,

      handleDrag,
      handleDrop,
      addPhotos,
      removePhoto,

      handleSubmit

    }}>
      {children}
    </CaseFormContext.Provider>
  )
}

export const useCaseForm = () => {
  const ctx = useContext(CaseFormContext)

  if (!ctx) {
    throw new Error("useCaseForm must be used within CaseFormProvider")
  }

  return ctx
}