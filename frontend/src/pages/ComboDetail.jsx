import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { ShoppingCart, ArrowLeft, Check, Package } from 'lucide-react'

const ComboDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [combo, setCombo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseResult, setPurchaseResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCombo()
  }, [id])

  const fetchCombo = async () => {
    try {
      const response = await api.get(`/api/combos/${id}`)
      setCombo(response.data)
    } catch (error) {
      console.error('Error fetching combo:', error)
      setError('Combo no encontrado')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    setPurchasing(true)
    setError('')

    try {
      const response = await api.post('/api/pagos/comprar', { combo_id: parseInt(id) })
      setPurchaseResult(response.data)
    } catch (error) {
      setError(error.response?.data?.error || 'Error al realizar la compra')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>
  }

  if (error && !combo) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate('/combos')} className="btn-primary">
          Volver a Combos
        </button>
      </div>
    )
  }

  if (purchaseResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Compra Iniciada!</h2>
          <p className="text-gray-600 mb-6">Tu compra ha sido registrada. Ahora debes realizar el pago.</p>
          
          <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Instrucciones de Pago</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Monto a pagar:</span>
                <span className="font-bold text-primary-600">${purchaseResult.monto_total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">N° de Compra:</span>
                <span className="font-medium">{purchaseResult.compra_id}</span>
              </div>
              <hr className="my-3" />
              <div>
                <p className="font-medium mb-2">Datos para Pago Móvil:</p>
                <p>Teléfono: {purchaseResult.instrucciones?.telefono}</p>
                <p>Banco: {purchaseResult.instrucciones?.banco}</p>
                <p>Cédula: {purchaseResult.instrucciones?.cedula}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 justify-center">
            <button onClick={() => navigate('/mis-compras')} className="btn-primary">
              Ver Mis Compras
            </button>
            <button onClick={() => navigate('/combos')} className="btn-secondary">
              Seguir Comprando
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/combos')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Volver a Combos</span>
      </button>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{combo.nombre}</h1>
            <span className={`badge ${
              combo.tipo === 'proteico' ? 'badge-danger' :
              combo.tipo === 'vegetariano' ? 'badge-success' :
              'badge-info'
            }`}>
              {combo.tipo}
            </span>
            <p className="text-gray-600 mt-4">{combo.descripcion || 'Sin descripción'}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary-600">
              ${parseFloat(combo.precio_total).toFixed(2)}
            </p>
            <p className={`text-sm mt-1 ${combo.disponible ? 'text-green-600' : 'text-red-600'}`}>
              {combo.disponible ? '✓ Disponible' : '✗ No disponible'}
            </p>
          </div>
        </div>

        {combo.productos && combo.productos.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Package size={20} className="mr-2" />
              Contenido del Combo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {combo.productos.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium">{p.producto_nombre}</span>
                  <span className="text-gray-500">{p.cantidad} unidades</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mt-6">
            {error}
          </div>
        )}

        <div className="border-t pt-6 mt-6">
          <button
            onClick={handlePurchase}
            disabled={!combo.disponible || purchasing}
            className="btn-primary w-full md:w-auto flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {purchasing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart size={20} />
                <span>Comprar Combo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ComboDetail
