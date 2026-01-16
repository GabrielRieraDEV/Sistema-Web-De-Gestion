import { useState, useEffect } from 'react'
import api from '../../services/api'
import { BarChart3, TrendingUp, Package, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const Reportes = () => {
  const [activeTab, setActiveTab] = useState('semanal')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchReport()
  }, [activeTab])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/api/reportes/${activeTab}`)
      setData(response.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'semanal', label: 'Semanal', icon: Calendar },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp },
  ]

  const renderSemanal = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Recaudado</p>
          <p className="text-3xl font-bold text-primary-600">${data?.recaudacion?.total?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Compras Completadas</p>
          <p className="text-3xl font-bold text-gray-900">{data?.recaudacion?.cantidad || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Productos Bajo Stock</p>
          <p className="text-3xl font-bold text-red-600">{data?.inventario?.productos_bajo_stock || 0}</p>
        </div>
      </div>

      {data?.ventas_por_combo && data.ventas_por_combo.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">Ventas por Combo</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ventas_por_combo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="combo" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )

  const renderInventario = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Productos</p>
          <p className="text-2xl font-bold">{data?.resumen?.total_productos || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Bajo Stock</p>
          <p className="text-2xl font-bold text-yellow-600">{data?.resumen?.bajo_stock || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Sin Stock</p>
          <p className="text-2xl font-bold text-red-600">{data?.resumen?.sin_stock || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Valor Total</p>
          <p className="text-2xl font-bold text-primary-600">${data?.resumen?.valor_total?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      {data?.productos && (
        <div className="card overflow-x-auto">
          <h3 className="font-semibold mb-4">Detalle de Inventario</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-medium text-gray-500">Producto</th>
                <th className="text-right py-2 px-4 font-medium text-gray-500">Cantidad</th>
                <th className="text-right py-2 px-4 font-medium text-gray-500">Mínimo</th>
                <th className="text-left py-2 px-4 font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.productos.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2 px-4">{item.producto_nombre}</td>
                  <td className="py-2 px-4 text-right">{item.cantidad}</td>
                  <td className="py-2 px-4 text-right">{item.cantidad_minima}</td>
                  <td className="py-2 px-4">
                    <span className={`badge ${
                      item.cantidad === 0 ? 'badge-danger' :
                      item.cantidad < item.cantidad_minima ? 'badge-warning' :
                      'badge-success'
                    }`}>
                      {item.cantidad === 0 ? 'Sin stock' : item.cantidad < item.cantidad_minima ? 'Bajo' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const renderVentas = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Ventas</p>
          <p className="text-3xl font-bold">{data?.totales?.cantidad || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Monto Total</p>
          <p className="text-3xl font-bold text-primary-600">${data?.totales?.monto?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      {data?.ventas_diarias && data.ventas_diarias.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">Ventas Diarias</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.ventas_diarias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="monto" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-500">Análisis y estadísticas del sistema</p>
      </div>

      <div className="flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card text-center py-12">Cargando reporte...</div>
      ) : (
        <>
          {activeTab === 'semanal' && renderSemanal()}
          {activeTab === 'inventario' && renderInventario()}
          {activeTab === 'ventas' && renderVentas()}
        </>
      )}
    </div>
  )
}

export default Reportes
