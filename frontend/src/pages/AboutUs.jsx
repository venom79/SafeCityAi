const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white text-black px-6 py-20">

      <div className="max-w-6xl mx-auto space-y-24">

        {/* HERO */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            About SafeCityAI
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            SafeCityAI is an AI-powered case management and real-time
            facial recognition system built to assist authorities in
            locating missing and wanted individuals through automated
            surveillance intelligence.
          </p>
        </div>


        {/* MISSION */}
        <div className="grid md:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="text-3xl font-semibold mb-6">
              Our Mission
            </h2>

            <p className="text-gray-700 leading-relaxed mb-6">
              We aim to bridge the gap between citizen case reporting
              and real-time surveillance by integrating structured
              workflows with deep learning-based facial recognition.
            </p>

            <p className="text-gray-700 leading-relaxed">
              SafeCityAI reduces manual CCTV monitoring, accelerates
              investigations, and improves response time through
              intelligent alert generation and automated detection.
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-10 bg-gray-50">
            <h3 className="text-xl font-semibold mb-4">
              Core Capabilities
            </h3>

            <ul className="space-y-3 text-gray-700">
              <li>• Role-based case management workflow</li>
              <li>• AI face embedding generation & vector search</li>
              <li>• Real-time CCTV stream processing</li>
              <li>• Alert generation with confidence scoring</li>
              <li>• Structured approval & assignment system</li>
            </ul>
          </div>

        </div>


        {/* SYSTEM FLOW */}
        <div>
          <h2 className="text-3xl font-semibold text-center mb-16">
            How the System Operates
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            <div className="border border-gray-200 rounded-xl p-8 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">
                01. Case Registration
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Users register missing or wanted individuals,
                upload photos, and submit identifying details
                for review and approval.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-8 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">
                02. AI Processing
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Deep learning models generate face embeddings
                stored in a vector database for similarity-based
                matching using cosine distance thresholds.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-8 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">
                03. Real-Time Detection
              </h3>
              <p className="text-gray-600 leading-relaxed">
                CCTV frames are analyzed continuously.
                Confirmed matches trigger alerts linked to
                cases, persons, cameras, and confidence scores.
              </p>
            </div>

          </div>
        </div>


        {/* IMPACT */}
        <div className="bg-black text-white rounded-2xl p-16 text-center">
          <h2 className="text-3xl font-semibold">
            Real-World Impact
          </h2>

          <p className="mt-6 max-w-3xl mx-auto text-gray-300 leading-relaxed">
            SafeCityAI enables faster identification of missing
            and wanted individuals, reduces manual surveillance
            workload, and enhances public safety response time
            through intelligent automation and structured oversight.
          </p>
        </div>

      </div>

    </div>
  )
}

export default AboutUs
