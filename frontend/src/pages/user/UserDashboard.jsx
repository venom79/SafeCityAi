import UserDashboardLayout from "@/components/layout/UserDashboardLayout"

const UserDashboard = () => {
  return (
    <UserDashboardLayout>
      <div className="space-y-6">

        {/* HERO */}
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-[#AA14F0]">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome to SafeCity Portal
          </h1>

          <p className="text-gray-500">
            This system is designed to help report and manage missing person cases
            efficiently. Citizens can register cases, upload details, and track
            progress in one place.
          </p>

        </div>

        {/* CARDS */}
        <div className="grid grid-cols-3 gap-6">

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Cases Submitted</p>
            <p className="text-2xl font-semibold text-[#AA14F0] mt-2">0</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Active Cases</p>
            <p className="text-2xl font-semibold text-[#AA14F0] mt-2">0</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Alerts</p>
            <p className="text-2xl font-semibold text-[#AA14F0] mt-2">0</p>
          </div>

        </div>

        {/* ACTIVITY */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-black mb-2">
            Recent Activity
          </h2>
          <p className="text-gray-500 text-sm">
            No recent activity available.
          </p>
        </div>

      </div>
    </UserDashboardLayout>
  )
}

export default UserDashboard
