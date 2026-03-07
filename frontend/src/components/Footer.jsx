const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 mt-20">

      <div className="max-w-7xl mx-auto px-8 py-12 grid md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">
            SafeCity AI
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Intelligent surveillance and case management platform
            designed to assist law enforcement with real-time
            monitoring and facial recognition.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-medium mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Home</li>
            <li className="hover:text-white cursor-pointer">Register Case</li>
            <li className="hover:text-white cursor-pointer">Dashboard</li>
            <li className="hover:text-white cursor-pointer">Contact</li>
          </ul>
        </div>



        {/* Contact */}
        <div>
          <h3 className="text-white font-medium mb-4">
            Contact
          </h3>
          <p className="text-sm text-gray-400">
            Email: support@safecity.ai
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Phone: +91 95185 54423
          </p>
          <p className="text-sm text-gray-400 mt-2">
            India
          </p>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} SafeCity AI. All rights reserved.
      </div>

    </footer>
  )
}

export default Footer