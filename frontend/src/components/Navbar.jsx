import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X, User } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import logo from "@/assets/SafeCitylogo.svg"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const isLoggedIn = !!user

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const getDashboardPath = () => {
    if (!user) return "/login"

    if (user.role === "SUPER_ADMIN") return "/dashboard/superadmin"
    if (user.role === "ADMIN") return "/dashboard/admin"
    return "/dashboard/user"
  }

  return (
    <>
      <nav className="bg-black text-white fixed top-0 left-0 w-full z-50 shadow-md">
        <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">

          {/* LEFT - Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={logo}  // put your logo in public folder
              alt="SafeCity Logo"
              className="h-15 w-15 object-contain"
            />
            <span className="text-2xl font-bold tracking-wide">
              SafeCityAI
            </span>
          </Link>

          {/* RIGHT - Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">

            {/* Main Links */}
            <Link to="/" className="hover:text-gray-300 transition">
              Home
            </Link>
            <Link to="/about" className="hover:text-gray-300 transition">
              About
            </Link>
            <Link to="/contact" className="hover:text-gray-300 transition">
              Contact
            </Link>

            {/* Auth Section */}
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="hover:text-gray-300 transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="border border-white px-4 py-2 rounded-md hover:bg-white hover:text-black transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={getDashboardPath()}
                  className="hover:text-gray-300 transition"
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="hover:text-gray-300 transition"
                >
                  Logout
                </button>

                <User className="cursor-pointer hover:text-gray-300" />
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(true)}
          >
            <Menu size={26} />
          </button>

        </div>
      </nav>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-black text-white z-50 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden shadow-lg`}
      >
        <div className="flex justify-between items-center px-6 h-20 border-b border-gray-800">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col space-y-8 px-6 py-10 text-sm font-medium">
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setIsOpen(false)}>About</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link>

          <div className="border-t border-gray-800 pt-8">
            {!isLoggedIn ? (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block mb-6">
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setIsOpen(false)}
                  className="block mb-6"
                >
                  Dashboard
                </Link>

                <button
                  onClick={() => {
                    setIsOpen(false)
                    handleLogout()
                  }}
                  className="text-left"
                >
                  Logout
                </button>

                <div className="flex items-center space-x-3 mt-6">
                  <User size={18} />
                  <span>{user.role}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
