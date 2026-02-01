import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
          Create Account
        </h2>

        <form className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input type="text" placeholder="Enter your name" />
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" placeholder="Enter your email" />
          </div>

          <div>
            <Label>Password</Label>
            <Input type="password" placeholder="Enter password" />
          </div>

          <Button className="w-full bg-red-500 hover:bg-red-600">
            Register
          </Button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <span className="text-red-500 cursor-pointer">Login</span>
        </p>
      </div>
    </div>
  )
}
