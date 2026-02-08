import UserNavbar from "./UserNavbar"

const UserDashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#EEEEEE]">
      <UserNavbar />
      <div className="max-w-6xl mx-auto p-6">{children}</div>
    </div>
  )
}

export default UserDashboardLayout
