import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/axios"
import { toast } from "sonner"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email")
      return
    }

    try {
      setLoading(true)

      await api.post("/auth/forgot-password", { email })

      toast.success("If the email exists, a reset link has been sent")

    } catch (err) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md border rounded-2xl p-10 shadow-sm">

        <h2 className="text-2xl font-bold text-center mb-6">
          Forgot Password
        </h2>

        <div className="space-y-5">

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-2"
              disabled={loading}
            />
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white cursor-pointer"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

        </div>
      </div>
    </div>
  )
}

export default ForgotPassword;