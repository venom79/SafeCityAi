import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // 🔥 added

  const handleSubmit = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    try {
      setLoading(true)

      await api.post("/auth/reset-password", {
        token,
        newPassword: password
      })

      toast.success("Password reset successful")

      setTimeout(() => {
        navigate("/login")
      }, 1000)

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Invalid or expired link"

      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md border rounded-2xl p-10 shadow-sm">

        <h2 className="text-2xl font-bold text-center mb-6">
          Reset Password
        </h2>

        <div className="space-y-5">

          <div>
            <Label>New Password</Label>

            {/* 🔥 Input with eye toggle */}
            <div className="relative mt-2">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
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
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white cursor-pointer"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>

        </div>
      </div>
    </div>
  )
}

export default ResetPassword