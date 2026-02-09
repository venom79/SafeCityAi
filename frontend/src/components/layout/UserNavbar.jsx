import { Link } from "react-router-dom"
import { Bell, User, Settings, Search } from "lucide-react"

const UserNavbar = () => {
  return (
    <div className="w-full">

      {/* TOP BAR */}
      <div className="flex justify-between items-center px-6 py-3 bg-black text-white">
        
        <div className="flex items-center bg-white/10 rounded-md px-3 py-2 w-72">
          <Search size={18} className="mr-2 text-gray-300" />
          <input
            placeholder="Search..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        <div className="flex gap-5">
          <Bell />
          <User />
          <Settings />
        </div>
      </div>

      {/* SECOND ROW */}
      <div className="flex justify-between items-center px-6 py-3 bg-[#AA14F0] text-white">
        <Link to="/" className="font-semibold text-lg">
          Dashboard
        </Link>

        <div className="flex gap-6 font-medium">
            <Link to="/about">About Us</Link>
          <Link to="/register-case">Register Case</Link>
          <Link to="/my-cases">My Cases</Link>
        </div>
      </div>
    </div>
  )
}

export default UserNavbar
