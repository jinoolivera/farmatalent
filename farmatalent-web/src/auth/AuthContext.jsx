import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage, setAuthToken } from '../api/client'
import * as authApi from '../api/authApi'

const TOKEN_KEY = 'farmatalent_token'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(Boolean(token))
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    setAuthToken(token)

    if (!token) {
      setInitializing(false)
      return
    }

    authApi
      .fetchCurrentUser()
      .then((data) => {
        setUser(data.user)
        setAuthError('')
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
        setAuthError('Su sesion expiro. Ingrese nuevamente.')
      })
      .finally(() => setInitializing(false))
  }, [token])

  async function login(credentials) {
    setLoading(true)
    setAuthError('')
    try {
      const data = await authApi.login(credentials)
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
      return data
    } catch (error) {
      const message = getApiErrorMessage(error, 'No se pudo iniciar sesion.')
      setAuthError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function register(payload) {
    setLoading(true)
    setAuthError('')
    try {
      const data = await authApi.register(payload)
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
      return data
    } catch (error) {
      const message = getApiErrorMessage(error, 'No se pudo registrar el usuario.')
      setAuthError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    setLoading(true)
    try {
      await authApi.logout()
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setUser(null)
      setAuthToken(null)
      setLoading(false)
    }
  }

  async function refreshUser() {
    if (!token) {
      return null
    }

    const data = await authApi.fetchCurrentUser()
    setUser(data.user)
    return data.user
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      initializing,
      authError,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [authError, initializing, loading, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}
