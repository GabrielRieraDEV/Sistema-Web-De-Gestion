import { useState, useEffect } from 'react'
import api from '../../services/api'
import { ShoppingBag, Plus, Edit, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react'

const GestionCombos = () => {
  const [combos, setCombos] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', precio_total: '', tipo: 'mixto', productos: []
  })
  const [selectedProduct, setSelectedProduct] = useState({ producto_id: '', cantidad: 1 })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [combosRes, prodRes] = await Promise.all([
        api.get('/api/combos/?disponibles=false'),
        api.get('/api/productos/')
      ])
      setCombos(combosRes.data.combos || [])
      setProductos(prodRes.data.productos || [])
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
        precio_total: parseFloat(formData.precio_total),
        productos: formData.productos.map(p => ({
          producto_id: parseInt(p.producto_id),
          cantidad: parseInt(p.cantidad)
        }))
      }
      if (editing) {
        await api.put(`/api/combos/${editing.id}`, data)
      } else {
        await api.post('/api/combos/', data)
      }
      setShowModal(false)
      resetForm()
      fetchData()
      setMessage({ type: 'success', text: editing ? 'Combo actualizado' : 'Combo creado' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error' })
    }
  }

  const handleEdit = (item) => {
    setEditing(item)
    setFormData({
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      precio_total: item.precio_total,
      tipo: item.tipo,
      productos: item.productos?.map(p => ({
        producto_id: p.producto_id,
        producto_nombre: p.producto_nombre,
        cantidad: p.cantidad
      })) || []
    })
    setShowModal(true)
  }

  const handleToggle = async (id) => {
    try {
      await api.post(`/api/combos/${id}/toggle-disponibilidad`)
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error' })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este combo?')) return
    try {
      await api.delete(`/api/combos/${id}`)
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error' })
    }
  }

  const addProduct = () => {
    if (!selectedProduct.producto_id) return
    const prod = productos.find(p => p.id === parseInt(selectedProduct.producto_id))
    if (!prod) return
    
    const exists = formData.productos.find(p => p.producto_id === parseInt(selectedProduct.producto_id))
    if (exists) {
      setMessage({ type: 'error', text: 'Producto ya agregado' })
      return
    }
    
    setFormData({
      ...formData,
      productos: [...formData.productos, {
        producto_id: parseInt(selectedProduct.producto_id),
        producto_nombre: prod.nombre,
        cantidad: parseInt(selectedProduct.cantidad)
      }]
    })
    setSelectedProduct({ producto_id: '', cantidad: 1 })
  }

  const removeProduct = (prodId) => {
    setFormData({
      ...formData,
      productos: formData.productos.filter(p => p.producto_id !== prodId)
    })
  }

  const resetForm = () => {
    setEditing(null)
    setFormData({ nombre: '', descripcion: '', precio_total: '', tipo: 'mixto', productos: [] })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Combos</h1>
          <p className="text-gray-500 dark:text-gray-400">Crear y administrar combos de productos</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="btn-primary flex items-center space-x-2">
          <Plus size={20} /><span>Nuevo Combo</span>
        </button>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combos.map((combo) => (
          <div key={combo.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{combo.nombre}</h3>
                <span className={`badge ${combo.tipo === 'proteico' ? 'badge-danger' : combo.tipo === 'vegetariano' ? 'badge-success' : 'badge-info'}`}>
                  {combo.tipo}
                </span>
              </div>
              <p className="text-xl font-bold text-primary-600">${parseFloat(combo.precio_total).toFixed(2)}</p>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{combo.descripcion || 'Sin descripción'}</p>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleToggle(combo.id)}
                className={`flex items-center space-x-1 text-sm ${combo.disponible ? 'text-green-600' : 'text-gray-400'}`}
              >
                {combo.disponible ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                <span>{combo.disponible ? 'Disponible' : 'No disponible'}</span>
              </button>
              <div>
                <button onClick={() => handleEdit(combo)} className="p-2 text-gray-500 hover:text-primary-600"><Edit size={18} /></button>
                <button onClick={() => handleDelete(combo.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editing ? 'Editar Combo' : 'Nuevo Combo'}</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre *</label>
                  <input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo *</label>
                  <select value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})} className="input">
                    <option value="mixto">Mixto</option>
                    <option value="proteico">Proteico</option>
                    <option value="vegetariano">Vegetariano</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="input" rows="2" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Precio Total *</label>
                <input type="number" step="0.01" value={formData.precio_total} onChange={(e) => setFormData({...formData, precio_total: e.target.value})} className="input" required />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-2">Productos del Combo</label>
                <div className="flex gap-2 mb-3">
                  <select value={selectedProduct.producto_id} onChange={(e) => setSelectedProduct({...selectedProduct, producto_id: e.target.value})} className="input flex-1">
                    <option value="">Seleccionar producto...</option>
                    {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                  <input type="number" min="1" value={selectedProduct.cantidad} onChange={(e) => setSelectedProduct({...selectedProduct, cantidad: e.target.value})} className="input w-24" placeholder="Cant" />
                  <button type="button" onClick={addProduct} className="btn-secondary">Agregar</button>
                </div>
                
                {formData.productos.length > 0 && (
                  <div className="space-y-2">
                    {formData.productos.map((p) => (
                      <div key={p.producto_id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <span>{p.producto_nombre} x{p.cantidad}</span>
                        <button type="button" onClick={() => removeProduct(p.producto_id)} className="text-red-500"><X size={16} /></button>
                      </div>
                    ))}
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

export default GestionCombos
