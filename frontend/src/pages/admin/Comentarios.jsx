import { useState, useEffect } from 'react'
import api from '../../services/api'
import { MessageSquare, Check, X, Star } from 'lucide-react'

const Comentarios = () => {
  const [comentarios, setComentarios] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => { fetchData() }, [filter])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      if (filter) params.append('estado', filter)
      
      const [comentariosRes, statsRes] = await Promise.all([
        api.get(`/api/comentarios/admin?${params}`),
        api.get('/api/comentarios/estadisticas')
      ])
      setComentarios(comentariosRes.data.comentarios || [])
      setEstadisticas(statsRes.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModerar = async (id, accion) => {
    try {
      await api.post(`/api/comentarios/${id}/moderar`, { accion })
      fetchData()
      setMessage({ type: 'success', text: `Comentario ${accion === 'aprobar' ? 'aprobado' : 'rechazado'}` })
    } catch (error) {
      setMessage({ type: 'error', text: 'Error' })
    }
  }

  const getStatusBadge = (estado) => {
    const classes = {
      'pendiente': 'badge-warning',
      'aprobado': 'badge-success',
      'rechazado': 'badge-danger'
    }
    return classes[estado] || 'badge-info'
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}
      />
    ))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Moderación de Comentarios</h1>
        <p className="text-gray-500 dark:text-gray-400">Aprobar o rechazar comentarios de usuarios</p>
      </div>

      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticas.total}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-green-600">{estadisticas.aprobados}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Aprobados</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-primary-600">
              {estadisticas.promedio_calificacion?.toFixed(1) || '-'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Promedio</p>
          </div>
        </div>
      )}

      {message.text && (
        <div className={`px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="flex gap-2 mb-6">
          {['', 'pendiente', 'aprobado', 'rechazado'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFilter(estado)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === estado ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {estado === '' ? 'Todos' : estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <div className="text-center py-8">Cargando...</div> : comentarios.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No hay comentarios</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comentarios.map((comentario) => (
              <div key={comentario.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{comentario.usuario_nombre}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      {comentario.calificacion && (
                        <div className="flex">{renderStars(comentario.calificacion)}</div>
                      )}
                      <span>•</span>
                      <span className="capitalize">{comentario.categoria}</span>
                      <span>•</span>
                      <span>{new Date(comentario.fecha_creacion).toLocaleDateString('es-VE')}</span>
                    </div>
                  </div>
                  <span className={`badge ${getStatusBadge(comentario.estado)}`}>
                    {comentario.estado}
                  </span>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4">{comentario.contenido}</p>
                
                {comentario.estado === 'pendiente' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleModerar(comentario.id, 'aprobar')}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900"
                    >
                      <Check size={16} />
                      <span>Aprobar</span>
                    </button>
                    <button
                      onClick={() => handleModerar(comentario.id, 'rechazar')}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900"
                    >
                      <X size={16} />
                      <span>Rechazar</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Comentarios
