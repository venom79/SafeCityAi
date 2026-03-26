import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import ProtectedRoute from "@/components/ProtectedRoute"

import Layout from "./components/Layout"

import Landing from "./pages/Landing"
import Home from "./pages/Home"
import Register from "./pages/Register"
import Login from "./pages/Login"
import AboutUs from "./pages/AboutUs"
import Contact from "./pages/Contact"

// Dashboards
import UserDashboard from "./pages/dashboard/UserDashboard"
import AdminDashboard from "./pages/dashboard/AdminDashboard"
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard"

// User Pages
import RegisterCase from "./pages/registerCase/RegisterCase"
// import RegisterCase from "./pages/user/RegisterCase"
import MyDashboard from "./pages/dashboard/user/MyDashboard"
import MyAlerts from "./pages/dashboard/user/MyAlerts"
import DraftCases from "./pages/dashboard/user/DraftCases"

// Case Pages
import CaseList from "./pages/cases/CaseList"
import CaseDetail from "./pages/cases/CaseDetail"

// Admin pages
import AssignedCases from "./pages/dashboard/admin/AssignedCases"
import CCTV from "./pages/dashboard/admin/CCTV"
import SketchScan from "./pages/dashboard/admin/SketchScan"
import Alerts from "./pages/dashboard/admin/Alerts"

// Super Admin pages
import ManageUsers from "./pages/dashboard/superAdmin/ManageUsers"
import WithdrawRequests from "./pages/dashboard/superAdmin/WithdrawRequests"

// report 
import Reports from "./pages/dashboard/reports/Reports"

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>

          {/* PUBLIC */}
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* ================= USER DASHBOARD ================= */}
          <Route
            path="/dashboard/user"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<MyDashboard />} />
            <Route path="register-case" element={<RegisterCase />} />
            <Route path="my-cases" element={<CaseList />} />
            <Route path="draft-cases" element={<DraftCases />} />
            <Route path="cases/:id" element={<CaseDetail />} />
            <Route path="alerts" element={<MyAlerts />} />
          </Route>

          {/* ================= ADMIN DASHBOARD ================= */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="assigned-cases" replace />} />
            <Route path="assigned-cases" element={<AssignedCases />} />
            <Route path="register-case" element={<RegisterCase />} />
            <Route path="cases/:id" element={<CaseDetail />} />
            <Route path="cctv" element={<CCTV />} />
            <Route path="sketch-scan" element={<SketchScan />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* ================= SUPER ADMIN ================= */}
          <Route
            path="/dashboard/superadmin"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="cases" replace />} />
            <Route path="cases" element={<CaseList />} />
            <Route path="cases/:id" element={<CaseDetail />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="withdraw-requests" element={<WithdrawRequests />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="cctv" element={<CCTV />} />
            <Route path="sketch-scan" element={<SketchScan />} />
            <Route path="reports" element={<Reports />} />
          </Route>

        </Route>
      </Routes>

      <Toaster richColors position="top-right" />
    </>
  )
}

export default App