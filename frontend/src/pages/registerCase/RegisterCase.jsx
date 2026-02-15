import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Upload, X, User, AlertCircle, CheckCircle2, FileText, MapPin, Clock } from "lucide-react"

export default function RegisterCase() {
  const { user } = useAuth()
  const role = user?.role || "USER"

  const [step, setStep] = useState(1)
  const [agree, setAgree] = useState(false)
  const [caseType, setCaseType] = useState("MISSING")
  const [dragActive, setDragActive] = useState(false)

  const steps = [
    { number: 1, label: "Instructions", icon: FileText },
    { number: 2, label: "Complainant", icon: User },
    { number: 3, label: "Case Details", icon: MapPin },
    { number: 4, label: "Persons", icon: User },
    { number: 5, label: "Photos & Submit", icon: Upload }
  ]

  /* ================== STATE ================== */

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

  /* ================== FUNCTIONS ================== */

  const saveDraft = () => {
    toast.success("Draft saved successfully", {
      description: "Your progress has been saved"
    })
  }

  const addPerson = () => {
    if (!newPerson.full_name.trim()) {
      toast.error("Please enter the person's full name")
      return
    }
    setPersons([...persons, { ...newPerson, photos: [] }])
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
    toast.success("Person added successfully")
  }

  const removePerson = (index) => {
    const updated = persons.filter((_, i) => i !== index)
    setPersons(updated)
    if (selectedPersonIndex === index) setSelectedPersonIndex(null)
    toast.success("Person removed")
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e, personIndex) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      addPhotos(files, personIndex)
    }
  }

  const addPhotos = (files, personIndex) => {
    const updated = [...persons]
    const newPhotos = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }))
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
    toast.success("Case submitted successfully", {
      description: "Your case has been registered"
    })
  }

  /* ================== UI ================== */

  return (
    <div className="min-h-screen bg-white">
      
      {/* HEADER */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2">
            {role === "ADMIN" ? "Register New Case" : "Register Missing Person Case"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Complete all steps to register a {caseType === "MISSING" ? "missing person" : "wanted person"} case
          </p>
        </div>
      </div>

      {/* STEP PROGRESS */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="relative flex justify-between items-start">
            {/* Background Line - Hidden on mobile */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300 hidden sm:block" 
                 style={{ left: '2.5rem', right: '2.5rem' }} />
            
            {/* Progress Line - Hidden on mobile */}
            <div
              className="absolute top-6 left-0 h-0.5 bg-black transition-all duration-500 hidden sm:block"
              style={{
                left: '2.5rem',
                width: `calc(${((step - 1) / (steps.length - 1)) * 100}% - 2.5rem)`
              }}
            />

            {steps.map((s, index) => {
              const isActive = step === s.number
              const isCompleted = step > s.number
              const Icon = s.icon

              return (
                <div
                  key={index}
                  className="flex flex-col items-center relative z-10 flex-1 sm:flex-none"
                  style={{ minWidth: 'fit-content' }}
                >
                  <div
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border-2 
                      transition-all duration-300
                      ${
                        isCompleted
                          ? "bg-black text-white border-black"
                          : isActive
                          ? "bg-black text-white border-black shadow-lg scale-110"
                          : "bg-white text-gray-400 border-gray-300"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
                    ) : (
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </div>

                  <span
                    className={`mt-2 sm:mt-3 text-[10px] sm:text-xs text-center font-medium px-1
                      ${isActive ? "text-black" : isCompleted ? "text-black" : "text-gray-500"}
                    `}
                  >
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">

            {/* ================= STEP 1: INSTRUCTIONS ================= */}
            {step === 1 && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    Important Instructions
                  </h2>

                  <div className="bg-gray-50 border-l-4 border-black p-4 sm:p-6 mb-6">
                    <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 mt-0.5">1</span>
                        <span>Provide accurate and verified information only. All details will be verified.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 mt-0.5">2</span>
                        <span>False reporting is a punishable offense under Indian Penal Code Section 182.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 mt-0.5">3</span>
                        <span>Clear, recent face photographs are mandatory for identification purposes.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 mt-0.5">4</span>
                        <span>You can save your progress as a draft at any time and continue later.</span>
                      </li>
                    </ul>
                  </div>

                  {role === "ADMIN" && (
                    <div className="max-w-md">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Case Type
                      </Label>
                      <select
                        className="w-full border-2 border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                        value={caseType}
                        onChange={(e) => setCaseType(e.target.value)}
                      >
                        <option value="MISSING">Missing Person</option>
                        <option value="WANTED">Wanted Person</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">
                  <Button variant="outline" onClick={saveDraft} className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100">
                    <FileText className="w-4 h-4" />
                    Save Draft
                  </Button>
                  <Button onClick={() => setStep(2)} className="gap-2 w-full sm:w-auto bg-black hover:bg-gray-800 text-white">
                    Continue
                    <span>→</span>
                  </Button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: COMPLAINANT DETAILS ================= */}
            {step === 2 && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Complainant Details</h2>
                  <p className="text-sm sm:text-base text-gray-600">Please provide your contact and identification information</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter full name"
                      value={complainant.full_name}
                      onChange={(e) =>
                        setComplainant({ ...complainant, full_name: e.target.value })
                      }
                      className="border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="+91 XXXXX XXXXX"
                      value={complainant.phone}
                      onChange={(e) =>
                        setComplainant({ ...complainant, phone: e.target.value })
                      }
                      className="border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Email (Optional)</Label>
                    <Input
                      placeholder="example@email.com"
                      type="email"
                      value={complainant.email}
                      onChange={(e) =>
                        setComplainant({ ...complainant, email: e.target.value })
                      }
                      className="border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <select
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-black focus:border-black outline-none"
                      value={complainant.gender}
                      onChange={(e) =>
                        setComplainant({ ...complainant, gender: e.target.value })
                      }
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Age <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter age"
                      type="number"
                      value={complainant.age}
                      onChange={(e) =>
                        setComplainant({ ...complainant, age: e.target.value })
                      }
                      className="border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Relationship with Person <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., Father, Mother, Sibling"
                      value={complainant.relation}
                      onChange={(e) =>
                        setComplainant({ ...complainant, relation: e.target.value })
                      }
                      className="border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Aadhaar Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="XXXX XXXX XXXX"
                      value={complainant.aadhaar}
                      onChange={(e) =>
                        setComplainant({ ...complainant, aadhaar: e.target.value })
                      }
                      className="border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      placeholder="Enter complete address with pincode"
                      value={complainant.address}
                      onChange={(e) =>
                        setComplainant({ ...complainant, address: e.target.value })
                      }
                      className="border-gray-300 focus:border-black focus:ring-black min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setStep(1)} className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100">
                    <span>←</span>
                    Back
                  </Button>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={saveDraft} className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100">
                      <FileText className="w-4 h-4" />
                      Save Draft
                    </Button>
                    <Button onClick={() => setStep(3)} className="gap-2 w-full sm:w-auto bg-black hover:bg-gray-800 text-white">
                      Next
                      <span>→</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 3: CASE DETAILS ================= */}
            {step === 3 && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Case Details</h2>
                  <p className="text-sm sm:text-base text-gray-600">Provide information about when and where the person was last seen</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Case Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Brief title for the case"
                      value={caseDetails.title}
                      onChange={(e) =>
                        setCaseDetails({ ...caseDetails, title: e.target.value })
                      }
                      className="border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Last Seen Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter location details"
                      value={caseDetails.lastSeenLocation}
                      onChange={(e) =>
                        setCaseDetails({ ...caseDetails, lastSeenLocation: e.target.value })
                      }
                      className="border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Last Seen Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={caseDetails.lastSeenDate}
                      onChange={(e) =>
                        setCaseDetails({ ...caseDetails, lastSeenDate: e.target.value })
                      }
                      className="border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Last Seen Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="time"
                      value={caseDetails.lastSeenTime}
                      onChange={(e) =>
                        setCaseDetails({ ...caseDetails, lastSeenTime: e.target.value })
                      }
                      className="border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Detailed Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      placeholder="Provide a detailed description of the circumstances..."
                      value={caseDetails.description}
                      onChange={(e) =>
                        setCaseDetails({ ...caseDetails, description: e.target.value })
                      }
                      className="border-gray-300 focus:border-black focus:ring-black min-h-[150px]"
                    />
                    <p className="text-xs text-gray-500">Include any relevant details about circumstances, witnesses, or important information</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setStep(2)} className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100">
                    <span>←</span>
                    Back
                  </Button>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={saveDraft} className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100">
                      <FileText className="w-4 h-4" />
                      Save Draft
                    </Button>
                    <Button onClick={() => setStep(4)} className="gap-2 w-full sm:w-auto bg-black hover:bg-gray-800 text-white">
                      Next
                      <span>→</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 4: PERSONS INVOLVED ================= */}
            {step === 4 && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Person Details</h2>
                  <p className="text-sm sm:text-base text-gray-600">Add details about the missing/wanted person(s)</p>
                </div>

                {/* Form to add new person */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border-2 border-dashed border-gray-300">
                  <h3 className="font-semibold text-black mb-4 text-base sm:text-lg">Add Person Information</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Full name"
                        value={newPerson.full_name}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, full_name: e.target.value })
                        }
                        className="bg-white border-gray-300 focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Alias/Nickname</Label>
                      <Input
                        placeholder="Known as"
                        value={newPerson.alias}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, alias: e.target.value })
                        }
                        className="bg-white border-gray-300 focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <select
                        className="w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-black outline-none"
                        value={newPerson.gender}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, gender: e.target.value })
                        }
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Age <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Age"
                        type="number"
                        value={newPerson.age}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, age: e.target.value })
                        }
                        className="bg-white border-gray-300 focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Height (cm)</Label>
                      <Input
                        placeholder="Height in cm"
                        type="number"
                        value={newPerson.height_cm}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, height_cm: e.target.value })
                        }
                        className="bg-white border-gray-300 focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Weight (kg)</Label>
                      <Input
                        placeholder="Weight in kg"
                        type="number"
                        value={newPerson.weight_kg}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, weight_kg: e.target.value })
                        }
                        className="bg-white border-gray-300 focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Skin Tone</Label>
                      <Input
                        placeholder="Fair/Medium/Dark"
                        value={newPerson.skin_tone}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, skin_tone: e.target.value })
                        }
                        className="bg-white border-gray-300 focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Eye Color</Label>
                      <Input
                        placeholder="Eye color"
                        value={newPerson.eye_color}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, eye_color: e.target.value })
                        }
                        className="bg-white border-gray-300 focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Hair Color</Label>
                      <Input
                        placeholder="Hair color"
                        value={newPerson.hair_color}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, hair_color: e.target.value })
                        }
                        className="bg-white border-gray-300 focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                      <Label className="text-sm font-semibold text-gray-700">Last Known Clothing</Label>
                      <Input
                        placeholder="Description of clothing"
                        value={newPerson.last_known_clothing}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, last_known_clothing: e.target.value })
                        }
                        className="bg-white border-gray-300 focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                      <Label className="text-sm font-semibold text-gray-700">Distinguishing Marks</Label>
                      <Input
                        placeholder="Scars, tattoos, birthmarks, etc."
                        value={newPerson.distinguishing_marks}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, distinguishing_marks: e.target.value })
                        }
                        className="bg-white border-gray-300 focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-4 space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Additional Description</Label>
                      <Textarea
                        placeholder="Any other relevant information about the person..."
                        value={newPerson.description}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, description: e.target.value })
                        }
                        className="bg-white border-gray-300 focus:border-black focus:ring-black min-h-[80px]"
                      />
                    </div>
                  </div>

                  <Button onClick={addPerson} className="gap-2 bg-black hover:bg-gray-800 text-white w-full sm:w-auto">
                    <User className="w-4 h-4" />
                    Add Person
                  </Button>
                </div>

                {/* List of added persons */}
                {persons.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-black mb-4 text-base sm:text-lg">Added Persons ({persons.length})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {persons.map((p, i) => (
                        <div key={i} className="relative border-2 border-gray-200 rounded-lg p-4 hover:border-black transition-colors bg-white">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removePerson(i)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border-2 border-gray-300">
                              <User className="w-6 h-6 text-black" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-black truncate text-sm sm:text-base">{p.full_name}</h4>
                              <div className="text-xs sm:text-sm text-gray-600 space-y-1 mt-1">
                                {p.alias && <p className="truncate">Alias: {p.alias}</p>}
                                <p>{p.gender && `${p.gender}, `}{p.age && `${p.age} years`}</p>
                                {(p.height_cm || p.weight_kg) && (
                                  <p>{p.height_cm && `${p.height_cm}cm`}{p.height_cm && p.weight_kg && ', '}{p.weight_kg && `${p.weight_kg}kg`}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {persons.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm sm:text-base text-gray-600">No persons added yet. Please add at least one person to continue.</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setStep(3)} className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100">
                    <span>←</span>
                    Back
                  </Button>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={saveDraft} className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100">
                      <FileText className="w-4 h-4" />
                      Save Draft
                    </Button>
                    <Button 
                      onClick={() => setStep(5)} 
                      className="gap-2 w-full sm:w-auto bg-black hover:bg-gray-800 text-white"
                      disabled={persons.length === 0}
                    >
                      Next
                      <span>→</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 5: UPLOAD PHOTOS & SUBMIT ================= */}
            {step === 5 && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Upload Photos & Submit</h2>
                  <p className="text-sm sm:text-base text-gray-600">Add clear, recent photographs for each person</p>
                </div>

                {persons.map((person, personIndex) => (
                  <div key={personIndex} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-black p-4">
                      <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                        Photos for {person.full_name}
                        <span className="ml-2 bg-white/20 text-white text-xs px-2 py-1 rounded">
                          {person.photos?.length || 0} photos
                        </span>
                      </h3>
                    </div>
                    
                    <div className="p-4 sm:p-6 space-y-4 bg-white">
                      {/* Drag and drop zone */}
                      <div
                        className={`
                          border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors cursor-pointer
                          ${dragActive 
                            ? 'border-black bg-gray-50' 
                            : 'border-gray-300 hover:border-black hover:bg-gray-50'
                          }
                        `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={(e) => handleDrop(e, personIndex)}
                      >
                        <Upload className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 ${dragActive ? 'text-black' : 'text-gray-400'}`} />
                        <p className="text-sm sm:text-base text-gray-700 font-medium mb-2">
                          Drag and drop photos here, or click to browse
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4">
                          Supports: JPG, PNG, JPEG (Max 5MB each)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          id={`file-upload-${personIndex}`}
                          onChange={(e) => {
                            if (e.target.files) {
                              addPhotos(Array.from(e.target.files), personIndex)
                            }
                          }}
                        />
                        <label htmlFor={`file-upload-${personIndex}`}>
                          <Button type="button" variant="outline" className="cursor-pointer border-black text-black hover:bg-gray-100" asChild>
                            <span>Choose Files</span>
                          </Button>
                        </label>
                      </div>

                      {/* Photo grid */}
                      {person.photos && person.photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                          {person.photos.map((photo, photoIndex) => (
                            <div key={photoIndex} className="relative group">
                              <img
                                src={photo.url}
                                alt={`Photo ${photoIndex + 1}`}
                                className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700"
                                onClick={() => removePhoto(personIndex, photoIndex)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                Photo {photoIndex + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Confirmation */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agree"
                      checked={agree}
                      onCheckedChange={setAgree}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="agree" className="text-sm font-semibold text-gray-900 cursor-pointer">
                        Declaration and Confirmation
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-700 mt-1">
                        I hereby declare that all the information provided above is true and accurate to the best of my knowledge. 
                        I understand that providing false information is a punishable offense under the law.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setStep(4)} className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100">
                    <span>←</span>
                    Back
                  </Button>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={saveDraft} className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100">
                      <FileText className="w-4 h-4" />
                      Save Draft
                    </Button>
                    <Button 
                      disabled={!agree} 
                      onClick={handleSubmit}
                      className="gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Submit Case
                    </Button>
                    {role === "ADMIN" && (
                      <Button 
                        variant="secondary" 
                        disabled={!agree}
                        onClick={handleSubmit}
                        className="gap-2 w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white disabled:bg-gray-400"
                      >
                        Submit & Assign to Self
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
  )
}