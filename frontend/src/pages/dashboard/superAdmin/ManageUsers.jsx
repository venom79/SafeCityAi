import { useState, useMemo } from "react"
import { Ban, CheckCircle, Search } from "lucide-react"

const dummyUsers = [
  {
    id: "1",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    role: "USER",
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Amit Verma",
    email: "amit@gmail.com",
    role: "USER",
    status: "BANNED",
  },
  {
    id: "3",
    name: "Inspector Rao",
    email: "rao@police.gov",
    role: "ADMIN",
    status: "ACTIVE",
  },
  {
    id: "4",
    name: "Inspector Singh",
    email: "singh@police.gov",
    role: "ADMIN",
    status: "BANNED",
  },
]

const ManageUsers = () => {
  const [users, setUsers] = useState(dummyUsers)
  const [activeTab, setActiveTab] = useState("USER")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const toggleBan = (id) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === id
          ? {
              ...user,
              status: user.status === "ACTIVE" ? "BANNED" : "ACTIVE",
            }
          : user
      )
    )
  }

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => user.role === activeTab)
      .filter(user => {
        if (statusFilter === "ALL") return true
        return user.status === statusFilter
      })
      .filter(user => {
        const q = search.toLowerCase()
        return (
          user.id.toLowerCase().includes(q) ||
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q)
        )
      })
  }, [users, activeTab, search, statusFilter])

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
            placeholder="Search by ID, name, or email..."
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

        {filteredUsers.length === 0 && (
          <div className="text-gray-500 text-sm py-20 text-center">
            No records found.
          </div>
        )}

        {filteredUsers.map(user => (
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