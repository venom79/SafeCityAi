import { NavLink, Outlet } from "react-router-dom"

const tabStyle = ({ isActive }) =>
  `relative px-4 py-4 text-sm transition-colors ${
    isActive
      ? "text-white"
      : "text-gray-400 hover:text-white"
  }`

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ================= TOP NAV ================= */}
      <div className="bg-zinc-900 text-white border-b border-zinc-800">
        <div className="flex space-x-8 px-6 overflow-x-auto">

          <NavLink to="." end className={tabStyle}>
            {({ isActive }) => (
              <>
                My Dashboard
                {isActive && (
                  <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-white" />
                )}
              </>
            )}
          </NavLink>

          <NavLink to="my-cases" className={tabStyle}>
            {({ isActive }) => (
              <>
                My Cases
                {isActive && (
                  <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-white" />
                )}
              </>
            )}
          </NavLink>
          
          <NavLink to="draft-cases" className={tabStyle}>
            {({ isActive }) => (
              <>
                Draft cases
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

          <NavLink to="missing-persons" className={tabStyle}>
            {({ isActive }) => (
              <>
                Missing / Wanted
                {isActive && (
                  <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-white" />
                )}
              </>
            )}
          </NavLink>

        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>

    </div>
  )
}

export default UserDashboard