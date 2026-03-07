import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, MapPin, Clock } from "lucide-react"
import { useCaseForm } from "@/context/CaseFormContext"

export default function StepCaseDetails() {
  const { caseDetails, setCaseDetails, setStep, saveDraft } = useCaseForm()

  const update = (key) => (e) => setCaseDetails({ ...caseDetails, [key]: e.target.value })

  return (
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
            onChange={update("title")}
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
            onChange={update("lastSeenLocation")}
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
            onChange={update("lastSeenDate")}
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
            onChange={update("lastSeenTime")}
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
            onChange={update("description")}
            className="border-gray-300 focus:border-black focus:ring-black min-h-[150px]"
          />
          <p className="text-xs text-gray-500">Include any relevant details about circumstances, witnesses, or important information</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={() => setStep(2)} className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100">
          <span>←</span> Back
        </Button>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={saveDraft} className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100">
            <FileText className="w-4 h-4" /> Save Draft
          </Button>
          <Button onClick={() => setStep(4)} className="gap-2 w-full sm:w-auto bg-black hover:bg-gray-800 text-white">
            Next <span>→</span>
          </Button>
        </div>
      </div>
    </div>
  )
}