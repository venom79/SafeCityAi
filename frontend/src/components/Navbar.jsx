import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X, User } from "lucide-react"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  // TODO: replace with real auth logic
  const isLoggedIn = false

  return (
    <nav className="bg-black text-white w-full fixed top-0 left-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LEFT - Logo */}
        <Link to="/" className="text-2xl font-bold tracking-wide">
          SafeCity
        </Link>

        {/* CENTER - Desktop Menu */}
        <div className="hidden md:flex space-x-8 text-sm font-medium">
          <Link to="/" className="hover:text-gray-300 transition">
            Home
          </Link>
          <Link to="/about" className="hover:text-gray-300 transition">
            About
          </Link>
          <Link to="/contact" className="hover:text-gray-300 transition">
            Contact
          </Link>
        </div>

        {/* RIGHT - Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="hover:text-gray-300 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="border border-white px-4 py-1 rounded-md hover:bg-white hover:text-black transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard/user"
                className="hover:text-gray-300 transition"
              >
                Dashboard
              </Link>
              <User className="cursor-pointer hover:text-gray-300" />
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(true)}>
            <Menu size={26} />
          </button>
        </div>
      </div>

      {/* MOBILE SIDEBAR (Right Side) */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-black text-white transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden shadow-lg`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col space-y-6 px-6 py-8 text-sm font-medium">
          <Link to="/" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/about" onClick={() => setIsOpen(false)}>
            About
          </Link>
          <Link to="/contact" onClick={() => setIsOpen(false)}>
            Contact
          </Link>

          {!isLoggedIn ? (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)}>
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard/user"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <User size={18} />
                <span>Profile</span>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
