import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FileText, Upload, User, X, CheckCircle2 } from "lucide-react"
import { useCaseForm } from "@/context/CaseFormContext"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function StepPhotosSubmit() {

  const navigate = useNavigate()

  const { user } = useAuth()
  const role = user?.role || "USER"

  const {
    persons,
    agree,
    setAgree,
    dragActive,
    handleDrag,
    handleDrop,
    addPhotos,
    removePhoto,
    setStep,
    handleSubmit
  } = useCaseForm()

  const allHavePhotos = persons.every(
    (p) => p.photos && p.photos.length > 0
  )

  return (
    <div className="space-y-6 sm:space-y-8">

      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">
          Upload Photos & Submit
        </h2>

        <p className="text-sm sm:text-base text-gray-600">
          Add clear, recent photographs for each person
        </p>
      </div>

      {persons.map((person, personIndex) => (

        <div
          key={person.id}
          className="border-2 border-gray-200 rounded-lg overflow-hidden"
        >

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

            {/* DROP ZONE */}

            <div
              className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors cursor-pointer
              ${dragActive
                ? "border-black bg-gray-50"
                : "border-gray-300 hover:border-black hover:bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, personIndex)}
            >

              <Upload
                className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 ${
                  dragActive ? "text-black" : "text-gray-400"
                }`}
              />

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
                id={`file-upload-${person.id}`}
                onChange={(e) => {

                  if (!e.target.files) return

                  addPhotos(
                    Array.from(e.target.files),
                    personIndex
                  )

                }}
              />

              <label htmlFor={`file-upload-${person.id}`}>

                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer border-black text-black hover:bg-gray-100"
                  asChild
                >
                  <span>Choose Files</span>
                </Button>

              </label>

            </div>


            {/* PHOTO GRID */}

            {person.photos && person.photos.length > 0 && (

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">

                {person.photos.map((photo, photoIndex) => (

                  <div
                    key={photo.id || photoIndex}
                    className="relative group"
                  >

                    <img
                      src={photo.file_url || photo.url}
                      alt={`Photo ${photoIndex + 1}`}
                      className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-gray-200"
                    />

                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700"
                      onClick={() =>
                        removePhoto(personIndex, photoIndex)
                      }
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



      {/* DECLARATION */}

      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 sm:p-6">

        <div className="flex items-start gap-3">

          <Checkbox
            id="agree"
            checked={agree}
            onCheckedChange={setAgree}
            className="mt-1"
          />

          <div className="flex-1">

            <Label
              htmlFor="agree"
              className="text-sm font-semibold text-gray-900 cursor-pointer"
            >
              Declaration and Confirmation
            </Label>

            <p className="text-xs sm:text-sm text-gray-700 mt-1">
              I hereby declare that all the information provided above is true
              and accurate to the best of my knowledge. I understand that
              providing false information is a punishable offense under the law.
            </p>

          </div>

        </div>

      </div>



      {/* ACTION BUTTONS */}

      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">

        <Button
          variant="outline"
          onClick={() => setStep(4)}
          className="gap-2 w-full sm:w-auto border-black text-black hover:bg-gray-100"
        >
          ← Back
        </Button>

        <div className="flex flex-col sm:flex-row gap-3">

          <Button
            disabled={!agree || !allHavePhotos}
            onClick={async () => {
              const success = await handleSubmit()
              if (success) {
                navigate("/dashboard/user/my-cases")
              }
            }}
            className="gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit Case
          </Button>

          {role === "ADMIN" && (
            <Button
              variant="secondary"
              disabled={!agree || !allHavePhotos}
              onClick={async () => {
                const success = await handleSubmit()
                if (success) {
                  navigate("/dashboard/admin/assigned-cases")
                }
              }}
              className="gap-2 w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white disabled:bg-gray-400"
            >
              Submit & Assign to Self
            </Button>
          )}

        </div>

      </div>

    </div>
  )
}