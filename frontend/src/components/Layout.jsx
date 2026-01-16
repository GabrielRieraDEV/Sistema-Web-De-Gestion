import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Home, ShoppingBag, Package, Users, Truck, 
  FileText, CreditCard, MessageSquare, BarChart3,
  LogOut, Menu, X, ChevronDown
} from 'lucide-react'
import { useState } from 'react'

const Layout = () => {
  const { user, logout, isAdmin, isLogistica, isCobranza, isPublicidad } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(true)

  const isActive = (path) => location.pathname === path

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Inicio' },
    { path: '/combos', icon: ShoppingBag, label: 'Combos' },
    { path: '/mis-compras', icon: Package, label: 'Mis Compras' },
  ]

  const adminMenuItems = [
    { path: '/admin/usuarios', icon: Users, label: 'Usuarios', show: isAdmin() },
    { path: '/admin/proveedores', icon: Truck, label: 'Proveedores', show: isAdmin() },
    { path: '/admin/productos', icon: Package, label: 'Productos', show: isAdmin() },
    { path: '/admin/combos', icon: ShoppingBag, label: 'Gestión Combos', show: isAdmin() || isLogistica() },
    { path: '/admin/pedidos', icon: FileText, label: 'Pedidos', show: isAdmin() },
    { path: '/admin/pagos', icon: CreditCard, label: 'Pagos', show: isAdmin() || isCobranza() },
    { path: '/admin/comentarios', icon: MessageSquare, label: 'Comentarios', show: isAdmin() || isPublicidad() },
    { path: '/admin/reportes', icon: BarChart3, label: 'Reportes', show: isAdmin() },
  ].filter(item => item.show)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CE</span>
            </div>
            <span className="font-bold text-gray-900">CECOALIMENTOS</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path) 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}

          {adminMenuItems.length > 0 && (
            <>
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className="flex items-center justify-between w-full px-3 py-2 mt-4 text-gray-500 text-sm font-medium"
              >
                <span>ADMINISTRACIÓN</span>
                <ChevronDown size={16} className={`transform transition-transform ${adminOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {adminOpen && adminMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path) 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu size={24} />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.nombre} {user?.apellido}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.rol}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
