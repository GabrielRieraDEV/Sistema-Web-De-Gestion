import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Package, Plus, Edit, Trash2, X } from 'lucide-react'

const Productos = () => {
  const [productos, setProductos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filters, setFilters] = useState({ categoria: '', proveedor_id: '' })
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', precio_compra: '', precio_venta: '',
    unidad_medida: 'kg', categoria: '', proveedor_id: '', stock_inicial: 0
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.categoria) params.append('categoria', filters.categoria)
      if (filters.proveedor_id) params.append('proveedor_id', filters.proveedor_id)
      
      const [prodRes, provRes, catRes] = await Promise.all([
        api.get(`/api/productos/?${params}`),
        api.get('/api/proveedores/'),
        api.get('/api/productos/categorias')
      ])
      setProductos(prodRes.data.productos || [])
      setProveedores(provRes.data.proveedores || [])
      setCategorias(catRes.data.categorias || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        precio_compra: parseFloat(formData.precio_compra),
        precio_venta: parseFloat(formData.precio_venta),
        proveedor_id: parseInt(formData.proveedor_id),
        stock_inicial: parseInt(formData.stock_inicial)
      }
      if (editing) {
        await api.put(`/api/productos/${editing.id}`, data)
      } else {
        await api.post('/api/productos/', data)
      }
      setShowModal(false)
      resetForm()
      fetchData()
      setMessage({ type: 'success', text: editing ? 'Producto actualizado' : 'Producto creado' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error' })
    }
  }

  const handleEdit = (item) => {
    setEditing(item)
    setFormData({
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      precio_compra: item.precio_compra,
      precio_venta: item.precio_venta,
      unidad_medida: item.unidad_medida,
      categoria: item.categoria || '',
      proveedor_id: item.proveedor_id,
      stock_inicial: 0
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este producto?')) return
    try {
      await api.delete(`/api/productos/${id}`)
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar' })
    }
  }

  const resetForm = () => {
    setEditing(null)
    setFormData({
      nombre: '', descripcion: '', precio_compra: '', precio_venta: '',
      unidad_medida: 'kg', categoria: '', proveedor_id: '', stock_inicial: 0
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500">Gestión de productos e inventario</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="btn-primary flex items-center space-x-2">
          <Plus size={20} /><span>Nuevo Producto</span>
        </button>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap gap-4 mb-6">
          <select value={filters.categoria} onChange={(e) => setFilters({...filters, categoria: e.target.value})} className="input w-auto">
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={filters.proveedor_id} onChange={(e) => setFilters({...filters, proveedor_id: e.target.value})} className="input w-auto">
            <option value="">Todos los proveedores</option>
            {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>

        {loading ? <div className="text-center py-8">Cargando...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Producto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Categoría</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Proveedor</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">P. Compra</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">P. Venta</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Estado</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium">{item.nombre}</p>
                      <p className="text-sm text-gray-500">{item.unidad_medida}</p>
                    </td>
                    <td className="py-3 px-4"><span className="badge badge-info">{item.categoria}</span></td>
                    <td className="py-3 px-4">{item.proveedor_nombre}</td>
                    <td className="py-3 px-4 text-right">${parseFloat(item.precio_compra).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-medium">${parseFloat(item.precio_venta).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${item.activo ? 'badge-success' : 'badge-danger'}`}>
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleEdit(item)} className="p-2 text-gray-500 hover:text-primary-600"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
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
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="input" rows="2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Precio Compra *</label>
                  <input type="number" step="0.01" value={formData.precio_compra} onChange={(e) => setFormData({...formData, precio_compra: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio Venta *</label>
                  <input type="number" step="0.01" value={formData.precio_venta} onChange={(e) => setFormData({...formData, precio_venta: e.target.value})} className="input" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Unidad de Medida</label>
                  <select value={formData.unidad_medida} onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})} className="input">
                    <option value="kg">Kilogramo</option>
                    <option value="unidad">Unidad</option>
                    <option value="litro">Litro</option>
                    <option value="docena">Docena</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <input type="text" value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} className="input" placeholder="ej: Frutas" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Proveedor *</label>
                  <select value={formData.proveedor_id} onChange={(e) => setFormData({...formData, proveedor_id: e.target.value})} className="input" required>
                    <option value="">Seleccionar...</option>
                    {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                {!editing && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Stock Inicial</label>
                    <input type="number" value={formData.stock_inicial} onChange={(e) => setFormData({...formData, stock_inicial: e.target.value})} className="input" />
                  </div>
                )}
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

export default Productos
