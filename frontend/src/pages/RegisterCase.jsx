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

  /* ---------------- VALIDATION HELPERS ---------------- */

  const validComplainant =
    complainant.name &&
    complainant.mobile.length === 10 &&
    complainant.address &&
    complainant.relation &&
    complainant.aadhaar.length === 12 &&
    complainant.gender &&
    complainant.age

  const validMissing =
    missing.name &&
    missing.gender &&
    missing.age &&
    missing.height &&
    missing.weight &&
    missing.skin &&
    missing.eye &&
    missing.hair &&
    missing.clothing &&
    missing.description

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-red-50 flex justify-center p-6">
      <Card className="w-full max-w-3xl border-red-300">
        <CardHeader>
          <CardTitle className="text-red-700 text-2xl">
            Missing Person Case Registration
          </CardTitle>
          <p className="text-sm text-gray-600">Step {step} of 5</p>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* STEP 1 – INSTRUCTIONS */}
          {step === 1 && (
            <div className="space-y-4">
              <p>
                Please read the instructions carefully before proceeding.
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Only missing person cases are accepted.</li>
                <li>All details must be correct and truthful.</li>
                <li>False information is punishable under law.</li>
              </ul>

              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setStep(2)}
              >
                Proceed
              </Button>
            </div>
          )}

          {/* STEP 2 – COMPLAINANT DETAILS */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-red-700">
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
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setStep(3)}
              >
                Next
              </Button>
            </div>
          )}

          {/* STEP 3 – MISSING PERSON DETAILS */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-red-700">
                Missing Person Details
              </h3>

              <Input placeholder="Full Name"
                value={missing.name}
                onChange={e => setMissing({ ...missing, name: e.target.value })}
              />

              <Input placeholder="Alias / Nickname"
                value={missing.alias}
                onChange={e => setMissing({ ...missing, alias: e.target.value })}
              />

              <Input placeholder="Gender"
                value={missing.gender}
                onChange={e => setMissing({ ...missing, gender: e.target.value })}
              />

              <Input type="number" placeholder="Age"
                value={missing.age}
                onChange={e => setMissing({ ...missing, age: e.target.value })}
              />

              <Input placeholder="Height (cm)"
                value={missing.height}
                onChange={e => setMissing({ ...missing, height: e.target.value })}
              />

              <Input placeholder="Weight (kg)"
                value={missing.weight}
                onChange={e => setMissing({ ...missing, weight: e.target.value })}
              />

              <Input placeholder="Skin Tone"
                value={missing.skin}
                onChange={e => setMissing({ ...missing, skin: e.target.value })}
              />

              <Input placeholder="Eye Color"
                value={missing.eye}
                onChange={e => setMissing({ ...missing, eye: e.target.value })}
              />

              <Input placeholder="Hair Colour"
                value={missing.hair}
                onChange={e => setMissing({ ...missing, hair: e.target.value })}
              />

              <Input placeholder="Last Known Clothing"
                value={missing.clothing}
                onChange={e => setMissing({ ...missing, clothing: e.target.value })}
              />

              <Input placeholder="Distinguishing Marks"
                value={missing.mark}
                onChange={e => setMissing({ ...missing, mark: e.target.value })}
              />

              <Textarea placeholder="Description"
                value={missing.description}
                onChange={e => setMissing({ ...missing, description: e.target.value })}
              />

              <Button
                disabled={!validMissing}
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setStep(4)}
              >
                Next
              </Button>
            </div>
          )}

          {/* STEP 4 – PHOTO */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-red-700">Upload Photograph</h3>
              <Input type="file" accept="image/*" />
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setStep(5)}
              >
                Next
              </Button>
            </div>
          )}

          {/* STEP 5 – DECLARATION */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-red-700">Declaration</h3>

              <div className="flex items-center gap-2">
                <Checkbox checked={agree} onCheckedChange={setAgree} />
                <Label>
                  I confirm that all information provided is true.
                </Label>
              </div>

              <Button
                disabled={!agree}
                className="bg-red-600 hover:bg-red-700"
              >
                Submit Case
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
