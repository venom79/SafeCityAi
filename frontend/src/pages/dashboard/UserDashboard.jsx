// import { NavLink } from "react-router-dom"

// const tabStyle = ({ isActive }) =>
//   `relative px-4 py-4 text-sm transition-colors ${
//     isActive
//       ? "text-white"
//       : "text-gray-400 hover:text-white"
//   }`

// const UserDashboard = () => {
//   return (
//     <div className="min-h-screen bg-white flex flex-col">

//       {/* ================= TOP NAV (same theme as admin) ================= */}
//       <div className="bg-zinc-900 text-white border-b border-zinc-800">
//         <div className="flex space-x-8 px-6 overflow-x-auto">

//           <NavLink to="/dashboard/user" className={tabStyle}>
//             {({ isActive }) => (
//               <>
//                 Home
//                 {isActive && (
//                   <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-white" />
//                 )}
//               </>
//             )}
//           </NavLink>

//           <NavLink to="/about" className={tabStyle}>
//             About
//           </NavLink>

//           <NavLink to="/contact" className={tabStyle}>
//             Contact
//           </NavLink>

//           <NavLink to="/cases/list" className={tabStyle}>
//             Missing / Wanted List
//           </NavLink>

//         </div>
//       </div>

//       {/* ================= DASHBOARD CONTENT ================= */}
//       <main className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6">

//         {/* HERO */}
//         <div className="bg-white rounded-xl shadow p-6 border-l-4 border-black">
//           <h1 className="text-2xl font-semibold text-gray-800">
//             Welcome to SafeCity Dashboard
//           </h1>

//           <p className="text-gray-500">
//             Report missing person cases, track alerts, and monitor updates
//             from one centralized system.
//           </p>

//           <div className="mt-5">
//             <button className="bg-black text-white px-5 py-2 rounded-lg hover:bg-zinc-800 transition">
//               Register Case
//             </button>
//           </div>
//         </div>

//         {/* STATS */}
//         <div className="grid grid-cols-3 gap-6">

//           <div className="bg-white rounded-xl shadow p-5">
//             <p className="text-gray-500 text-sm">Cases Submitted</p>
//             <p className="text-2xl font-semibold mt-2">0</p>
//           </div>

//           <div className="bg-white rounded-xl shadow p-5">
//             <p className="text-gray-500 text-sm">Active Cases</p>
//             <p className="text-2xl font-semibold mt-2">0</p>
//           </div>

//           <div className="bg-white rounded-xl shadow p-5">
//             <p className="text-gray-500 text-sm">Alerts</p>
//             <p className="text-2xl font-semibold mt-2">0</p>
//           </div>

//         </div>

//         {/* ALERTS PANEL */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h2 className="font-semibold text-black mb-3">
//             Alerts
//           </h2>

//           <p className="text-gray-500 text-sm">
//             No alerts available.
//           </p>
//         </div>

//       </main>
//     </div>
//   )
// }

// export default UserDashboard

import { NavLink, useNavigate } from "react-router-dom"

const tabStyle = ({ isActive }) =>
  `relative px-4 py-4 text-sm transition-colors ${
    isActive
      ? "text-white"
      : "text-gray-400 hover:text-white"
  }`

const UserDashboard = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ================= TOP NAV ================= */}
      <div className="bg-zinc-900 text-white border-b border-zinc-800">
        <div className="flex space-x-8 px-6 overflow-x-auto">

          <NavLink to="/dashboard/user" className={tabStyle}>
            Home
          </NavLink>

          <NavLink to="/register-case" className={tabStyle}>

            Register Case
          </NavLink>



          <NavLink to="/my-cases" className={tabStyle}>
            Alerts
          </NavLink>

        </div>
      </div>

      {/* ================= DASHBOARD CONTENT ================= */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6">

        {/* HERO */}
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-black">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome to SafeCity Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Report missing person cases, track alerts, and monitor updates
            from one centralized system.
          </p>

          <div className="mt-5">
            <button
              onClick={() => navigate("/register-case")}

              className="bg-black text-white px-5 py-2 rounded-lg hover:bg-zinc-800 transition"
            >
              Register Case
            </button>


          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Cases Submitted</p>
            <p className="text-2xl font-semibold mt-2">0</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Active Cases</p>
            <p className="text-2xl font-semibold mt-2">0</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Alerts</p>
            <p className="text-2xl font-semibold mt-2">0</p>
          </div>

        </div>

        {/* ALERTS PANEL */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-black mb-3">
            Alerts
          </h2>

          <p className="text-gray-500 text-sm">
            No alerts available.
          </p>
        </div>

      </main>
    </div>
  )
}

export default UserDashboard
