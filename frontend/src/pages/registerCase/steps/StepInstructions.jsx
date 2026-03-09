import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle, FileText } from "lucide-react"
import { useCaseForm } from "@/context/CaseFormContext"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/axios"
import { toast } from "sonner"

export default function StepInstructions() {
  const { user } = useAuth()
  const role = user?.role || "USER"

  const {
    caseType,
    setCaseType,
    setStep,
    saveDraft,
    caseId,
    setCaseId
  } = useCaseForm()

  const handleContinue = async () => {
    try {

      // create draft only if caseId doesn't exist
      if (!caseId) {
        const res = await api.post("/cases/draft", {
          caseType
        })

        const newCaseId = res.data.data.caseId

        setCaseId(newCaseId)

        // persist draft id for refresh safety
        localStorage.setItem("draftCaseId", newCaseId)
      }

      setStep(2)

    } catch (err) {
      console.error(err)

      toast.error("Failed to create draft case")
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          Important Instructions
        </h2>

        <div className="bg-gray-50 border-l-4 border-black p-4 sm:p-6 mb-6">
          <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
            {[
              "Provide accurate and verified information only. All details will be verified.",
              "False reporting is a punishable offense under Indian Penal Code Section 182.",
              "Clear, recent face photographs are mandatory for identification purposes.",
              "You can save your progress as a draft at any time and continue later."
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{text}</span>
              </li>
            ))}
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

        <Button
          variant="outline"
          onClick={saveDraft}
          className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100"
        >
          <FileText className="w-4 h-4" />
          Save Draft
        </Button>

        <Button
          onClick={handleContinue}
          className="gap-2 w-full sm:w-auto bg-black hover:bg-gray-800 text-white"
        >
          Continue <span>→</span>
        </Button>

      </div>
    </div>
  )
}