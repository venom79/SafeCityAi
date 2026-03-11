import { useState, useEffect } from "react"
import { Ban, CheckCircle, Search } from "lucide-react"
import api from "@/lib/axios"

const ManageUsers = () => {

  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState("USER")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {

    try {

      setLoading(true)

      const res = await api.get("/users", {
        params: {
          role: activeTab,
          status: statusFilter === "ALL" ? undefined : statusFilter,
          search: search || undefined
        }
      })

      setUsers(res.data.data)

    } catch (err) {

      console.error("Failed to fetch users", err)

    } finally {

      setLoading(false)

    }

  }

  useEffect(() => {
    fetchUsers()
  }, [activeTab, statusFilter, search])

  const toggleBan = async (id) => {

    try {

      const res = await api.patch(`/users/${id}/toggle-ban`)

      setUsers(prev =>
        prev.map(user =>
          user.id === id
            ? { ...user, status: res.data.status }
            : user
        )
      )

    } catch (err) {

      console.error("Failed to update user status", err)

    }

  }

  return (
    <div className="w-full space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">
          User Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Centralized control for managing user roles, access privileges, and account restrictions.
        </p>
      </div>

      {/* ROLE TABS */}
      <div className="flex gap-4">
        {["USER", "ADMIN"].map(role => (
          <button
            key={role}
            onClick={() => setActiveTab(role)}
            className={`px-5 py-2 text-sm rounded-lg transition ${
              activeTab === role
                ? "bg-black text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {role === "USER" ? "Users" : "Admins"}
          </button>
        ))}
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-4">

        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="BANNED">Banned</option>
        </select>

      </div>

      {/* USER LIST */}
      <div className="space-y-6">

        {loading && (
          <div className="text-gray-500 text-sm py-20 text-center">
            Loading users...
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="text-gray-500 text-sm py-20 text-center">
            No records found.
          </div>
        )}

        {users.map(user => (
          <div
            key={user.id}
            className="bg-gray-50 rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >

            {/* LEFT */}
            <div className="space-y-2">
              <h2 className="text-lg font-medium">
                {user.name}
              </h2>

              <p className="text-sm text-gray-500">
                {user.email}
              </p>

              <p className="text-xs text-gray-400">
                ID: {user.id}
              </p>

              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  user.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.status}
              </span>
            </div>

            {/* ACTION */}
            <div>
              <button
                onClick={() => toggleBan(user.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition ${
                  user.status === "ACTIVE"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {user.status === "ACTIVE" ? (
                  <>
                    <Ban size={16} />
                    Ban
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Unban
                  </>
                )}
              </button>
            </div>

          </div>
        ))}

      </div>

    </div>
  )
}

export default ManageUsers