import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { loadCurrentUser } from './features/auth/authSlice'
import Assignment from './pages/Assignment'
import AssignmentTracking from './pages/AssignmentTracking'
import AssignedWork from './pages/AssignedWork'
import Dashboard from './pages/Dashboard'
import DataImport from './pages/DataImport'
import ProcessingCases from './pages/ProcessingCases'
import Reports from './pages/Reports'
import Users from './pages/Users'
import Login from './pages/Login'

const allRoles = ['ADMIN', 'SUPERVISOR', 'OFFICER', 'VIEWER']
const managers = ['ADMIN', 'SUPERVISOR']

export default function App() {
  const dispatch = useDispatch()
  const { accessToken, initialized } = useSelector((state) => state.auth)

  useEffect(() => {
    if (accessToken && !initialized) dispatch(loadCurrentUser())
  }, [accessToken, dispatch, initialized])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute allowedRoles={allRoles} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'OFFICER']} />}>
        <Route path="/cases/processing" element={<ProcessingCases />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={managers} />}>
        <Route path="/assignments" element={<Assignment />} />
        <Route path="/assignment-tracking" element={<AssignmentTracking />} />
        <Route path="/data-import" element={<DataImport />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['OFFICER']} />}>
        <Route path="/assigned-work" element={<AssignedWork />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/users" element={<Users />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
