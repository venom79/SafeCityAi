import { createContext, useContext, useState } from "react"
import { toast } from "sonner"

const CaseFormContext = createContext(null)

export function CaseFormProvider({ children }) {
  const [step, setStep] = useState(1)
  const [agree, setAgree] = useState(false)
  const [caseType, setCaseType] = useState("MISSING")
  const [dragActive, setDragActive] = useState(false)

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

  const saveDraft = () => {
    toast.success("Draft saved successfully", { description: "Your progress has been saved" })
  }

  const addPerson = () => {
    if (!newPerson.full_name.trim()) {
      toast.error("Please enter the person's full name")
      return
    }
    setPersons([...persons, { ...newPerson, photos: [] }])
    setNewPerson({
      full_name: "", alias: "", gender: "", age: "",
      height_cm: "", weight_kg: "", skin_tone: "", eye_color: "",
      hair_color: "", last_known_clothing: "", distinguishing_marks: "",
      description: "", photos: []
    })
    toast.success("Person added successfully")
  }

  const removePerson = (index) => {
    setPersons(persons.filter((_, i) => i !== index))
    if (selectedPersonIndex === index) setSelectedPersonIndex(null)
    toast.success("Person removed")
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e, personIndex) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"))
    if (files.length > 0) addPhotos(files, personIndex)
  }

  const addPhotos = (files, personIndex) => {
    const updated = [...persons]
    const newPhotos = files.map(file => ({ url: URL.createObjectURL(file), name: file.name }))
    updated[personIndex].photos = [...updated[personIndex].photos, ...newPhotos]
    setPersons(updated)
    toast.success(`${files.length} photo(s) added`)
  }

  const removePhoto = (personIndex, photoIndex) => {
    const updated = [...persons]
    updated[personIndex].photos.splice(photoIndex, 1)
    setPersons(updated)
  }

  const handleSubmit = () => {
    toast.success("Case submitted successfully", { description: "Your case has been registered" })
  }

  return (
    <CaseFormContext.Provider value={{
      step, setStep,
      agree, setAgree,
      caseType, setCaseType,
      dragActive, setDragActive,
      complainant, setComplainant,
      caseDetails, setCaseDetails,
      persons, setPersons,
      selectedPersonIndex, setSelectedPersonIndex,
      newPerson, setNewPerson,
      saveDraft, addPerson, removePerson,
      handleDrag, handleDrop, addPhotos, removePhoto,
      handleSubmit
    }}>
      {children}
    </CaseFormContext.Provider>
  )
}

export function useCaseForm() {
  const ctx = useContext(CaseFormContext)
  if (!ctx) throw new Error("useCaseForm must be used within CaseFormProvider")
  return ctx
}