import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import PropTypes from "prop-types"
import axios from "axios"
import { apiUrl } from "../config/api"

// user shape (from GET get-admin-current-user):
// { roll_no, first_name, college, branch, role, t_id, organization }
const AuthContext = createContext({
  user: null,
  loading: true,
  refresh: async () => null,
  logout: async () => {},
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const response = await axios.get(apiUrl("get-admin-current-user"), { withCredentials: true })
      const data = response.data && response.data.role ? response.data : null
      setUser(data)
      return data
    } catch (error) {
      // 401 (no/expired session) or anything else: treat as logged out.
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await axios.post(apiUrl("logout"), { slug: "admin" }, { withCredentials: true })
    } catch (error) {
      // Ignore: cookie may already be gone. We still clear local state.
    }
    setUser(null)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(() => ({ user, loading, refresh, logout }), [user, loading, refresh, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node,
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext
