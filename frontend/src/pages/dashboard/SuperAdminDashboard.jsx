import { NavLink, Outlet, useLocation } from "react-router-dom"

const tabStyle = ({ isActive }) =>
  `relative px-4 py-4 text-sm transition-colors ${
    isActive
      ? "text-white"
      : "text-gray-400 hover:text-white"
  }`

const SuperAdminDashboard = () => {
  const location = useLocation()

  const isCCTV = location.pathname.includes("/cctv")

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ================= TOP NAV ================= */}
      <div className="bg-black text-white border-b border-zinc-800">
      <div className="flex space-x-8 px-6 overflow-x-auto">

        {/* 1️⃣ Core System Control */}
        <NavLink to="cases" className={tabStyle}>
          {({ isActive }) => (
            <>
              View All Cases
              {isActive && (
                <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-white" />
              )}
            </>
          )}
        </NavLink>

        {/* 2️⃣ Case Lifecycle Control */}
        <NavLink to="withdraw-requests" className={tabStyle}>
          {({ isActive }) => (
            <>
              Withdraw Requests
              {isActive && (
                <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-white" />
              )}
            </>
          )}
        </NavLink>

        {/* 3️⃣ Governance */}
        <NavLink to="users" className={tabStyle}>
          {({ isActive }) => (
            <>
              Manage Users
              {isActive && (
                <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-white" />
              )}
            </>
          )}
        </NavLink>

        {/* 4️⃣ Operational Monitoring */}
        <NavLink to="alerts" className={tabStyle}>
          {({ isActive }) => (
            <>
              Alerts
              {isActive && (
                <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-white" />
              )}
            </>
          )}
        </NavLink>

        {/* 5️⃣ Surveillance */}
        <NavLink to="cctv" className={tabStyle}>
          {({ isActive }) => (
            <>
              CCTV Monitoring
              {isActive && (
                <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-white" />
              )}
            </>
          )}
        </NavLink>

        {/* 6️⃣ AI Tooling */}
        <NavLink to="sketch-scan" className={tabStyle}>
          {({ isActive }) => (
            <>
              Sketch Scan
              {isActive && (
                <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-white" />
              )}
            </>
          )}
        </NavLink>

      </div>
    </div>

      {/* ================= CONTENT ================= */}
      <main
        className={`flex-1 ${
          isCCTV
            ? "w-full p-0"
            : "max-w-7xl mx-auto w-full px-6 py-8"
        }`}
      >
        <Outlet />
      </main>

    </div>
  )
}

export default SuperAdminDashboard