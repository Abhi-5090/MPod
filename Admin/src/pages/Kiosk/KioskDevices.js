import React, { useCallback, useEffect, useState } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { useSearchParams } from "react-router-dom"
import { Row, Col, Card, CardBody, CardTitle, Table, Badge, Button, Input, Label, Alert } from "reactstrap"
import { toast } from "react-toastify"
import axios from "axios"

import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage, STUDENT_APP_URL } from "../../config/api"
import { isPlatformRole } from "../../config/roles"
import { useAuth } from "../../context/AuthContext"
import LoadState from "../../components/Common/LoadState"
import ConfirmModal from "../../components/Common/ConfirmModal"

// Endpoints:
//   GET get-tenants                      (platform only, for the tenant filter)
//   GET kiosk/devices[?tenant_id=]       platform may filter; tenant staff always get their own tenant
//   PUT kiosk/devices/:id/revoke
const breadcrumbItems = [
  { title: "Mpod", link: "#" },
  { title: "Kiosk Devices", link: "#" },
]

const formatDate = value => {
  if (!value) return "—"
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString()
}

const KioskDevices = props => {
  const { user } = useAuth()
  const { setBreadcrumbItems: setBreadcrumbs } = props
  const platform = isPlatformRole(user && user.role)
  const [searchParams, setSearchParams] = useSearchParams()
  const tenantFilter = platform ? searchParams.get("tenant_id") || "" : ""

  const [tenants, setTenants] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toRevoke, setToRevoke] = useState(null)
  const [revoking, setRevoking] = useState(false)

  useEffect(() => {
    document.title = "Kiosk Devices | Mpod"
    setBreadcrumbs("Kiosk Devices", breadcrumbItems)
  }, [setBreadcrumbs])

  useEffect(() => {
    if (!platform) return
    axios
      .get(apiUrl("get-tenants"))
      .then(res => setTenants(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTenants([]))
  }, [platform])

  const fetchDevices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get(apiUrl("kiosk/devices"), {
        params: tenantFilter ? { tenant_id: tenantFilter } : undefined,
      })
      setDevices(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load kiosk devices."))
    } finally {
      setLoading(false)
    }
  }, [tenantFilter])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  const handleRevoke = async () => {
    if (!toRevoke) return
    setRevoking(true)
    try {
      const { data } = await axios.put(apiUrl(`kiosk/devices/${toRevoke._id}/revoke`))
      toast.success((data && data.message) || "Kiosk revoked")
      setDevices(prev => prev.map(d => (d._id === toRevoke._id ? { ...d, status: "revoked" } : d)))
      setToRevoke(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not revoke kiosk."))
    } finally {
      setRevoking(false)
    }
  }

  const setupUrl = `${STUDENT_APP_URL}kiosk-setup`

  return (
    <React.Fragment>
      <Row>
        <Col xs="12">
          <Card>
            <CardBody>
              <CardTitle className="h4">Kiosk Devices</CardTitle>
              <Alert color="info" className="mb-4">
                Kiosks are registered on the kiosk itself by opening{" "}
                <a href={setupUrl} target="_blank" rel="noopener noreferrer">
                  {setupUrl}
                </a>{" "}
                and signing in with a college admin account. Revoking a kiosk signs it out permanently; it
                must be registered again to be used.
              </Alert>

              {platform && (
                <Row className="mb-3">
                  <Col md="4">
                    <Label htmlFor="tenant-filter">Tenant</Label>
                    <Input
                      id="tenant-filter"
                      type="select"
                      value={tenantFilter}
                      onChange={e => {
                        const value = e.target.value
                        setSearchParams(value ? { tenant_id: value } : {})
                      }}
                    >
                      <option value="">All tenants</option>
                      {tenants.map(t => (
                        <option key={t._id} value={t._id}>
                          {t.organization_name}
                        </option>
                      ))}
                    </Input>
                  </Col>
                </Row>
              )}

              <LoadState
                loading={loading}
                error={error}
                empty={!devices.length}
                emptyText="No kiosks registered yet."
                onRetry={fetchDevices}
              >
                <div className="table-responsive">
                  <Table bordered hover className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        {platform && <th>Tenant</th>}
                        <th>Status</th>
                        <th>Registered by</th>
                        <th>Last seen</th>
                        <th>Registered on</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devices.map(device => (
                        <tr key={device._id}>
                          <td>{device.name}</td>
                          {platform && <td>{device.organization_name || device.tenant_id}</td>}
                          <td>
                            {device.status === "active" ? (
                              <Badge className="bg-success">Active</Badge>
                            ) : (
                              <Badge className="bg-secondary">Revoked</Badge>
                            )}
                          </td>
                          <td>
                            {device.registered_by
                              ? `${device.registered_by.first_name || ""} (${device.registered_by.roll_no || "?"})`
                              : "—"}
                          </td>
                          <td className="text-nowrap">{formatDate(device.last_seen_at)}</td>
                          <td className="text-nowrap">{formatDate(device.createdAt)}</td>
                          <td>
                            {device.status === "active" && (
                              <Button color="danger" size="sm" onClick={() => setToRevoke(device)}>
                                Revoke
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <ConfirmModal
        isOpen={!!toRevoke}
        toggle={() => setToRevoke(null)}
        onConfirm={handleRevoke}
        busy={revoking}
        title="Revoke kiosk"
        confirmLabel="Revoke"
        message={
          toRevoke
            ? `Revoke kiosk "${toRevoke.name}"? It will stop working immediately and must be registered again.`
            : ""
        }
      />
    </React.Fragment>
  )
}

KioskDevices.propTypes = {
  setBreadcrumbItems: PropTypes.func,
}

export default connect(null, { setBreadcrumbItems })(KioskDevices)
