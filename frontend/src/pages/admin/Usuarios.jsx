import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Users, Plus, Edit, Trash2, Power, X } from 'lucide-react'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [filters, setFilters] = useState({ rol: '', tipo_usuario: '' })
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', cedula: '', email: '', telefono: '',
    direccion: '', tipo_usuario: 'regular', rol: 'cliente', username: '', password: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchUsuarios()
  }, [filters])

  const fetchUsuarios = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.rol) params.append('rol', filters.rol)
      if (filters.tipo_usuario) params.append('tipo_usuario', filters.tipo_usuario)
      
      const response = await api.get(`/api/usuarios/?${params}`)
      setUsuarios(response.data.usuarios || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    try {
      if (editingUser) {
        await api.put(`/api/usuarios/${editingUser.id}`, formData)
        setMessage({ type: 'success', text: 'Usuario actualizado' })
      } else {
        await api.post('/api/usuarios/', formData)
        setMessage({ type: 'success', text: 'Usuario creado' })
      }
      setShowModal(false)
      resetForm()
      fetchUsuarios()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error' })
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({ ...user, password: '' })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este usuario?')) return
    try {
      await api.delete(`/api/usuarios/${id}`)
      fetchUsuarios()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error' })
    }
  }

  const handleToggleActivo = async (user) => {
    try {
      if (user.activo) {
        if (!confirm('¿Desactivar este usuario?')) return
        await api.delete(`/api/usuarios/${user.id}`)
      } else {
        if (!confirm('¿Activar este usuario?')) return
        await api.post(`/api/usuarios/${user.id}/activate`)
      }
      fetchUsuarios()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error' })
    }
  }

  const handleEliminar = async (user) => {
    if (!confirm(`¿ELIMINAR PERMANENTEMENTE al usuario ${user.nombre} ${user.apellido}? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/api/usuarios/${user.id}/eliminar`)
      fetchUsuarios()
      setMessage({ type: 'success', text: 'Usuario eliminado permanentemente' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error al eliminar' })
    }
  }

  const resetForm = () => {
    setEditingUser(null)
    setFormData({
      nombre: '', apellido: '', cedula: '', email: '', telefono: '',
      direccion: '', tipo_usuario: 'regular', rol: 'cliente', username: '', password: ''
    })
  }

  const openNewModal = () => {
    resetForm()
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
          <p className="text-gray-500 dark:text-gray-400">Administrar usuarios del sistema</p>
        </div>
        <button onClick={openNewModal} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filters.rol}
            onChange={(e) => setFilters({...filters, rol: e.target.value})}
            className="input w-auto"
          >
            <option value="">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="logistica">Logística</option>
            <option value="cobranza">Cobranza</option>
            <option value="publicidad">Publicidad</option>
            <option value="cliente">Cliente</option>
          </select>
          <select
            value={filters.tipo_usuario}
            onChange={(e) => setFilters({...filters, tipo_usuario: e.target.value})}
            className="input w-auto"
          >
            <option value="">Todos los tipos</option>
            <option value="regular">Regular</option>
            <option value="adulto_mayor">Adulto Mayor</option>
            <option value="discapacitado">Discapacitado</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Rol</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Estado</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{user.nombre} {user.apellido}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className="badge badge-info capitalize">{user.rol}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{user.tipo_usuario?.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${user.activo ? 'badge-success' : 'badge-danger'}`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleEdit(user)} className="p-2 text-gray-500 hover:text-primary-600" title="Editar">
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleActivo(user)}
                        className={`p-2 ${user.activo ? 'text-yellow-500 hover:text-yellow-600' : 'text-green-500 hover:text-green-600'}`}
                        title={user.activo ? 'Desactivar' : 'Activar'}
                      >
                        <Power size={18} />
                      </button>
                      <button
                        onClick={() => handleEliminar(user)}
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
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre *</label>
                  <input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apellido *</label>
                  <input type="text" value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} className="input" required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cédula *</label>
                  <input type="text" value={formData.cedula} onChange={(e) => setFormData({...formData, cedula: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <select value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})} className="input">
                    <option value="cliente">Cliente</option>
                    <option value="admin">Admin</option>
                    <option value="logistica">Logística</option>
                    <option value="cobranza">Cobranza</option>
                    <option value="publicidad">Publicidad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo Usuario</label>
                  <select value={formData.tipo_usuario} onChange={(e) => setFormData({...formData, tipo_usuario: e.target.value})} className="input">
                    <option value="regular">Regular</option>
                    <option value="adulto_mayor">Adulto Mayor</option>
                    <option value="discapacitado">Discapacitado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username *</label>
                  <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password {editingUser ? '' : '*'}</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input" required={!editingUser} />
                </div>
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

export default Usuarios
