import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterCase() {
  const [step, setStep] = useState(1)
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})

  const [complainant, setComplainant] = useState({
    name: "",
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
    lastSeenLocation: "",
    lastSeenDate: "",
    lastSeenTime: "",
    description: ""
  })

  const [person, setPerson] = useState({
    name: "",
    alias: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    skin: "",
    eye: "",
    hair: "",
    clothing: "",
    mark: "",
    description: ""
  })

  const [photo, setPhoto] = useState(null)
  const [photoError, setPhotoError] = useState("")
  const [preview, setPreview] = useState(null)


  const progress = ((step - 1) / 4) * 100

  const validateComplainant = () => {
    let e = {}

    if (!/^[A-Za-z\s]{4,}$/.test(complainant.name))
      e.name = "Enter full name using letters only"


    if (
        !complainant.address ||
        complainant.address.length < 10 ||
        !/[A-Za-z]/.test(complainant.address)
      )
       e.address = "Enter a valid address"

    if (!/^\d{10}$/.test(complainant.phone))
      e.phone = "Mobile number must be 10 digits"

    if (
      complainant.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(complainant.email)
    )
      e.email = "Invalid email"

    if (!complainant.gender)
      e.gender = "Select gender"

    if (!/^[A-Za-z\s]{3,}$/.test(complainant.relation))
      e.relation = "Enter valid relationship"


    if (!complainant.age || complainant.age < 12)
      e.age = "Age must be 12+"

    if (!/^\d{12}$/.test(complainant.aadhaar))
      e.aadhaar = "Aadhaar must be 12 digits"

    setErrors(e)
    return Object.keys(e).length === 0
  }

    const validateCase = () => {
  let e = {}

  const textRegex = /[A-Za-z]/

  // Title (words, length ≥ 8)
  if (!caseDetails.title || caseDetails.title.length < 8 || !textRegex.test(caseDetails.title))
    e.title = "Enter a valid title (min 8 characters)"

  // Location (letters + numbers allowed)
  if (!caseDetails.lastSeenLocation || caseDetails.lastSeenLocation.length < 4 || !textRegex.test(caseDetails.lastSeenLocation))
    e.location = "Enter valid location"

  // Date
  if (!caseDetails.lastSeenDate)
    e.date = "Select last seen date"

  // Time
  if (!caseDetails.lastSeenTime)
    e.time = "Select last seen time"

  // Description (words, length ≥ 15)
  if (!caseDetails.description || caseDetails.description.length < 15 || !textRegex.test(caseDetails.description))
    e.description = "Description must be at least 15 characters"

  setErrors(e)
  return Object.keys(e).length === 0
}


  const validatePerson = () => {
  let e = {}

  const textRegex = /^[A-Za-z\s]{4,}$/
  const numberRegex = /^\d+$/

  if (!textRegex.test(person.name || ""))
    e.name = "Enter full name using letters only"

  if (person.alias && !/^[A-Za-z\s]+$/.test(person.alias))
    e.alias = "Alias must contain only letters"

  if (!person.gender)
    e.gender = "Select gender"

  if (!person.age || person.age < 2)
    e.age = "Enter valid age"

  if (!numberRegex.test(person.height || ""))
    e.height = "Height must be numeric (cm)"

  if (!numberRegex.test(person.weight || ""))
    e.weight = "Weight must be numeric (kg)"

  if (!person.skin || !/[A-Za-z]/.test(person.skin))
    e.skin = "Enter valid skin tone"

  if (!person.eye)
    e.eye = "Select eye colour"

  if (!person.hair)
    e.hair = "Select hair colour"

  if (!person.clothing)
    e.clothing = "Enter last known clothing"

  if (!person.mark)
    e.mark = "Enter distinguishing mark"

  if (!person.description || person.description.length < 10)
    e.description = "Description must be at least 10 characters"

  setErrors(e)
  return Object.keys(e).length === 0
}

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]

    if (!file) {
      setPhotoError("Photo is required")
      return
    }

    if (!file.type.startsWith("image/")) {
      setPhotoError("Only JPG or PNG images allowed")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image must be under 2MB")
      return
    }

    setPhoto(file)
    setPhotoError("")
    setPreview(URL.createObjectURL(file))
  }



  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-6">
      <Card className="w-full max-w-3xl shadow-md border">
        <CardHeader>
          <CardTitle className="text-2xl text-black">
            Missing Person Case Registration
          </CardTitle>

          <div className="w-full bg-gray-200 rounded h-2 mt-4">
            <div
              className="bg-black h-2 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Step {step} of 5
          </p>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* STEP 1 — INSTRUCTIONS */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-black">Instructions</h3>
                   <p>Please read carefully before registering a case.</p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Only missing person cases are accepted.</li>
                <li>Providing false information is punishable.</li>
                <li>Police verification may occur.</li>
              </ul>

              <Button className="bg-black text-white" onClick={() => setStep(2)}>
                Proceed
              </Button>
            </div>
          )}

          {/* STEP 2 — COMPLAINANT */}
          {step === 2 && (
            <div className="space-y-4">
               <h3 className="font-semibold text-black">
                Complainant Details
              </h3>
              <Input placeholder="Enter your Full Name"
                value={complainant.name}
                onChange={e => setComplainant({ ...complainant, name: e.target.value })}
              />
              <p className="text-red-500 text-sm">{errors.name}</p>

              <Textarea placeholder="Enter your Address"
                value={complainant.address}
                onChange={e => setComplainant({ ...complainant, address: e.target.value })}
              />
              <p className="text-red-500 text-sm">{errors.address}</p>

              <Input placeholder="Enter your 10-digit Mobile numbeer"
                value={complainant.phone}
                onChange={e => setComplainant({ ...complainant, phone: e.target.value })}
              />
              <p className="text-red-500 text-sm">{errors.phone}</p>

              <Input placeholder="Email (optional)"
                value={complainant.email}
                onChange={e => setComplainant({ ...complainant, email: e.target.value })}
              />
              <select
                className="w-full border rounded p-2"
                value={complainant.gender}
                onChange={e => setComplainant({ ...complainant, gender: e.target.value })}
              >
                <option value="">Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <p className="text-red-500 text-sm">{errors.gender}</p>


             <Input
                type="number"
                placeholder="Enter your Age"
                value={complainant.age}
                onChange={e => setComplainant({ ...complainant, age: e.target.value })}
              />
              <p className="text-red-500 text-sm">{errors.age}</p>


             <Input
              list="relationshipOptions"
              placeholder="Relationship with Missing Person"
              value={complainant.relation}
              onChange={e =>
                setComplainant({ ...complainant, relation: e.target.value })
              }
            />

            <datalist id="relationshipOptions">
              <option value="Parent" />
              <option value="Sibling" />
              <option value="Relative" />
              <option value="Friend" />
              <option value="Guardian" />
            </datalist>

            <p className="text-red-500 text-sm">{errors.relation}</p>



              <Input
              placeholder="Enter 12-Digit Aadhaar number"
              value={complainant.aadhaar}
              onChange={e => setComplainant({ ...complainant, aadhaar: e.target.value })}
            />
            <p className="text-red-500 text-sm">{errors.aadhaar}</p>


              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button className="bg-black text-white"
                  onClick={() => {
                    if (validateComplainant()) setStep(3)
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-black">Case Details</h3>

            <Input
              placeholder="Case Title"
              value={caseDetails.title}
              onChange={e => setCaseDetails({ ...caseDetails, title: e.target.value })}
            />
            <p className="text-red-500 text-sm">{errors.title}</p>

            <Input
              placeholder="Last Seen Location"
              value={caseDetails.lastSeenLocation}
              onChange={e =>
                setCaseDetails({ ...caseDetails, lastSeenLocation: e.target.value })
              }
            />
            <p className="text-red-500 text-sm">{errors.location}</p>

            <Input
              type="date"
              value={caseDetails.lastSeenDate}
              onChange={e =>
                setCaseDetails({ ...caseDetails, lastSeenDate: e.target.value })
              }
            />
            <p className="text-red-500 text-sm">{errors.date}</p>

            <Input
              type="time"
              value={caseDetails.lastSeenTime}
              onChange={e =>
                setCaseDetails({ ...caseDetails, lastSeenTime: e.target.value })
              }
            />
            <p className="text-red-500 text-sm">{errors.time}</p>

            <Textarea
              placeholder="Description"
              value={caseDetails.description}
              onChange={e =>
                setCaseDetails({ ...caseDetails, description: e.target.value })
              }
            />
            <p className="text-red-500 text-sm">{errors.description}</p>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>

              <Button
                className="bg-black text-white"
                onClick={() => {
                  if (validateCase()) setStep(4)
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}


          {/* STEP 4 — PERSON */}
          {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-black">
              Missing Person Details
            </h3>

            <Input
              placeholder="Enter your Full Name"
              value={person.name}
              onChange={e => setPerson({ ...person, name: e.target.value })}
            />
            <p className="text-red-500 text-sm">{errors.name}</p>

            <Input
              placeholder="Alias(Nickname) Name"
              value={person.alias}
              onChange={e => setPerson({ ...person, alias: e.target.value })}
            />
            <p className="text-red-500 text-sm">{errors.alias}</p>

            {/* Gender */}
            <select
              className="w-full border rounded p-2"
              value={person.gender}
              onChange={e => setPerson({ ...person, gender: e.target.value })}
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <p className="text-red-500 text-sm">{errors.gender}</p>

            <Input
              type="number"
              placeholder="Enter the Age"
              value={person.age}
              onChange={e => setPerson({ ...person, age: e.target.value })}
            />
            <p className="text-red-500 text-sm">{errors.age}</p>

            <div className="relative">
            <Input
              type="number"
              placeholder="Height"
              value={person.height}
              onChange={e => setPerson({ ...person, height: e.target.value })}
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">cm</span>
          </div>
          <p className="text-red-500 text-sm">{errors.height}</p>


            <div className="relative">
            <Input
              type="number"
              placeholder="Weight"
              value={person.weight}
              onChange={e => setPerson({ ...person, weight: e.target.value })}
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">kg</span>
          </div>
          <p className="text-red-500 text-sm">{errors.weight}</p>


            <select
              className="w-full border rounded p-2"
              value={person.skin}
              onChange={e => setPerson({ ...person, skin: e.target.value })}
            >
              <option value="">Skin Tone</option>
              <option>Very Fair</option>
              <option>Fair</option>
              <option>Medium</option>
              <option>Brown</option>
              <option>Dark</option>
            </select>

            <p className="text-red-500 text-sm">{errors.skin}</p>

            <select
              className="w-full border rounded p-2"
              value={person.eye}
              onChange={e => setPerson({ ...person, eye: e.target.value })}
            >
              <option value="">Eye Colour</option>
              <option>Black</option>
              <option>Brown</option>
              <option>Dark Brown</option>
              <option>Light Brown</option>
              <option>Hazel</option>
              <option>Blue</option>
              <option>Green</option>
              <option>Grey</option>
              <option value="Other">Other</option>
            </select>

            {person.eye === "Other" && (
              <Input
                placeholder="Enter eye colour"
                onChange={e => setPerson({ ...person, eye: e.target.value })}
              />
            )}

            <p className="text-red-500 text-sm">{errors.eye}</p>

            <select
            className="w-full border rounded p-2"
            value={person.hair}
            onChange={e => setPerson({ ...person, hair: e.target.value })}
          >
            <option value="">Hair Colour</option>
            <option>Black</option>
            <option>Brown</option>
            <option>Dark Brown</option>
            <option>Light Brown</option>
            <option>Blonde</option>
            <option>Grey</option>
            <option>White</option>
            <option>Red</option>
            <option>Bald</option>
            <option value="Other">Other</option>
          </select>

          {person.hair === "Other" && (
            <Input
              placeholder="Enter hair colour"
              onChange={e => setPerson({ ...person, hair: e.target.value })}
            />
          )}

          <p className="text-red-500 text-sm">{errors.hair}</p>


            <Input
              placeholder="Person Last Known Clothing"
              value={person.clothing}
              onChange={e => setPerson({ ...person, clothing: e.target.value })}
            />
            <p className="text-red-500 text-sm">{errors.clothing}</p>

            <Input
              placeholder="Distinguishing Mark"
              value={person.mark}
              onChange={e => setPerson({ ...person, mark: e.target.value })}
            />
            <p className="text-red-500 text-sm">{errors.mark}</p>

            <Textarea
              placeholder="Enter the Description"
              value={person.description}
              onChange={e => setPerson({ ...person, description: e.target.value })}
            />
            <p className="text-red-500 text-sm">{errors.description}</p>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>

              <Button
                className="bg-black text-white"
                onClick={() => {
                  if (validatePerson()) setStep(5)
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}


          {/* STEP 5 — DECLARATION */}
          {step === 5 && (
            <div className="space-y-4">

              <h3 className="font-semibold text-black">
                Upload Photo for {person.name || "Missing Person"}
              </h3>

              <Input type="file" accept="image/*" onChange={handlePhotoUpload} />

              <p className="text-sm text-gray-500">
                Only JPG/PNG allowed. Max size 2MB.
              </p>

              {photoError && (
                <p className="text-red-500 text-sm">{photoError}</p>
              )}

              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="w-40 h-40 object-cover rounded border"
                />
              )}

              <div className="flex items-center gap-2">
                <Checkbox checked={agree} onCheckedChange={setAgree} />
                <Label>I confirm the information provided is true.</Label>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(4)}>
                  Back
                </Button>

                <Button
                  disabled={!agree || !photo}
                  className="bg-black text-white"
                >
                  Submit Case
                </Button>
              </div>

            </div>
          )}


        </CardContent>
      </Card>
    </div>
  )
}
