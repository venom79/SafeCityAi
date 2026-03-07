import { useAuth } from "@/context/AuthContext"
import { CheckCircle2, FileText, MapPin, Upload, User } from "lucide-react"
import { CaseFormProvider, useCaseForm } from "@/context/CaseFormContext"
import StepInstructions from "./steps/StepInstructions"
import StepComplainant from "./steps/StepComplainant"
import StepCaseDetails from "./steps/StepCaseDetails"
import StepPersons from "./steps/StepPersons"
import StepPhotosSubmit from "./steps/StepPhotosSubmit"

const STEPS = [
  { number: 1, label: "Instructions", icon: FileText },
  { number: 2, label: "Complainant", icon: User },
  { number: 3, label: "Case Details", icon: MapPin },
  { number: 4, label: "Persons", icon: User },
  { number: 5, label: "Photos & Submit", icon: Upload }
]

const STEP_COMPONENTS = {
  1: StepInstructions,
  2: StepComplainant,
  3: StepCaseDetails,
  4: StepPersons,
  5: StepPhotosSubmit
}

function StepProgress() {
  const { step } = useCaseForm()

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="relative flex justify-between items-start">
          <div
            className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300 hidden sm:block"
            style={{ left: "2.5rem", right: "2.5rem" }}
          />
          <div
            className="absolute top-6 left-0 h-0.5 bg-black transition-all duration-500 hidden sm:block"
            style={{
              left: "2.5rem",
              width: `calc(${((step - 1) / (STEPS.length - 1)) * 100}% - 2.5rem)`
            }}
          />

          {STEPS.map((s) => {
            const isActive = step === s.number
            const isCompleted = step > s.number
            const Icon = s.icon

            return (
              <div key={s.number} className="flex flex-col items-center relative z-10 flex-1 sm:flex-none" style={{ minWidth: "fit-content" }}>
                <div className={`
                  w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300
                  ${isCompleted ? "bg-black text-white border-black"
                    : isActive ? "bg-black text-white border-black shadow-lg scale-110"
                    : "bg-white text-gray-400 border-gray-300"}
                `}>
                  {isCompleted
                    ? <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
                    : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  }
                </div>
                <span className={`mt-2 sm:mt-3 text-[10px] sm:text-xs text-center font-medium px-1
                  ${isActive || isCompleted ? "text-black" : "text-gray-500"}`}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function RegisterCaseInner() {
  const { user } = useAuth()
  const { step, caseType } = useCaseForm()
  const role = user?.role || "USER"
  const StepComponent = STEP_COMPONENTS[step]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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

      {/* Step progress */}
      <StepProgress />

      {/* Active step */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <StepComponent />
      </div>
    </div>
  )
}

export default function RegisterCase() {
  return (
    <CaseFormProvider>
      <RegisterCaseInner />
    </CaseFormProvider>
  )
}