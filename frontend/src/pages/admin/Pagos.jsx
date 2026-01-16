import { useState, useEffect } from 'react'
import api from '../../services/api'
import { CreditCard, Check, X, Eye } from 'lucide-react'

const Pagos = () => {
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPago, setSelectedPago] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => { fetchPagos() }, [])

  const fetchPagos = async () => {
    try {
      const response = await api.get('/api/pagos/pendientes')
      setPagos(response.data.pagos || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id, accion) => {
    try {
      await api.post(`/api/pagos/${id}/verificar`, { accion })
      fetchPagos()
      setSelectedPago(null)
      setMessage({ type: 'success', text: `Pago ${accion === 'aprobar' ? 'aprobado' : 'rechazado'}` })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error' })
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verificación de Pagos</h1>
        <p className="text-gray-500">Aprobar o rechazar pagos pendientes</p>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        {loading ? <div className="text-center py-8">Cargando...</div> : pagos.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No hay pagos pendientes de verificación</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Compra</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Método</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Referencia</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Monto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Fecha</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">#{pago.id}</td>
                    <td className="py-3 px-4">Compra #{pago.compra_id}</td>
                    <td className="py-3 px-4">
                      <span className="badge badge-info capitalize">{pago.metodo_pago?.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">{pago.numero_referencia}</td>
                    <td className="py-3 px-4 text-right font-bold">${parseFloat(pago.monto).toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(pago.fecha_pago).toLocaleDateString('es-VE')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => setSelectedPago(pago)} className="p-2 text-gray-500 hover:text-primary-600">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleVerify(pago.id, 'aprobar')} className="p-2 text-gray-500 hover:text-green-600">
                        <Check size={18} />
                      </button>
                      <button onClick={() => handleVerify(pago.id, 'rechazar')} className="p-2 text-gray-500 hover:text-red-600">
                        <X size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPago && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Detalles del Pago #{selectedPago.id}</h2>
              <button onClick={() => setSelectedPago(null)}><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Compra:</span>
                  <p className="font-medium">#{selectedPago.compra_id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Monto:</span>
                  <p className="font-bold text-lg">${parseFloat(selectedPago.monto).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Método:</span>
                  <p className="capitalize">{selectedPago.metodo_pago?.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Referencia:</span>
                  <p className="font-mono">{selectedPago.numero_referencia}</p>
                </div>
                <div>
                  <span className="text-gray-500">Banco Origen:</span>
                  <p>{selectedPago.banco_origen || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Teléfono:</span>
                  <p>{selectedPago.telefono_pago || '-'}</p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={() => handleVerify(selectedPago.id, 'aprobar')}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Check size={18} />
                  <span>Aprobar</span>
                </button>
                <button
                  onClick={() => handleVerify(selectedPago.id, 'rechazar')}
                  className="btn-danger flex-1 flex items-center justify-center space-x-2"
                >
                  <X size={18} />
                  <span>Rechazar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pagos
