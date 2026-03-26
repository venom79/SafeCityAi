import { NavLink, Outlet, useLocation } from "react-router-dom"

const tabStyle = ({ isActive }) =>
  `relative px-4 py-4 text-sm transition-colors ${
    isActive
      ? "text-white"
      : "text-gray-400 hover:text-white"
  }`

const AdminDashboard = () => {
  const location = useLocation()

  const isCCTV = location.pathname.includes("/cctv")

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ================= TOP NAV ================= */}
      <div className="bg-zinc-900 text-white border-b border-zinc-800">
        <div className="flex space-x-8 px-6 overflow-x-auto">

          <NavLink to="assigned-cases" className={tabStyle}>
            {({ isActive }) => (
              <>
                Assigned Cases
                {isActive && (
                  <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-white" />
                )}
              </>
            )}
          </NavLink>
          
          <NavLink to="register-case" className={tabStyle}>
            {({ isActive }) => (
              <>
                Register Case
                {isActive && (
                  <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-white" />
                )}
              </>
            )}
          </NavLink>

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

          <NavLink to="sketch-scan" className={tabStyle}>
            {({ isActive }) => (
              <>
                Scan Face
                {isActive && (
                  <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-white" />
                )}
              </>
            )}
          </NavLink>

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

          {/* ===== NEW REPORT TAB ===== */}
          <NavLink to="reports" className={tabStyle}>
            {({ isActive }) => (
              <>
                Reports
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

export default AdminDashboard