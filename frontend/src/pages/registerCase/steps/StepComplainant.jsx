import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText } from "lucide-react"
import { useCaseForm } from "@/context/CaseFormContext"

export default function StepComplainant() {

  const {
    complainant,
    setComplainant,
    setStep,
    saveComplainant
  } = useCaseForm()

  console.log(complainant);

  const field = (key, label, props = {}) => (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-gray-700">
        {label} {props.required && <span className="text-red-500">*</span>}
      </Label>

      <Input
        {...props}
        value={complainant[key]}
        onChange={(e) =>
          setComplainant({
            ...complainant,
            [key]: e.target.value
          })
        }
        className="border-gray-300 focus:border-black focus:ring-black"
      />
    </div>
  )

  const handleNext = async () => {

    const success = await saveComplainant()

    if (!success) return

    setStep(3)
  }

  const handleSaveDraft = async () => {
    await saveComplainant()
  }

  return (
    <div className="space-y-6 sm:space-y-8">

      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">
          Complainant Details
        </h2>

        <p className="text-sm sm:text-base text-gray-600">
          Please provide your contact and identification information
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

        {field("full_name", "Full Name", {
          placeholder: "Enter full name",
          required: true
        })}

        {field("phone", "Phone Number", {
          placeholder: "+91 XXXXX XXXXX",
          required: true
        })}

        {field("email", "Email (Optional)", {
          placeholder: "example@email.com",
          type: "email"
        })}

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">
            Gender <span className="text-red-500">*</span>
          </Label>

          <select
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-black focus:border-black outline-none"
            value={complainant.gender}
            onChange={(e) =>
              setComplainant({
                ...complainant,
                gender: e.target.value
              })
            }
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {field("age", "Age", {
          placeholder: "Enter age",
          type: "number",
          required: true
        })}

        {field("relation", "Relationship with Person", {
          placeholder: "e.g., Father, Mother, Sibling",
          required: true
        })}

        {field("aadhaar", "Aadhaar Number", {
          placeholder: "XXXX XXXX XXXX",
          required: true
        })}

        <div className="sm:col-span-2 lg:col-span-3 space-y-2">

          <Label className="text-sm font-semibold text-gray-700">
            Address <span className="text-red-500">*</span>
          </Label>

          <Textarea
            placeholder="Enter complete address with pincode"
            value={complainant.address}
            onChange={(e) =>
              setComplainant({
                ...complainant,
                address: e.target.value
              })
            }
            className="border-gray-300 focus:border-black focus:ring-black min-h-[100px]"
          />
        </div>

      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">

        <Button
          variant="outline"
          onClick={() => setStep(1)}
          className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100"
        >
          <span>←</span> Back
        </Button>

        <div className="flex flex-col sm:flex-row gap-3">

          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100"
          >
            <FileText className="w-4 h-4" />
            Save Draft
          </Button>

          <Button
            onClick={handleNext}
            className="gap-2 w-full sm:w-auto bg-black hover:bg-gray-800 text-white"
          >
            Next <span>→</span>
          </Button>

        </div>

      </div>

    </div>
  )
}