import { Navigate, Route, Routes } from 'react-router-dom'
import Assignment from './pages/Assignment'
import AssignmentTracking from './pages/AssignmentTracking'
import AssignedWork from './pages/AssignedWork'
import Dashboard from './pages/Dashboard'
import DataImport from './pages/DataImport'
import ProcessingCases from './pages/ProcessingCases'
import Reports from './pages/Reports'
import Users from './pages/Users'

export default function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/cases/processing" element={<ProcessingCases />} />

      <Route path="/assignments" element={<Assignment />} />
      <Route path="/assigned-work" element={<AssignedWork />} />
      <Route path="/assignment-tracking" element={<AssignmentTracking />} />

      <Route path="/data-import" element={<DataImport />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/users" element={<Users />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}