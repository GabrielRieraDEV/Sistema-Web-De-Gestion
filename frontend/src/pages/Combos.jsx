import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { ShoppingCart, Package } from 'lucide-react'

const Combos = () => {
  const [combos, setCombos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')

  useEffect(() => {
    fetchCombos()
  }, [filter])

  const fetchCombos = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'todos') params.append('tipo', filter)
      
      const response = await api.get(`/api/combos/?${params}`)
      setCombos(response.data.combos || [])
    } catch (error) {
      console.error('Error fetching combos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando combos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Combos Disponibles</h1>
          <p className="text-gray-500 dark:text-gray-400">Selecciona un combo para comprar</p>
        </div>
        
        <div className="flex space-x-2">
          {['todos', 'proteico', 'vegetariano', 'mixto'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFilter(tipo)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tipo
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {combos.length === 0 ? (
        <div className="card text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay combos disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combos.map((combo) => (
            <div key={combo.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{combo.nombre}</h3>
                  <span className={`badge ${
                    combo.tipo === 'proteico' ? 'badge-danger' :
                    combo.tipo === 'vegetariano' ? 'badge-success' :
                    'badge-info'
                  }`}>
                    {combo.tipo}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">
                    ${parseFloat(combo.precio_total).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                {combo.descripcion || 'Sin descripción'}
              </p>

              {combo.productos && combo.productos.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">CONTENIDO:</p>
                  <div className="flex flex-wrap gap-1">
                    {combo.productos.slice(0, 4).map((p, i) => (
                      <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded">
                        {p.cantidad}x {p.producto_nombre}
                      </span>
                    ))}
                    {combo.productos.length > 4 && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded">
                        +{combo.productos.length - 4} más
                      </span>
                    )}
                  </div>
                </div>
              )}

              <Link
                to={`/combos/${combo.id}`}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={18} />
                <span>Ver Detalle</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Combos
