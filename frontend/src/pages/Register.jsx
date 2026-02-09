import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"


export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Basic validations
    if (!form.name || !form.phone || !form.email || !form.password) {
      alert("All fields are required")
      return
    }

    if (form.phone.length !== 10) {
      alert("Phone number must be 10 digits")
      return
    }

    if (!form.email.includes("@")) {
      alert("Please enter a valid email")
      return
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    alert("Registration validation successful (UI only)")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

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
            Register
          </Button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <span
  onClick={() => navigate("/login")}
  className="text-red-500 cursor-pointer"
>
  Login
</span>

        </p>
      </div>
    </div>
  )
}
