import { useState } from "react"
import UserDashboardLayout from "@/components/layout/UserDashboardLayout"

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
    mobile: "",
    address: "",
    email: "",
    relation: "",
    aadhaar: "",
    gender: "",
    age: "",
  })

  const [missing, setMissing] = useState({
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
    description: "",
  })

  const validComplainant =
    complainant.name &&
    complainant.mobile.length === 10 &&
    complainant.address &&
    complainant.relation &&
    complainant.aadhaar.length === 12 &&
    complainant.gender &&
    complainant.age

  const validateMissing = () => {
    let e = {}

    if (!missing.name || missing.name.length < 4) e.name = "Enter valid full name"
    if (!missing.gender) e.gender = "Select gender"
    if (!missing.age) e.age = "Enter age"
    if (!missing.height || isNaN(missing.height)) e.height = "Enter height in cm"
    if (!missing.weight || isNaN(missing.weight)) e.weight = "Enter weight in kg"
    if (!missing.skin || missing.skin.length < 3) e.skin = "Enter valid skin tone"
    if (!missing.eye || missing.eye.length < 3) e.eye = "Enter valid eye color"
    if (!missing.hair || missing.hair.length < 3) e.hair = "Enter valid hair color"
    if (!missing.clothing) e.clothing = "Enter last known clothing"
    if (!missing.description || missing.description.length < 10)
      e.description = "Description must be at least 10 characters"

    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <UserDashboardLayout>
      <div className="flex justify-center p-6 bg-gray-100 min-h-screen">

        <Card className="w-full max-w-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-purple-700 text-2xl">
              Missing Person Case Registration
            </CardTitle>
            <p className="text-sm text-gray-600">Step {step} of 5</p>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <p>Please read the instructions carefully before proceeding.</p>

                <ul className="list-disc pl-6 text-gray-600">
                  <li>Only missing person cases are accepted.</li>
                  <li>All details must be correct and truthful.</li>
                  <li>False information is punishable under law.</li>
                </ul>

                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setStep(2)}
                >
                  Proceed
                </Button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-purple-700">
                  Complainant Details
                </h3>

                <Input placeholder="Full Name"
                  value={complainant.name}
                  onChange={e => setComplainant({ ...complainant, name: e.target.value })}
                />

                <Input type="tel" placeholder="Mobile Number"
                  value={complainant.mobile}
                  onChange={e => setComplainant({ ...complainant, mobile: e.target.value })}
                />

                <Textarea placeholder="Address"
                  value={complainant.address}
                  onChange={e => setComplainant({ ...complainant, address: e.target.value })}
                />

                <Input placeholder="Email (optional)"
                  value={complainant.email}
                  onChange={e => setComplainant({ ...complainant, email: e.target.value })}
                />

                <Input placeholder="Relationship with Missing Person"
                  value={complainant.relation}
                  onChange={e => setComplainant({ ...complainant, relation: e.target.value })}
                />

                <Input placeholder="Aadhaar Number"
                  value={complainant.aadhaar}
                  onChange={e => setComplainant({ ...complainant, aadhaar: e.target.value })}
                />

                <Input placeholder="Gender"
                  value={complainant.gender}
                  onChange={e => setComplainant({ ...complainant, gender: e.target.value })}
                />

                <Input type="number" placeholder="Age"
                  value={complainant.age}
                  onChange={e => setComplainant({ ...complainant, age: e.target.value })}
                />

                <Button
                  disabled={!validComplainant}
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setStep(3)}
                >
                  Next
                </Button>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-purple-700">
                  Missing Person Details
                </h3>

                <Input placeholder="Full Name"
                  value={missing.name}
                  onChange={e => setMissing({ ...missing, name: e.target.value })}
                />
                <p className="text-red-500 text-sm">{errors.name}</p>

                <Input placeholder="Alias / Nickname"
                  value={missing.alias}
                  onChange={e => setMissing({ ...missing, alias: e.target.value })}
                />

                <select
                  className="w-full border p-2 rounded"
                  value={missing.gender}
                  onChange={e => setMissing({ ...missing, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                <p className="text-red-500 text-sm">{errors.gender}</p>

                <Input type="number" placeholder="Age"
                  value={missing.age}
                  onChange={e => setMissing({ ...missing, age: e.target.value })}
                />
                <p className="text-red-500 text-sm">{errors.age}</p>

                <Input placeholder="Height (cm)"
                  value={missing.height}
                  onChange={e => setMissing({ ...missing, height: e.target.value })}
                />
                <p className="text-red-500 text-sm">{errors.height}</p>

                <Input placeholder="Weight (kg)"
                  value={missing.weight}
                  onChange={e => setMissing({ ...missing, weight: e.target.value })}
                />
                <p className="text-red-500 text-sm">{errors.weight}</p>

                <Input placeholder="Skin Tone"
                  value={missing.skin}
                  onChange={e => setMissing({ ...missing, skin: e.target.value })}
                />
                <p className="text-red-500 text-sm">{errors.skin}</p>

                <Input placeholder="Eye Color"
                  value={missing.eye}
                  onChange={e => setMissing({ ...missing, eye: e.target.value })}
                />
                <p className="text-red-500 text-sm">{errors.eye}</p>

                <Input placeholder="Hair Colour"
                  value={missing.hair}
                  onChange={e => setMissing({ ...missing, hair: e.target.value })}
                />
                <p className="text-red-500 text-sm">{errors.hair}</p>

                <Input placeholder="Last Known Clothing"
                  value={missing.clothing}
                  onChange={e => setMissing({ ...missing, clothing: e.target.value })}
                />
                <p className="text-red-500 text-sm">{errors.clothing}</p>

                <Input placeholder="Distinguishing Marks"
                  value={missing.mark}
                  onChange={e => setMissing({ ...missing, mark: e.target.value })}
                />

                <Textarea placeholder="Description"
                  value={missing.description}
                  onChange={e => setMissing({ ...missing, description: e.target.value })}
                />
                <p className="text-red-500 text-sm">{errors.description}</p>

                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    if (validateMissing()) setStep(4)
                  }}
                >
                  Next
                </Button>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-purple-700">Upload Photograph</h3>
                <Input type="file" accept="image/*" />

                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setStep(5)}
                >
                  Next
                </Button>
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-purple-700">Declaration</h3>

                <div className="flex items-center gap-2">
                  <Checkbox checked={agree} onCheckedChange={setAgree} />
                  <Label>I confirm that all information provided is true.</Label>
                </div>

                <Button
                  disabled={!agree}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Submit Case
                </Button>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  )
}
