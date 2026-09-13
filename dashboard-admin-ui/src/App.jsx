import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ProcessingCases from './pages/ProcessingCases'

export default function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<ProcessingCases />} />
      <Route path="/cases/processing" element={<ProcessingCases />} />
      <Route path="/overview" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
