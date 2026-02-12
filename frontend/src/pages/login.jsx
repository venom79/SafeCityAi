import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/axios"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    email: "",
    password: ""
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.email || !form.password) {
      setError("All fields are required")
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

    try {
      setLoading(true)

      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password
      })

      const { accessToken, refreshToken, user } = res.data.data

      // Use AuthContext instead of manual localStorage
      login(user, accessToken, refreshToken)

      toast.success("Login successful")

      // Redirect based on role
      if (user.role === "SUPER_ADMIN") {
        navigate("/dashboard/superadmin")
      } else if (user.role === "ADMIN") {
        navigate("/dashboard/admin")
      } else {
        navigate("/dashboard/user")
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-gray-200 rounded-2xl p-10 shadow-sm">

        <h2 className="text-3xl font-bold text-center mb-8">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

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

          <div>
            <Label>Password</Label>
            <div className="relative mt-2">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
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

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            {loading ? "Signing In..." : "Login"}
          </Button>

        </form>

        <p className="text-center text-sm mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-black font-medium cursor-pointer underline"
          >
            Register
          </span>
        </p>

      </div>
    </div>
  )
}
