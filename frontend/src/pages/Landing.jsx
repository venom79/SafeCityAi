import { Link } from "react-router-dom"

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-black">

      {/* HERO SECTION */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            AI-Driven Surveillance & Case Intelligence
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-gray-300 text-lg">
            SafeCityAI connects citizen case reporting with real-time
            facial recognition and CCTV monitoring to help authorities
            locate missing and wanted individuals faster.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/register"
              className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-200 transition"
            >
              Report a Case
            </Link>

            <Link
              to="/register"
              className="border border-white px-8 py-3 rounded-md hover:bg-white hover:text-black transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>


      {/* CORE FEATURES */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold tracking-tight">
              System Capabilities
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              A unified platform combining structured case workflows,
              AI-powered facial recognition, and real-time surveillance intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 mt-20">

            {/* CARD 1 */}
            <div className="group border border-gray-200 rounded-xl p-8 transition duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-lg text-lg font-bold">
                01
              </div>

              <h3 className="text-xl font-semibold mt-6">
                Case Management
              </h3>

              <p className="mt-4 text-gray-600 leading-relaxed">
                Structured workflows allow users to register missing or wanted
                individuals, upload multiple photos, and track status updates
                through role-based approval and assignment systems.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="group border border-gray-200 rounded-xl p-8 transition duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-lg text-lg font-bold">
                02
              </div>

              <h3 className="text-xl font-semibold mt-6">
                AI Face Recognition
              </h3>

              <p className="mt-4 text-gray-600 leading-relaxed">
                Deep learning models generate face embeddings stored in a vector
                database. Incoming CCTV frames are matched using cosine similarity
                for accurate identification and classification.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="group border border-gray-200 rounded-xl p-8 transition duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-lg text-lg font-bold">
                03
              </div>

              <h3 className="text-xl font-semibold mt-6">
                Real-Time CCTV Monitoring
              </h3>

              <p className="mt-4 text-gray-600 leading-relaxed">
                Live CCTV streams are processed continuously. Confirmed matches
                trigger instant alerts linked to cases, persons, cameras,
                and confidence scores for rapid response.
              </p>
            </div>

          </div>
        </div>
      </section>



      {/* FINAL CTA */}
      <section className="bg-black text-white py-20 text-center">
        <h2 className="text-3xl font-bold">
          Improving Public Safety Through AI Intelligence
        </h2>

        <p className="mt-6 text-gray-300 max-w-2xl mx-auto">
          SafeCityAI bridges citizen reporting and automated surveillance
          to accelerate investigations and reduce manual monitoring.
        </p>

        <Link
          to="/register"
          className="mt-10 inline-block bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-200 transition"
        >
          Get Started
        </Link>
      </section>

    </div>
  )
}

export default Landing
