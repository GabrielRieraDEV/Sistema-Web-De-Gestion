import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Truck, Plus, Edit, Power, Trash2, X } from 'lucide-react'

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showInactivos, setShowInactivos] = useState(true)
  const [formData, setFormData] = useState({
    nombre: '', rif: '', direccion: '', telefono: '', email: '',
    persona_contacto: '', tiempo_entrega_dias: 7
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => { fetchProveedores() }, [showInactivos])

  const fetchProveedores = async () => {
    try {
      const params = new URLSearchParams()
      if (!showInactivos) params.append('activo', 'true')
      const response = await api.get(`/api/proveedores/?${params}`)
      setProveedores(response.data.proveedores || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/api/proveedores/${editing.id}`, formData)
      } else {
        await api.post('/api/proveedores/', formData)
      }
      setShowModal(false)
      resetForm()
      fetchProveedores()
      setMessage({ type: 'success', text: editing ? 'Proveedor actualizado' : 'Proveedor creado' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error' })
    }
  }

  const handleEdit = (item) => {
    setEditing(item)
    setFormData({ ...item })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este proveedor?')) return
    try {
      await api.delete(`/api/proveedores/${id}`)
      fetchProveedores()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar' })
    }
  }

  const handleToggleActivo = async (item) => {
    try {
      if (item.activo) {
        if (!confirm('¿Desactivar este proveedor?')) return
        await api.put(`/api/proveedores/${item.id}`, { activo: false })
      } else {
        if (!confirm('¿Activar este proveedor?')) return
        await api.put(`/api/proveedores/${item.id}`, { activo: true })
      }
      fetchProveedores()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error' })
    }
  }

  const handleEliminar = async (item) => {
    if (!confirm(`¿ELIMINAR PERMANENTEMENTE al proveedor "${item.nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/api/proveedores/${item.id}/eliminar`)
      fetchProveedores()
      setMessage({ type: 'success', text: 'Proveedor eliminado permanentemente' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error al eliminar' })
    }
  }

  const resetForm = () => {
    setEditing(null)
    setFormData({ nombre: '', rif: '', direccion: '', telefono: '', email: '', persona_contacto: '', tiempo_entrega_dias: 7 })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proveedores</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestión de proveedores</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="btn-primary flex items-center space-x-2">
          <Plus size={20} /><span>Nuevo Proveedor</span>
        </button>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={showInactivos}
              onChange={(e) => setShowInactivos(e.target.checked)}
            />
            <span>Mostrar inactivos</span>
          </label>
        </div>
        {loading ? <div className="text-center py-8">Cargando...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">RIF</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Contacto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Entrega</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Estado</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4">
                      <p className="font-medium">{item.nombre}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.email}</p>
                    </td>
                    <td className="py-3 px-4">{item.rif}</td>
                    <td className="py-3 px-4">
                      <p>{item.persona_contacto}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.telefono}</p>
                    </td>
                    <td className="py-3 px-4">{item.tiempo_entrega_dias} días</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${item.activo ? 'badge-success' : 'badge-danger'}`}>
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleEdit(item)} className="p-2 text-gray-500 hover:text-primary-600" title="Editar"><Edit size={18} /></button>
                      <button
                        onClick={() => handleToggleActivo(item)}
                        className={`p-2 ${item.activo ? 'text-yellow-500 hover:text-yellow-600' : 'text-green-500 hover:text-green-600'}`}
                        title={item.activo ? 'Desactivar' : 'Activar'}
                      >
                        <Power size={18} />
                      </button>
                      <button
                        onClick={() => handleEliminar(item)}
                        className="p-2 text-gray-500 hover:text-red-600"
                        title="Eliminar permanentemente"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="input" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">RIF *</label>
                  <input type="text" value={formData.rif} onChange={(e) => setFormData({...formData, rif: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono</label>
                  <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Persona de Contacto</label>
                  <input type="text" value={formData.persona_contacto} onChange={(e) => setFormData({...formData, persona_contacto: e.target.value})} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input type="text" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tiempo de Entrega (días)</label>
                <input type="number" value={formData.tiempo_entrega_dias} onChange={(e) => setFormData({...formData, tiempo_entrega_dias: parseInt(e.target.value)})} className="input" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Guardar</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Proveedores
