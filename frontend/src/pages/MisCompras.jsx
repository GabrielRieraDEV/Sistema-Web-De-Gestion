import { useState, useEffect } from 'react'
import api from '../services/api'
import { Package, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react'

const MisCompras = () => {
  const [compras, setCompras] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCompra, setSelectedCompra] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState({
    metodo_pago: 'pago_movil',
    numero_referencia: '',
    banco_origen: '',
    telefono_pago: '',
    monto: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchCompras()
  }, [])

  const fetchCompras = async () => {
    try {
      const response = await api.get('/api/pagos/mis-compras')
      setCompras(response.data.compras || [])
    } catch (error) {
      console.error('Error fetching compras:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      await api.post('/api/pagos/registrar', {
        compra_id: selectedCompra.id,
        ...paymentData,
        monto: parseFloat(paymentData.monto)
      })
      setMessage({ type: 'success', text: 'Pago registrado. Pendiente de verificación.' })
      setShowPaymentModal(false)
      fetchCompras()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error al registrar pago' })
    } finally {
      setSubmitting(false)
    }
  }

  const openPaymentModal = (compra) => {
    setSelectedCompra(compra)
    setPaymentData({
      ...paymentData,
      monto: compra.monto_total
    })
    setShowPaymentModal(true)
  }

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'completada': return <CheckCircle className="text-green-600" size={20} />
      case 'cancelada': return <XCircle className="text-red-600" size={20} />
      case 'pago_verificando': return <Clock className="text-blue-600" size={20} />
      default: return <Clock className="text-yellow-600" size={20} />
    }
  }

  const getStatusBadge = (estado) => {
    const classes = {
      'pendiente_pago': 'badge-warning',
      'pago_verificando': 'badge-info',
      'pagada': 'badge-success',
      'completada': 'badge-success',
      'cancelada': 'badge-danger'
    }
    return classes[estado] || 'badge-info'
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Compras</h1>
        <p className="text-gray-500">Historial y estado de tus compras</p>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}

      {compras.length === 0 ? (
        <div className="card text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No tienes compras aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {compras.map((compra) => (
            <div key={compra.id} className="card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start space-x-4">
                  {getStatusIcon(compra.estado)}
                  <div>
                    <h3 className="font-semibold text-gray-900">Compra #{compra.id}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(compra.fecha_compra).toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${compra.monto_total}</p>
                    <span className={`badge ${getStatusBadge(compra.estado)}`}>
                      {compra.estado.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {compra.estado === 'pendiente_pago' && (
                    <button
                      onClick={() => openPaymentModal(compra)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <CreditCard size={18} />
                      <span>Registrar Pago</span>
                    </button>
                  )}
                </div>
              </div>

              {compra.retiro && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-800">Información de Retiro</p>
                  <div className="text-sm text-green-700 mt-2 space-y-1">
                    <p>N° Retiro: <strong>{compra.retiro.numero_retiro}</strong></p>
                    <p>N° Cola: <strong>{compra.retiro.numero_cola}</strong></p>
                    <p>Fecha: {new Date(compra.retiro.fecha_retiro_programada).toLocaleDateString('es-VE')}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Registrar Pago</h2>
            <p className="text-gray-600 mb-4">Compra #{selectedCompra?.id} - ${selectedCompra?.monto_total}</p>
            
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  value={paymentData.metodo_pago}
                  onChange={(e) => setPaymentData({...paymentData, metodo_pago: e.target.value})}
                  className="input"
                >
                  <option value="pago_movil">Pago Móvil</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Referencia *
                </label>
                <input
                  type="text"
                  value={paymentData.numero_referencia}
                  onChange={(e) => setPaymentData({...paymentData, numero_referencia: e.target.value})}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banco Origen
                </label>
                <input
                  type="text"
                  value={paymentData.banco_origen}
                  onChange={(e) => setPaymentData({...paymentData, banco_origen: e.target.value})}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono de Pago
                </label>
                <input
                  type="text"
                  value={paymentData.telefono_pago}
                  onChange={(e) => setPaymentData({...paymentData, telefono_pago: e.target.value})}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.monto}
                  onChange={(e) => setPaymentData({...paymentData, monto: e.target.value})}
                  className="input"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Registrando...' : 'Registrar Pago'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MisCompras
