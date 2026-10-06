import React, { useEffect, useState } from "react"
import axios from "axios"
import { Input, Label } from "reactstrap"
import { toast } from "react-toastify"
import { apiUrl, getErrorMessage } from "../../config/api"
import { isPlatformRole } from "../../config/roles"
import { useAuth } from "../../context/AuthContext"

// Remembers the college picked by a platform user so the list and add pages agree.
const STORAGE_KEY = "mpod_admin_interview_tenant"

const readStoredTenant = () => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) || ""
  } catch (e) {
    return ""
  }
}

const writeStoredTenant = value => {
  try {
    if (value) window.sessionStorage.setItem(STORAGE_KEY, value)
    else window.sessionStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    // storage unavailable - selection just isn't remembered
  }
}

// Tenant (college) selection for the interview pages.
// Platform roles (admin/superadmin) pick a college from GET get-tenants, defaulting to their own t_id.
// Tenant staff always use their own t_id and get no selector (backend ignores other ids for them).
const useTenantSelection = () => {
  const { user } = useAuth()
  const isPlatform = isPlatformRole(user.role)

  const [tenants, setTenants] = useState([])
  const [selectedTenantId, setSelectedTenantId] = useState(() => readStoredTenant() || user.t_id || "")

  useEffect(() => {
    if (!isPlatform) return
    axios
      .get(apiUrl("get-tenants"))
      .then(res => setTenants(Array.isArray(res.data) ? res.data : []))
      .catch(err => toast.error(getErrorMessage(err, "Failed to load colleges.")))
  }, [isPlatform])

  const setTenantId = value => {
    setSelectedTenantId(value || "")
    writeStoredTenant(value || "")
  }

  const tenantId = isPlatform ? selectedTenantId : user.t_id || ""
  const selectedTenant = tenants.find(t => t._id === tenantId)
  const tenantName =
    (selectedTenant && selectedTenant.organization_name) || (tenantId && tenantId === user.t_id && user.organization) || ""

  return { user, isPlatform, tenants, tenantId, setTenantId, tenantName }
}

// Dropdown shown only to platform roles.
export const TenantSelect = ({ isPlatform, tenants, tenantId, setTenantId, tenantName, id = "tenantSelect", className = "" }) => {
  if (!isPlatform) return null
  return (
    <div className={`d-flex align-items-center gap-2 ${className}`}>
      <Label for={id} className="mb-0 text-nowrap">
        College
      </Label>
      <Input id={id} type="select" value={tenantId || ""} onChange={e => setTenantId(e.target.value)}>
        <option value="">Select a college</option>
        {tenantId && !tenants.some(t => t._id === tenantId) && (
          <option value={tenantId}>{tenantName || "Current college"}</option>
        )}
        {tenants.map(t => (
          <option key={t._id} value={t._id}>
            {t.organization_name}
          </option>
        ))}
      </Input>
    </div>
  )
}

export default useTenantSelection
