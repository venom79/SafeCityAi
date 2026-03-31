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

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("All fields are required")
      return
    }

    if (!validateEmail(form.email)) {
      setError("Enter a valid email address")
      return
    }

    try {
      setLoading(true)

      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password
      })

      const { success, message, data } = res.data

      // 🔥 handle logical failure (important)
      if (!success) {
        toast.error(message || "Login failed")
        return
      }

      const { accessToken, refreshToken, user } = data

      login(user, accessToken, refreshToken)

      // ✅ success toast
      toast.success(message || "Login successful", {
        duration: 1200
      })

      // ✅ delayed navigation
      setTimeout(() => {
        if (user.role === "SUPER_ADMIN") {
          navigate("/dashboard/superadmin")
        } else if (user.role === "ADMIN") {
          navigate("/dashboard/admin")
        } else {
          navigate("/dashboard/user")
        }
      }, 1000)

    } catch (err) {
      console.log("ERROR:", err)

      const msg =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong"

      toast.error(msg)
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

        {/* ❌ removed onSubmit */}
        <div className="space-y-6">

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="mt-2"
              disabled={loading}
            />
          </div>

          {/* Password */}
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
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right mt-2">
              <span
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-gray-600 hover:text-black cursor-pointer underline"
              >
                Forgot Password?
              </span>
            </div>
          </div>

          {/* Inline error */}
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            type="button"   // 🔥 IMPORTANT FIX
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            {loading ? "Signing In..." : "Login"}
          </Button>

        </div>

        {/* Register */}
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