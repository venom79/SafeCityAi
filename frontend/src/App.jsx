import { Routes, Route } from "react-router-dom"

import Layout from "./components/Layout"

import Landing from "./pages/Landing"
import Home from "./pages/Home"
import Register from "./pages/Register"
import Login from "./pages/Login"
import AboutUs from "./pages/AboutUs"

// Dashboards
import UserDashboard from "./pages/dashboard/UserDashboard"
import AdminDashboard from "./pages/dashboard/AdminDashboard"
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard"

// User Pages
import RegisterCase from "./pages/user/RegisterCase"
import MyCases from "./pages/user/MyCases"

// Case Pages
import CaseList from "./pages/cases/CaseList"
import CaseDetail from "./pages/cases/CaseDetail"

function App() {
  return (
    <Routes>

      {/* Public routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Routes using common Layout */}
      <Route element={<Layout />}>

        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Landing />} />

        {/* User related */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/register-case" element={<RegisterCase />} />
        <Route path="/my-cases" element={<MyCases />} />

        {/* Dashboards */}
        <Route path="/dashboard/user" element={<UserDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/superadmin" element={<SuperAdminDashboard />} />

        {/* Cases */}
        <Route path="/cases" element={<CaseList />} />
        <Route path="/cases/:id" element={<CaseDetail />} />

      </Route>

    </Routes>
  )
}

export default App
