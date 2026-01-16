import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FileText, Plus, Eye, X } from 'lucide-react'

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  const [formData, setFormData] = useState({
    proveedor_id: '', notas: '', detalles: []
  })
  const [selectedProduct, setSelectedProduct] = useState({ producto_id: '', cantidad: 1 })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [pedRes, provRes, prodRes] = await Promise.all([
        api.get('/api/pedidos/'),
        api.get('/api/proveedores/'),
        api.get('/api/productos/')
      ])
      setPedidos(pedRes.data.pedidos || [])
      setProveedores(provRes.data.proveedores || [])
      setProductos(prodRes.data.productos || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.detalles.length === 0) {
      setMessage({ type: 'error', text: 'Agregue al menos un producto' })
      return
    }
    try {
      await api.post('/api/pedidos/', {
        proveedor_id: parseInt(formData.proveedor_id),
        notas: formData.notas,
        detalles: formData.detalles.map(d => ({
          producto_id: d.producto_id,
          cantidad: d.cantidad
        }))
      })
      setShowModal(false)
      resetForm()
      fetchData()
      setMessage({ type: 'success', text: 'Pedido creado' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error' })
    }
  }

  const handleStatusChange = async (id, estado) => {
    try {
      await api.put(`/api/pedidos/${id}/estado`, { estado })
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error' })
    }
  }

  const addProduct = () => {
    if (!selectedProduct.producto_id) return
    const prod = productos.find(p => p.id === parseInt(selectedProduct.producto_id))
    if (!prod) return
    
    setFormData({
      ...formData,
      detalles: [...formData.detalles, {
        producto_id: parseInt(selectedProduct.producto_id),
        producto_nombre: prod.nombre,
        cantidad: parseInt(selectedProduct.cantidad),
        precio_unitario: prod.precio_compra
      }]
    })
    setSelectedProduct({ producto_id: '', cantidad: 1 })
  }

  const removeProduct = (index) => {
    setFormData({
      ...formData,
      detalles: formData.detalles.filter((_, i) => i !== index)
    })
  }

  const resetForm = () => {
    setFormData({ proveedor_id: '', notas: '', detalles: [] })
  }

  const getStatusBadge = (estado) => {
    const classes = {
      'pendiente': 'badge-warning',
      'enviado': 'badge-info',
      'recibido': 'badge-success',
      'cancelado': 'badge-danger'
    }
    return classes[estado] || 'badge-info'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos a Proveedores</h1>
          <p className="text-gray-500">Gestión de órdenes de compra</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="btn-primary flex items-center space-x-2">
          <Plus size={20} /><span>Nuevo Pedido</span>
        </button>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        {loading ? <div className="text-center py-8">Cargando...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Proveedor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Fecha</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Estado</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">#{pedido.id}</td>
                    <td className="py-3 px-4">{pedido.proveedor_nombre}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(pedido.fecha_pedido).toLocaleDateString('es-VE')}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">${parseFloat(pedido.total || 0).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <select
                        value={pedido.estado}
                        onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusBadge(pedido.estado)}`}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="enviado">Enviado</option>
                        <option value="recibido">Recibido</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => setShowDetail(pedido)} className="p-2 text-gray-500 hover:text-primary-600">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Nuevo Pedido</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Proveedor *</label>
                <select value={formData.proveedor_id} onChange={(e) => setFormData({...formData, proveedor_id: e.target.value})} className="input" required>
                  <option value="">Seleccionar...</option>
                  {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notas</label>
                <textarea value={formData.notas} onChange={(e) => setFormData({...formData, notas: e.target.value})} className="input" rows="2" />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-2">Productos</label>
                <div className="flex gap-2 mb-3">
                  <select value={selectedProduct.producto_id} onChange={(e) => setSelectedProduct({...selectedProduct, producto_id: e.target.value})} className="input flex-1">
                    <option value="">Seleccionar producto...</option>
                    {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre} - ${p.precio_compra}</option>)}
                  </select>
                  <input type="number" min="1" value={selectedProduct.cantidad} onChange={(e) => setSelectedProduct({...selectedProduct, cantidad: e.target.value})} className="input w-24" />
                  <button type="button" onClick={addProduct} className="btn-secondary">Agregar</button>
                </div>
                
                {formData.detalles.length > 0 && (
                  <div className="space-y-2">
                    {formData.detalles.map((d, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{d.producto_nombre} x{d.cantidad}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">${(d.cantidad * d.precio_unitario).toFixed(2)}</span>
                          <button type="button" onClick={() => removeProduct(i)} className="text-red-500"><X size={16} /></button>
                        </div>
                      </div>
                    ))}
                    <div className="text-right font-bold">
                      Total: ${formData.detalles.reduce((sum, d) => sum + (d.cantidad * d.precio_unitario), 0).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Crear Pedido</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Pedido #{showDetail.id}</h2>
              <button onClick={() => setShowDetail(null)}><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-500">Proveedor:</span><p className="font-medium">{showDetail.proveedor_nombre}</p></div>
                <div><span className="text-gray-500">Estado:</span><p><span className={`badge ${getStatusBadge(showDetail.estado)}`}>{showDetail.estado}</span></p></div>
                <div><span className="text-gray-500">Fecha:</span><p>{new Date(showDetail.fecha_pedido).toLocaleDateString('es-VE')}</p></div>
                <div><span className="text-gray-500">Total:</span><p className="font-bold">${parseFloat(showDetail.total || 0).toFixed(2)}</p></div>
              </div>

              {showDetail.detalles && (
                <div className="border-t pt-4">
                  <p className="font-medium mb-2">Productos:</p>
                  <div className="space-y-2">
                    {showDetail.detalles.map((d, i) => (
                      <div key={i} className="flex justify-between bg-gray-50 p-2 rounded text-sm">
                        <span>{d.producto_nombre} x{d.cantidad}</span>
                        <span>${parseFloat(d.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pedidos
