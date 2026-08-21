import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage, setAuthToken } from '../api/client'
import * as authApi from '../api/authApi'
import { APP_MODE_KEY, resolveAppMode } from './authRouting'

const TOKEN_KEY = 'farmatalent_token'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [preferredAppMode, setPreferredAppMode] = useState(() => localStorage.getItem(APP_MODE_KEY))
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(Boolean(token))
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    setAuthToken(token)

    if (!token) {
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

  const appMode = useMemo(
    () => resolveAppMode(user, preferredAppMode),
    [preferredAppMode, user],
  )

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
      setPreferredAppMode(null)
      setAuthToken(null)
      localStorage.removeItem(APP_MODE_KEY)
      setLoading(false)
    }
  }

  const refreshUser = useCallback(async () => {
    if (!token) {
      return null
    }

    const data = await authApi.fetchCurrentUser()
    setUser(data.user)
    return data.user
  }, [token])

  const setAppMode = useCallback((mode, forUser = user) => {
    const nextMode = resolveAppMode(forUser, mode)
    if (!nextMode) return
    localStorage.setItem(APP_MODE_KEY, nextMode)
    setPreferredAppMode(nextMode)
  }, [user])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      initializing,
      authError,
      isAuthenticated: Boolean(token && user),
      appMode,
      login,
      register,
      logout,
      refreshUser,
      setAppMode,
    }),
    [appMode, authError, initializing, loading, logout, refreshUser, setAppMode, token, user],
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
