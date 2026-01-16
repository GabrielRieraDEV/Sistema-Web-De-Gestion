import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Combos from './pages/Combos'
import ComboDetail from './pages/ComboDetail'
import MisCompras from './pages/MisCompras'
import Usuarios from './pages/admin/Usuarios'
import Proveedores from './pages/admin/Proveedores'
import Productos from './pages/admin/Productos'
import GestionCombos from './pages/admin/GestionCombos'
import Pedidos from './pages/admin/Pedidos'
import Pagos from './pages/admin/Pagos'
import Comentarios from './pages/admin/Comentarios'
import Reportes from './pages/admin/Reportes'

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/dashboard" />
  }
  
  return children
}

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="combos" element={<Combos />} />
        <Route path="combos/:id" element={<ComboDetail />} />
        <Route path="mis-compras" element={<MisCompras />} />
        
        <Route path="admin/usuarios" element={
          <PrivateRoute roles={['admin']}><Usuarios /></PrivateRoute>
        } />
        <Route path="admin/proveedores" element={
          <PrivateRoute roles={['admin']}><Proveedores /></PrivateRoute>
        } />
        <Route path="admin/productos" element={
          <PrivateRoute roles={['admin']}><Productos /></PrivateRoute>
        } />
        <Route path="admin/combos" element={
          <PrivateRoute roles={['admin', 'logistica']}><GestionCombos /></PrivateRoute>
        } />
        <Route path="admin/pedidos" element={
          <PrivateRoute roles={['admin']}><Pedidos /></PrivateRoute>
        } />
        <Route path="admin/pagos" element={
          <PrivateRoute roles={['admin', 'cobranza']}><Pagos /></PrivateRoute>
        } />
        <Route path="admin/comentarios" element={
          <PrivateRoute roles={['admin', 'publicidad']}><Comentarios /></PrivateRoute>
        } />
        <Route path="admin/reportes" element={
          <PrivateRoute roles={['admin']}><Reportes /></PrivateRoute>
        } />
      </Route>
    </Routes>
  )
}

export default App
