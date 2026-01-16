import { useState, useEffect } from 'react'
import api from '../services/api'
import { Star, Send } from 'lucide-react'

const categorias = [
  { value: 'general', label: 'General' },
  { value: 'servicio', label: 'Servicio' },
  { value: 'productos', label: 'Productos' },
  { value: 'atencion', label: 'Atención' }
]

const ratingValues = [1, 2, 3, 4, 5]

const ComentariosCliente = () => {
  const [publicComments, setPublicComments] = useState([])
  const [myComments, setMyComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    contenido: '',
    calificacion: 5,
    categoria: 'general'
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter) params.append('categoria', filter)
      
      const [publicRes, myRes] = await Promise.all([
        api.get(`/api/comentarios/?${params}`),
        api.get('/api/comentarios/mis-comentarios')
      ])
      setPublicComments(publicRes.data.comentarios || [])
      setMyComments(myRes.data.comentarios || [])
    } catch (error) {
      console.error('Error al cargar comentarios', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    try {
      await api.post('/api/comentarios/', formData)
      setMessage({ type: 'success', text: 'Comentario enviado. Será publicado cuando sea aprobado.' })
      setFormData({ ...formData, contenido: '' })
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'No se pudo enviar el comentario' })
    }
  }

  const renderStars = (value) => (
    <div className="flex space-x-1">
      {ratingValues.map((rating) => (
        <Star
          key={rating}
          size={18}
          className={`cursor-pointer ${rating <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          onClick={() => setFormData({ ...formData, calificacion: rating })}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="card lg:w-1/2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Déjanos tu comentario</h2>
          <p className="text-sm text-gray-500 mb-6">Comparte tu experiencia para ayudarnos a mejorar.</p>

          {message.text && (
            <div className={`px-4 py-3 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="input"
              >
                {categorias.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calificación</label>
              {renderStars(formData.calificacion)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
              <textarea
                value={formData.contenido}
                onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                className="input"
                rows="4"
                placeholder="Cuéntanos tu experiencia..."
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center space-x-2">
              <Send size={18} />
              <span>Enviar comentario</span>
            </button>
          </form>
        </div>

        <div className="card flex-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mis comentarios</h2>
          <p className="text-sm text-gray-500 mb-4">Puedes ver el estado de aprobación de tus comentarios enviados.</p>

          {myComments.length === 0 ? (
            <p className="text-gray-500">Aún no has enviado comentarios.</p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
              {myComments.map((comentario) => (
                <div key={comentario.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500 capitalize">{comentario.categoria}</span>
                    <span className={`badge ${
                      comentario.estado === 'aprobado' ? 'badge-success' :
                      comentario.estado === 'rechazado' ? 'badge-danger' :
                      'badge-warning'
                    }`}>
                      {comentario.estado}
                    </span>
                  </div>
                  {comentario.calificacion && (
                    <div className="flex mb-2">
                      {ratingValues.map((rating) => (
                        <Star
                          key={rating}
                          size={14}
                          className={rating <= comentario.calificacion ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-700">{comentario.contenido}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(comentario.fecha_creacion).toLocaleDateString('es-VE')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Testimonios aprobados</h2>
            <p className="text-sm text-gray-500">Conoce lo que dicen otros beneficiarios.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Todos
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                  filter === cat.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Cargando comentarios...</div>
        ) : publicComments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No hay comentarios en esta categoría.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicComments.map((comentario) => (
              <div key={comentario.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{comentario.usuario_nombre || 'Usuario'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(comentario.fecha_creacion).toLocaleDateString('es-VE')}
                    </p>
                  </div>
                  <span className="text-xs font-medium uppercase text-gray-400">{comentario.categoria}</span>
                </div>
                {comentario.calificacion && (
                  <div className="flex mb-3">
                    {ratingValues.map((rating) => (
                      <Star
                        key={rating}
                        size={14}
                        className={rating <= comentario.calificacion ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                )}
                <p className="text-gray-600 text-sm">{comentario.contenido}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ComentariosCliente
