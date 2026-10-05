import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { HospitalProvider } from './context/HospitalContext'
import { DataProvider } from './context/DataContext'

import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import AccessDenied from './components/common/AccessDenied'

import DonorDashboard from './components/donor/DonorDashboard'
import MyDonorProfile from './components/donor/MyDonorProfile'

import RecipientDashboard from './components/recipient/RecipientDashboard'
import MyRecipientProfile from './components/recipient/MyRecipientProfile'
import AvailableOrgans from './components/recipient/AvailableOrgans'

import CoordinatorShell from './components/coordinator/CoordinatorShell'
import CoordinatorDashboard from './components/coordinator/CoordinatorDashboard'
import CoordinatorDonors from './components/coordinator/CoordinatorDonors'
import CoordinatorRecipients from './components/coordinator/CoordinatorRecipients'
import CoordinatorOrgans from './components/coordinator/CoordinatorOrgans'
import CoordinatorMatching from './components/coordinator/CoordinatorMatching'
import CoordinatorRequests from './components/coordinator/CoordinatorRequests'

import AdminDashboard from './components/admin/AdminDashboard'
import Hospitals from './components/admin/Hospitals'
import Users from './components/admin/Users'
import AuditLog from './components/admin/AuditLog'

import { ROLE_HOME } from './config/permissions'

function RootRedirect() {
  const { currentUser, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_HOME[currentUser.role]} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      <Route element={<Layout />}>
        {/* Donor */}
        <Route path="/donor/dashboard" element={
          <ProtectedRoute roles={['Donor']}><DonorDashboard /></ProtectedRoute>
        } />
        <Route path="/donor/profile" element={
          <ProtectedRoute roles={['Donor']}><MyDonorProfile /></ProtectedRoute>
        } />

        {/* Recipient */}
        <Route path="/recipient/dashboard" element={
          <ProtectedRoute roles={['Recipient']}><RecipientDashboard /></ProtectedRoute>
        } />
        <Route path="/recipient/profile" element={
          <ProtectedRoute roles={['Recipient']}><MyRecipientProfile /></ProtectedRoute>
        } />
        <Route path="/recipient/organs" element={
          <ProtectedRoute roles={['Recipient']}><AvailableOrgans /></ProtectedRoute>
        } />

        {/* Hospital Coordinator */}
        <Route path="/coordinator" element={
          <ProtectedRoute roles={['Hospital Coordinator']}><CoordinatorShell /></ProtectedRoute>
        }>
          <Route path="dashboard" element={<CoordinatorDashboard />} />
          <Route path="donors" element={<CoordinatorDonors />} />
          <Route path="recipients" element={<CoordinatorRecipients />} />
          <Route path="organs" element={<CoordinatorOrgans />} />
          <Route path="matching" element={<CoordinatorMatching />} />
          <Route path="requests" element={<CoordinatorRequests />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['Admin']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/hospitals" element={
          <ProtectedRoute roles={['Admin']}><Hospitals /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['Admin']}><Users /></ProtectedRoute>
        } />
        <Route path="/admin/audit" element={
          <ProtectedRoute roles={['Admin']}><AuditLog /></ProtectedRoute>
        } />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HospitalProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </HospitalProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
