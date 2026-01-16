import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { ShoppingBag, Package, Clock, CheckCircle } from 'lucide-react'

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState({ combos: 0, compras: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [combosRes, comprasRes] = await Promise.all([
          api.get('/api/combos/'),
          api.get('/api/pagos/mis-compras')
        ])
        setStats({
          combos: combosRes.data.combos?.length || 0,
          compras: comprasRes.data.compras || []
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const pendientes = stats.compras.filter(c => c.estado === 'pendiente_pago').length
  const verificando = stats.compras.filter(c => c.estado === 'pago_verificando').length
  const completadas = stats.compras.filter(c => c.estado === 'completada').length

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Hola, {user?.nombre}!
        </h1>
        <p className="text-gray-500">Bienvenido al sistema de gestión CECOALIMENTOS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <ShoppingBag className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Combos Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.combos}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pendientes de Pago</p>
              <p className="text-2xl font-bold text-gray-900">{pendientes}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">En Verificación</p>
              <p className="text-2xl font-bold text-gray-900">{verificando}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completadas</p>
              <p className="text-2xl font-bold text-gray-900">{completadas}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <Link
              to="/combos"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ShoppingBag size={20} className="text-primary-600" />
                <span className="font-medium">Ver Combos Disponibles</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
            <Link
              to="/mis-compras"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Package size={20} className="text-primary-600" />
                <span className="font-medium">Mis Compras</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>

        {stats.compras.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimas Compras</h2>
            <div className="space-y-3">
              {stats.compras.slice(0, 3).map((compra) => (
                <div key={compra.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Compra #{compra.id}</p>
                    <p className="text-sm text-gray-500">${compra.monto_total}</p>
                  </div>
                  <span className={`badge ${
                    compra.estado === 'completada' ? 'badge-success' :
                    compra.estado === 'pendiente_pago' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {compra.estado.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
