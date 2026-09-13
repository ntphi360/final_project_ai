import { Navigate, Route, Routes } from 'react-router-dom'
import Assignment from './pages/Assignment'
import AssignmentTracking from './pages/AssignmentTracking'
import AssignedWork from './pages/AssignedWork'
import Dashboard from './pages/Dashboard'
import DataImport from './pages/DataImport'
import ProcessingCases from './pages/ProcessingCases'

export default function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<ProcessingCases />} />
      <Route path="/cases/processing" element={<ProcessingCases />} />
      <Route path="/assignments" element={<Assignment />} />
      <Route path="/assigned-work" element={<AssignedWork />} />
      <Route path="/assignment-tracking" element={<AssignmentTracking />} />
      <Route path="/data-import" element={<DataImport />} />
      <Route path="/overview" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
