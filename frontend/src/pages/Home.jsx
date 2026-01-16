import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Package, Star, ArrowRight, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const Home = () => {
  const [combos, setCombos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    fetchCombos()
  }, [filter])

  const fetchCombos = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'todos') params.append('tipo', filter)
      
      const response = await fetch(`/api/combos/?${params}`)
      const data = await response.json()
      setCombos(data.combos || [])
    } catch (error) {
      console.error('Error fetching combos:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">CE</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">CECOALIMENTOS</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 font-medium">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn-primary">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Combos de Alimentos para tu Familia
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Descubre nuestros combos de alimentos de alta calidad a precios accesibles. 
            Productos frescos y nutritivos para todos.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Comenzar Ahora
            </Link>
            <a href="#combos" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Ver Combos
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="text-primary-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Productos Frescos</h3>
              <p className="text-gray-600 dark:text-gray-400">Alimentos de primera calidad directamente a tu hogar</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Precios Justos</h3>
              <p className="text-gray-600 dark:text-gray-400">Combos accesibles para todas las familias venezolanas</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fácil Pedido</h3>
              <p className="text-gray-600 dark:text-gray-400">Proceso simple de compra y múltiples métodos de pago</p>
            </div>
          </div>
        </div>
      </section>

      {/* Combos Section */}
      <section id="combos" className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Nuestros Combos</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explora nuestra variedad de combos diseñados para satisfacer las necesidades de tu familia
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['todos', 'proteico', 'vegetariano', 'mixto'].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFilter(tipo)}
                className={`px-5 py-2 rounded-full font-medium transition-colors ${
                  filter === tipo
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </button>
            ))}
          </div>

          {/* Combos Grid */}
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando combos...</div>
          ) : combos.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No hay combos disponibles en este momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {combos.map((combo) => (
                <div key={combo.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{combo.nombre}</h3>
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        combo.tipo === 'proteico' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                        combo.tipo === 'vegetariano' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                        'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      }`}>
                        {combo.tipo}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">
                        ${parseFloat(combo.precio_total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {combo.descripcion || 'Combo de alimentos variados'}
                  </p>

                  {combo.productos && combo.productos.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">Contenido:</p>
                      <div className="flex flex-wrap gap-1">
                        {combo.productos.slice(0, 3).map((p, i) => (
                          <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                            {p.cantidad}x {p.producto_nombre}
                          </span>
                        ))}
                        {combo.productos.length > 3 && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                            +{combo.productos.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <Link
                    to="/register"
                    className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    <span>Comprar Ahora</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Regístrate ahora y accede a todos nuestros combos de alimentos
          </p>
          <Link to="/register" className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-3">
            <span>Crear Cuenta Gratis</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CE</span>
            </div>
            <span className="text-white font-bold">CECOALIMENTOS</span>
          </div>
          <p className="text-sm">© 2024 CECOALIMENTOS. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
