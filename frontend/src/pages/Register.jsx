import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import api from "@/lib/axios"
import { useToast } from "@/components/ui/use-toast"


export default function Register() {
  const navigate = useNavigate()

  const { toast } = useToast()


  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Frontend validation
    if (!form.name || !form.phone || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required")
      return
    }

    if (form.phone.length !== 10) {
      setError("Phone number must be 10 digits")
      return
    }

    if (!form.email.includes("@")) {
      setError("Enter a valid email address")
      return
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setLoading(true)

      const res = await api.post("/auth/register", {
        email: form.email,
        password: form.password,
        full_name: form.name,
        phone: form.phone
      })

      toast({
        title: "Account created",
        description: "Registration successful. Please login.",
      })

      navigate("/login")

    } catch (err) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: err.response?.data?.message || "Something went wrong",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-gray-200 rounded-2xl p-10 shadow-sm">

        <h2 className="text-3xl font-bold text-center mb-8">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* FULL NAME */}
          <div>
            <Label>Full Name</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="mt-2"
            />
          </div>

          {/* PHONE */}
          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              className="mt-2"
            />
          </div>

          {/* EMAIL */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="mt-2"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <Label>Password</Label>
            <div className="relative mt-2">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <Label>Confirm Password</Label>
            <div className="relative mt-2">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {/* SUBMIT BUTTON */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            {loading ? "Creating Account..." : "Register"}
          </Button>

        </form>

        {/* LOGIN LINK */}
        <p className="text-center text-sm mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-black font-medium cursor-pointer underline"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  )
}
