import UserDashboardLayout from "@/components/layout/UserDashboardLayout"

const AboutUs = () => {
  return (
    <UserDashboardLayout>
      <div className="space-y-12">

        {/* HERO SECTION */}
        <div className="relative h-72 rounded-xl overflow-hidden shadow">
          <img
            src="https://www.shutterstock.com/image-vector/confident-smiling-police-officer-uniform-260nw-2721538835.jpg"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h1 className="text-white text-3xl font-semibold">
              About SafeCity Portal
            </h1>
          </div>
        </div>

        {/* ABOUT CONTENT */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Who We Are
          </h2>

          <p className="text-gray-600 leading-relaxed">
            SafeCity Portal is designed to help citizens report missing
            person cases quickly and efficiently. The platform connects
            users with authorities by providing a simple way to submit
            case details, upload photographs, and track updates.
          </p>

          <p className="text-gray-600 leading-relaxed">
            Our goal is to improve response time and make the reporting
            process easier, more transparent, and accessible to everyone.
          </p>
        </div>

        {/* FEATURE SECTION */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <h3 className="font-semibold mb-2">Report Cases</h3>
            <p className="text-gray-500 text-sm">
              Register missing person cases easily online.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 text-center">
            <h3 className="font-semibold mb-2">Upload Details</h3>
            <p className="text-gray-500 text-sm">
              Provide photos and identifying information.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 text-center">
            <h3 className="font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-500 text-sm">
              Monitor updates from authorities.
            </p>
          </div>
        </div>

      </div>
    </UserDashboardLayout>
  )
}

export default AboutUs
