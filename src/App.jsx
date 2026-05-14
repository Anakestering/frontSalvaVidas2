import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Postos } from './pages/Postos'
import { PostoUsuario } from './pages/PostoUsuario'
import { PostoAdmin } from './pages/PostoAdmin'
import { AdminRegistros } from './pages/AdminRegistros'
import { AdminCheckins } from './pages/AdminCheckins'       // 👈 novo
import { AdminCheckouts } from './pages/AdminCheckouts'     // 👈 novo
import { AdminRelatorios } from './pages/AdminRelatorios'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/" replace />
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('token')
  const tipo = localStorage.getItem('tipo')
  if (!token) return <Navigate to="/" replace />
  if (tipo !== 'admin') return <Navigate to="/postos" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/postos" element={<PrivateRoute><Postos /></PrivateRoute>} />
      <Route path="/posto/:id" element={<PrivateRoute><PostoUsuario /></PrivateRoute>} />
      <Route path="/admin/posto/:id" element={<AdminRoute><PostoAdmin /></AdminRoute>} />
      <Route path="/admin/registros" element={<AdminRoute><AdminRegistros /></AdminRoute>} />
      <Route path="/admin/checkins" element={<AdminRoute><AdminCheckins /></AdminRoute>} />    {/* 👈 novo */}
      <Route path="/admin/checkouts" element={<AdminRoute><AdminCheckouts /></AdminRoute>} />  {/* 👈 novo */}
      <Route path="/admin/relatorios" element={<AdminRoute><AdminRelatorios /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}