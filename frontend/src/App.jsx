import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider }    from './context/AuthContext'
import Landing             from './pages/Landing'
import Login               from './pages/Login'
import Register            from './pages/Register'
import Dashboard           from './pages/Dashboard'
import Explore             from './pages/Explore'
import Profile             from './pages/Profile'
import Connections         from './pages/Connections'
import Workspace           from './pages/Workspace'
import ProtectedRoute      from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                       element={<Landing />} />
          <Route path="/login"                  element={<Login />} />
          <Route path="/register"               element={<Register />} />
          <Route path="/dashboard"              element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/explore"                element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/profile"                element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/connections"            element={<ProtectedRoute><Connections /></ProtectedRoute>} />
          <Route path="/workspace/:connectionId" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
          <Route path="*"                       element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
