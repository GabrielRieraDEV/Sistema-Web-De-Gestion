import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password })
    const { access_token, refresh_token, usuario } = response.data
    
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    localStorage.setItem('user', JSON.stringify(usuario))
    
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    setUser(usuario)
    
    return usuario
  }

  const register = async (userData) => {
    const response = await api.post('/api/auth/register', userData)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const isAdmin = () => user?.rol === 'admin'
  const isLogistica = () => ['admin', 'logistica'].includes(user?.rol)
  const isCobranza = () => ['admin', 'cobranza'].includes(user?.rol)
  const isPublicidad = () => ['admin', 'publicidad'].includes(user?.rol)

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAdmin,
      isLogistica,
      isCobranza,
      isPublicidad,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}
