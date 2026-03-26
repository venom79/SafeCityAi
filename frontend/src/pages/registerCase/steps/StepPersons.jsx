import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, User, X } from "lucide-react"
import { useCaseForm } from "@/context/CaseFormContext"

export default function StepPersons() {

  const {
    persons,
    newPerson,
    setNewPerson,
    addPerson,
    removePerson,
    setStep,
    createDraft
  } = useCaseForm()

  const update = (key) => (e) =>
    setNewPerson({
      ...newPerson,
      [key]: e.target.value
    })

  const handleSaveDraft = async () => {
    await createDraft()
  }

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">
          Person Details
        </h2>

        <p className="text-sm sm:text-base text-gray-600">
          Add details about the missing/wanted person(s)
        </p>
      </div>


      {/* Add Person Form */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border-2 border-dashed border-gray-300">

        <h3 className="font-semibold text-black mb-4 text-base sm:text-lg">
          Add Person Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">

          {[
            { key: "full_name", label: "Full Name", placeholder: "Full name", required: true },
            { key: "alias", label: "Alias/Nickname", placeholder: "Known as" },
            { key: "age", label: "Age", placeholder: "Age", type: "number", required: true },
            { key: "height_cm", label: "Height (cm)", placeholder: "Height in cm", type: "number" },
            { key: "weight_kg", label: "Weight (kg)", placeholder: "Weight in kg", type: "number" },
            { key: "skin_tone", label: "Skin Tone", placeholder: "Fair/Medium/Dark" },
            { key: "eye_color", label: "Eye Color", placeholder: "Eye color" },
            { key: "hair_color", label: "Hair Color", placeholder: "Hair color" },
          ].map(({ key, label, placeholder, type = "text", required }) => (

            <div key={key} className="space-y-2">

              <Label className="text-sm font-semibold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
              </Label>

              <Input
                placeholder={placeholder}
                type={type}
                value={newPerson[key]}
                onChange={update(key)}
                className="bg-white border-gray-300 focus:border-black focus:ring-black"
              />

            </div>

          ))}

          {/* Gender */}
          <div className="space-y-2">

            <Label className="text-sm font-semibold text-gray-700">
              Gender <span className="text-red-500">*</span>
            </Label>

            <select
              className="w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-black outline-none"
              value={newPerson.gender}
              onChange={update("gender")}
            >
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>

          </div>


          {/* Clothing */}
          <div className="space-y-2 sm:col-span-2">

            <Label className="text-sm font-semibold text-gray-700">
              Last Known Clothing
            </Label>

            <Input
              placeholder="Description of clothing"
              value={newPerson.last_known_clothing}
              onChange={update("last_known_clothing")}
              className="bg-white border-gray-300 focus:border-black focus:ring-black"
            />

          </div>


          {/* Distinguishing marks */}
          <div className="space-y-2 sm:col-span-2">

            <Label className="text-sm font-semibold text-gray-700">
              Distinguishing Marks
            </Label>

            <Input
              placeholder="Scars, tattoos, birthmarks, etc."
              value={newPerson.distinguishing_marks}
              onChange={update("distinguishing_marks")}
              className="bg-white border-gray-300 focus:border-black focus:ring-black"
            />

          </div>


          {/* Description */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-2">

            <Label className="text-sm font-semibold text-gray-700">
              Additional Description
            </Label>

            <Textarea
              placeholder="Any other relevant information about the person..."
              value={newPerson.description}
              onChange={update("description")}
              className="bg-white border-gray-300 focus:border-black focus:ring-black min-h-[80px]"
            />

          </div>

        </div>

        <Button
          onClick={addPerson}
          className="gap-2 bg-black hover:bg-gray-800 text-white w-full sm:w-auto"
        >
          <User className="w-4 h-4" />
          Add Person
        </Button>

      </div>


      {/* Persons List */}
      {persons.length > 0 ? (

        <div>

          <h3 className="font-semibold text-black mb-4 text-base sm:text-lg">
            Added Persons ({persons.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

            {persons.map((p) => (

              <div
                key={p.id}
                className="relative border-2 border-gray-200 rounded-lg p-4 hover:border-black transition-colors bg-white"
              >

                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removePerson(p.id)}
                >
                  <X className="w-4 h-4" />
                </Button>

                <div className="flex items-start gap-3">

                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border-2 border-gray-300">
                    <User className="w-6 h-6 text-black" />
                  </div>

                  <div className="flex-1 min-w-0">

                    <h4 className="font-semibold text-black truncate text-sm sm:text-base">
                      {p.full_name}
                    </h4>

                    <div className="text-xs sm:text-sm text-gray-600 space-y-1 mt-1">

                      {p.alias && (
                        <p className="truncate">
                          Alias: {p.alias}
                        </p>
                      )}

                      <p>
                        {p.gender && `${p.gender}, `}
                        {p.age && `${p.age} years`}
                      </p>

                      {(p.height_cm || p.weight_kg) && (
                        <p>
                          {p.height_cm && `${p.height_cm}cm`}
                          {p.height_cm && p.weight_kg && ", "}
                          {p.weight_kg && `${p.weight_kg}kg`}
                        </p>
                      )}

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      ) : (

        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">

          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />

          <p className="text-sm sm:text-base text-gray-600">
            No persons added yet. Please add at least one person to continue.
          </p>

        </div>

      )}


      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">

        <Button
          variant="outline"
          onClick={() => setStep(3)}
          className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100"
        >
          ← Back
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
            onClick={() => setStep(5)}
            disabled={persons.length === 0}
            className="gap-2 w-full sm:w-auto bg-black hover:bg-gray-800 text-white"
          >
            Next →
          </Button>

        </div>

      </div>

    </div>
  )
}