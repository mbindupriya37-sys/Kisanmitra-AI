import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user')
      const savedToken = localStorage.getItem('token')
      if (savedUser && savedToken) {
        return JSON.parse(savedUser)
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
    return null
  })

  const [token, setToken] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user')
      const savedToken = localStorage.getItem('token')
      if (savedUser && savedToken) {
        return savedToken
      }
    } catch (e) {
      console.error('Error reading token from localStorage', e)
    }
    return null
  })

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    if (!savedToken || !savedUser) return false
    try {
      JSON.parse(savedUser)
      return true
    } catch {
      return false
    }
  })

  useEffect(() => {
    setIsAuthenticated(Boolean(token && user))
  }, [token, user])

  const login = (userData, jwtToken) => {
    if (!jwtToken || !userData) return

    // Ensure token & sensitive fields are excluded from stored user payload
    const safeUser = { ...userData }
    delete safeUser.token
    delete safeUser.password

    try {
      localStorage.setItem('token', jwtToken)
      localStorage.setItem('user', JSON.stringify(safeUser))
      
      setToken(jwtToken)
      setUser(safeUser)
      setIsAuthenticated(true)
    } catch (e) {
      console.error('Error persisting auth state to localStorage', e)
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (e) {
      console.error('Error clearing auth state from localStorage', e)
    }
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
