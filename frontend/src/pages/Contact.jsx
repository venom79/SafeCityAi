import { useState } from "react"

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(form)
    // TODO: connect to backend API
  }

  return (
    <div className="min-h-screen bg-white text-black px-6 py-24">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold">
            Contact SafeCityAI
          </h1>
          <p className="mt-6 text-gray-600 text-lg">
            For system inquiries, technical support, or collaboration
            requests, reach out through the channels below.
          </p>
        </div>

        {/* CONTENT GRID */}
        <div className="grid md:grid-cols-2 gap-16 mt-20">

          {/* LEFT SIDE - CONTACT INFO */}
          <div className="space-y-10">

            <div>
              <h3 className="text-xl font-semibold mb-3">
                General Inquiries
              </h3>
              <p className="text-gray-600">
                Email: support@safecityai.gov
              </p>
              <p className="text-gray-600">
                Phone: +91 90000 00000
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">
                Law Enforcement Access
              </h3>
              <p className="text-gray-600">
                For administrative access or case-related coordination,
                contact your regional system supervisor.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">
                Technical Support
              </h3>
              <p className="text-gray-600">
                Report system issues related to case submission,
                CCTV monitoring, or alert notifications.
              </p>
            </div>

          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="border border-gray-200 rounded-xl p-10 shadow-sm">

            <h3 className="text-2xl font-semibold mb-8">
              Send a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  rows="5"
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-black transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition"
              >
                Submit Inquiry
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Contact
