import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.email || !form.password) {
      alert("All fields are required")
      return
    }

    if (!form.email.includes("@")) {
      alert("Enter a valid email")
      return
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    alert("Login validation successful (UI only)")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  )
}
