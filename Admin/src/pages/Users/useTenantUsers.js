import { useCallback, useEffect, useRef, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { apiUrl, getErrorMessage } from "../../config/api"
import { isPlatformRole } from "../../config/roles"
import { useAuth } from "../../context/AuthContext"

// Shared by UsersList and UsersProfilePicsList.
// Platform roles get a tenant list (GET get-tenants) and can switch tenant;
// tenant staff always load their own tenant (backend uses the session tenant anyway).
const useTenantUsers = () => {
  const { user } = useAuth()
  const isPlatform = isPlatformRole(user.role)

  const [tenants, setTenants] = useState([])
  const [tenantId, setTenantId] = useState(user.t_id || "")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const requestRef = useRef(0)

  useEffect(() => {
    if (!isPlatform) return
    axios
      .get(apiUrl("get-tenants"))
      .then(res => setTenants(Array.isArray(res.data) ? res.data : []))
      .catch(err => toast.error(getErrorMessage(err, "Failed to load tenants.")))
  }, [isPlatform])

  const effectiveTenantId = isPlatform ? tenantId : user.t_id

  const load = useCallback(() => {
    const requestId = ++requestRef.current
    if (!effectiveTenantId) {
      setUsers([])
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    axios
      .get(apiUrl(`get-users/${effectiveTenantId}`))
      .then(res => {
        if (requestId === requestRef.current) setUsers(Array.isArray(res.data) ? res.data : [])
      })
      .catch(err => {
        if (requestId === requestRef.current) setError(getErrorMessage(err, "Failed to load users."))
      })
      .finally(() => {
        if (requestId === requestRef.current) setLoading(false)
      })
  }, [effectiveTenantId])

  useEffect(() => {
    load()
  }, [load])

  const selectedTenant = tenants.find(t => t._id === effectiveTenantId)
  const tenantName = (selectedTenant && selectedTenant.organization_name) || (effectiveTenantId === user.t_id && user.organization) || ""

  return { user, isPlatform, tenants, tenantId: effectiveTenantId, setTenantId, tenantName, users, setUsers, loading, error, reload: load }
}

export default useTenantUsers
