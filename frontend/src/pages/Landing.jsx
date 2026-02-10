import { Link } from "react-router-dom"

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-8 py-4 bg-[#2B2024] text-white">
        <h1 className="text-xl font-semibold">SafeCity</h1>

        <div className="flex gap-6">
          <Link to="/about">About</Link>
          <Link to="/">Home</Link>
          <Link to="/register-case">Register Case</Link>
        </div>
      </div>

      {/* HERO WITH IMAGE */}
      <div
        className="relative flex flex-col items-center justify-center text-center py-32 px-6 text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://https://https://img.freepik.com/free-photo/close-up-anthropomorphic-robot-as-police-officer_23-2150865917.jpg?semt=ais_user_personalization&w=740&q=80://media.licdn.com/dms/image/v2/D4E12AQFCZhUJQ7FFUg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1721172914301?e=2147483647&v=beta&t=gt_dNPgGnu0ErvOoR8XqdKRnCJyzsQzbY6zp1nzJ9LQ.dreamstime.com/b/futuristic-ai-agi-robot-android-intricate-colorful-wiring-advanced-visual-interfaces-generated-portraits-showcasing-380454475.jpg-tbn0.gstatic.com/https://thumbs.dreamstime.com/b/ai-machine-learning-hands-robot-human-touching-big-data-network-connection-background-science-artificial-intelligence-172987598.jpg?q=tbn:ANd9GcSWYbkWhPKDBmXSVYeBId1tqdLEkFiFTETuOA&s://images.unsplash.com/photo-1505672678657-cc7037095e2a?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        {/* overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* content */}
        <div className="relative">
          <h1 className="text-4xl font-bold mb-4">
            SafeCity Missing Person Portal
          </h1>

          <p className="max-w-xl opacity-90">
            A digital platform designed to help citizens report missing
            person cases quickly and allow authorities to track and
            respond efficiently.
          </p>

          <Link
            to="/register-case"
            className="mt-6 inline-block bg-white text-[#A80038] px-6 py-3 rounded-lg font-semibold"
          >
            Register a Case
          </Link>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <div className="max-w-5xl mx-auto py-16 px-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          How SafeCity Works
        </h2>

        <p className="text-gray-600">
          SafeCity allows citizens to register missing person cases,
          upload important information, and monitor case updates.
          The system helps authorities respond faster and improves
          coordination between citizens and law enforcement.
        </p>
      </div>

      {/* FOOTER */}
      <div className="text-center py-6 bg-[#2B2024] text-white">
        © 2026 SafeCity Portal
      </div>

    </div>
  )
}

export default Landing
