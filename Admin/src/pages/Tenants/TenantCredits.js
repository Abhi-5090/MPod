import React, { useCallback, useEffect, useState } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Link, useParams } from "react-router-dom"
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Table,
  Badge,
  Button,
  Form,
  Label,
  Input,
  FormFeedback,
  Spinner,
  Alert,
} from "reactstrap"
import { toast } from "react-toastify"
import axios from "axios"

import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage } from "../../config/api"
import { isPlatformRole } from "../../config/roles"
import { useAuth } from "../../context/AuthContext"
import LoadState from "../../components/Common/LoadState"

// Endpoints:
//   GET  get-tenant/:id                                   (platform, or tenantadmin for own tenant) -> {organization_name, active_credits, ...}
//   GET  tenants/:id/credit-transactions?page=&limit=     -> {items, total, page, limit}
//   POST tenants/:id/credits {amount, type, reason}       (platform only) -> {message, tenant, transaction}
const PAGE_SIZE = 50

const TYPE_BADGE = {
  opening_balance: { color: "secondary", label: "Opening balance" },
  topup: { color: "success", label: "Top-up" },
  adjust: { color: "warning", label: "Adjustment" },
  consume: { color: "danger", label: "Consumed" },
  refund: { color: "info", label: "Refund" },
}

const formatDate = value => {
  if (!value) return "—"
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString()
}

const formatAmount = amount => {
  const n = Number(amount)
  if (!Number.isFinite(n)) return "—"
  return n > 0 ? `+${n}` : String(n)
}

const validateForm = form => {
  const errors = {}
  const raw = String(form.amount).trim()
  if (!/^-?\d+$/.test(raw)) {
    errors.amount = "Enter a whole number"
  } else {
    const amount = parseInt(raw, 10)
    if (form.type === "topup" && amount <= 0) errors.amount = "Top-up amount must be greater than 0"
    if (form.type === "adjust" && amount === 0) errors.amount = "Adjustment cannot be 0"
  }
  if (!form.reason.trim()) errors.reason = "Please give a reason"
  return errors
}

const AddCreditsForm = ({ tenantId, onAdded }) => {
  const [form, setForm] = useState({ type: "topup", amount: "", reason: "" })
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState(null)

  const errors = validateForm(form)
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setTouched(true)
    setServerError(null)
    if (Object.keys(errors).length) return
    setSubmitting(true)
    try {
      const { data } = await axios.post(apiUrl(`tenants/${tenantId}/credits`), {
        amount: parseInt(form.amount, 10),
        type: form.type,
        reason: form.reason.trim(),
      })
      toast.success((data && data.message) || "Credits updated")
      setForm({ type: form.type, amount: "", reason: "" })
      setTouched(false)
      onAdded(data)
    } catch (err) {
      // 400 {message} e.g. when the balance would go below 0
      setServerError(getErrorMessage(err, "Could not update credits."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit} noValidate>
      {serverError && <Alert color="danger">{serverError}</Alert>}
      <div className="mb-3">
        <Label htmlFor="credit-type">Type</Label>
        <Input id="credit-type" type="select" name="type" value={form.type} onChange={handleChange}>
          <option value="topup">Top-up (add credits)</option>
          <option value="adjust">Adjustment (can be negative)</option>
        </Input>
      </div>
      <div className="mb-3">
        <Label htmlFor="credit-amount">Amount</Label>
        <Input
          id="credit-amount"
          name="amount"
          type="number"
          step="1"
          min={form.type === "topup" ? 1 : undefined}
          placeholder={form.type === "topup" ? "e.g. 100" : "e.g. -5 or 10"}
          value={form.amount}
          onChange={handleChange}
          invalid={touched && !!errors.amount}
        />
        <FormFeedback>{errors.amount}</FormFeedback>
      </div>
      <div className="mb-3">
        <Label htmlFor="credit-reason">Reason</Label>
        <Input
          id="credit-reason"
          name="reason"
          type="textarea"
          rows="2"
          placeholder="e.g. Invoice #123, correction for duplicate interview"
          value={form.reason}
          onChange={handleChange}
          invalid={touched && !!errors.reason}
        />
        <FormFeedback>{errors.reason}</FormFeedback>
      </div>
      <Button color="primary" type="submit" disabled={submitting}>
        {submitting && <Spinner size="sm" className="me-1" />}
        {form.type === "topup" ? "Add credits" : "Apply adjustment"}
      </Button>
    </Form>
  )
}

AddCreditsForm.propTypes = {
  tenantId: PropTypes.string.isRequired,
  onAdded: PropTypes.func.isRequired,
}

const TenantCredits = props => {
  const { id } = useParams()
  const { user } = useAuth()
  const { setBreadcrumbItems: setBreadcrumbs } = props
  const platform = isPlatformRole(user && user.role)
  const ownTenant = user && String(user.t_id) === String(id)
  const canView = platform || ownTenant

  const [tenant, setTenant] = useState(null)
  const [balance, setBalance] = useState(null)
  const [history, setHistory] = useState({ items: [], total: 0, page: 1, limit: PAGE_SIZE })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tenantError, setTenantError] = useState(null)

  useEffect(() => {
    document.title = "Tenant Credits | Mpod"
    setBreadcrumbs(
      "Credits",
      platform
        ? [
            { title: "Mpod", link: "#" },
            { title: "Tenants", link: "/tenants-list" },
            { title: "Credits", link: "#" },
          ]
        : [
            { title: "Mpod", link: "#" },
            { title: "Credits", link: "#" },
          ]
    )
  }, [setBreadcrumbs, platform])

  // Tenant details (name + current balance) always come from get-tenant (active_credits).
  const fetchTenant = useCallback(async () => {
    setTenantError(null)
    try {
      const { data } = await axios.get(apiUrl(`get-tenant/${id}`))
      setTenant(data || null)
      setBalance(data ? data.active_credits : null)
    } catch (err) {
      setTenantError(getErrorMessage(err, "Failed to load tenant."))
    }
  }, [id])

  const fetchHistory = useCallback(
    async pageToLoad => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.get(apiUrl(`tenants/${id}/credit-transactions`), {
          params: { page: pageToLoad, limit: PAGE_SIZE },
        })
        const items = Array.isArray(data && data.items) ? data.items : []
        setHistory({
          items,
          total: Number(data && data.total) || 0,
          page: Number(data && data.page) || pageToLoad,
          limit: Number(data && data.limit) || PAGE_SIZE,
        })
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load credit history."))
      } finally {
        setLoading(false)
      }
    },
    [id]
  )

  useEffect(() => {
    if (!canView) return
    fetchTenant()
  }, [fetchTenant, canView])

  useEffect(() => {
    if (!canView) return
    fetchHistory(page)
  }, [fetchHistory, page, canView])

  const handleAdded = data => {
    if (data && data.tenant && data.tenant.active_credits !== undefined) {
      setBalance(data.tenant.active_credits)
    } else {
      fetchTenant()
    }
    if (page === 1) fetchHistory(1)
    else setPage(1)
  }

  if (!canView) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <h4>Not authorised</h4>
          <p className="text-muted">You can only view your own organisation&apos;s credit history.</p>
          {user && user.t_id && (
            <Link to={`/tenant-credits/${user.t_id}`} className="btn btn-primary">
              View my credits
            </Link>
          )}
        </CardBody>
      </Card>
    )
  }

  const totalPages = Math.max(1, Math.ceil(history.total / (history.limit || PAGE_SIZE)))
  const tenantName = (tenant && tenant.organization_name) || (!platform && user.organization) || "Tenant"

  return (
    <React.Fragment>
      <Row>
        <Col lg={platform ? 4 : 12}>
          <Card>
            <CardBody>
              <CardTitle className="h4">{tenantName}</CardTitle>
              <p className="text-muted mb-1">Current credit balance</p>
              <h2 className="mb-0">{balance === null || balance === undefined ? "—" : balance}</h2>
              {tenantError && (
                <Alert color="danger" className="mt-3 mb-0 d-flex justify-content-between align-items-center">
                  <span>{tenantError}</span>
                  <Button size="sm" color="danger" outline onClick={fetchTenant}>
                    Retry
                  </Button>
                </Alert>
              )}
              {platform && (
                <div className="mt-3">
                  <Link to={`/edit-tenant/${id}`} className="btn btn-outline-secondary btn-sm">
                    Edit tenant
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>
          {platform && (
            <Card>
              <CardBody>
                <CardTitle className="h5 mb-3">Add credits</CardTitle>
                <AddCreditsForm tenantId={id} onAdded={handleAdded} />
              </CardBody>
            </Card>
          )}
        </Col>
        <Col lg={platform ? 8 : 12}>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <CardTitle className="h5 mb-0">Credit history</CardTitle>
                <span className="text-muted small">{history.total} transactions</span>
              </div>
              <LoadState
                loading={loading}
                error={error}
                empty={!history.items.length}
                emptyText="No credit transactions yet."
                onRetry={() => fetchHistory(page)}
              >
                <div className="table-responsive">
                  <Table bordered hover size="sm" className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th className="text-end">Amount</th>
                        <th className="text-end">Balance after</th>
                        <th>Reason / Interview</th>
                        <th>By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.items.map(tx => {
                        const badge = TYPE_BADGE[tx.type] || { color: "light", label: tx.type }
                        const amount = Number(tx.amount)
                        return (
                          <tr key={tx._id}>
                            <td className="text-nowrap">{formatDate(tx.createdAt)}</td>
                            <td>
                              <Badge className={`bg-${badge.color}`}>{badge.label}</Badge>
                            </td>
                            <td className={`text-end fw-semibold ${amount < 0 ? "text-danger" : "text-success"}`}>
                              {formatAmount(tx.amount)}
                            </td>
                            <td className="text-end">{tx.balance_after}</td>
                            <td>
                              {tx.reason || ""}
                              {tx.interview_type && (
                                <div className="small text-muted">
                                  {tx.interview_type}
                                  {tx.interview_id ? ` · ${tx.interview_id}` : ""}
                                </div>
                              )}
                            </td>
                            <td>
                              {tx.actor ? `${tx.actor.first_name || ""} (${tx.actor.roll_no || "?"})` : "System"}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <Button size="sm" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      ‹ Newer
                    </Button>
                    <span className="small text-muted">
                      Page {history.page} of {totalPages}
                    </span>
                    <Button
                      size="sm"
                      color="light"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Older ›
                    </Button>
                  </div>
                )}
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  )
}

TenantCredits.propTypes = {
  setBreadcrumbItems: PropTypes.func,
}

export default connect(null, { setBreadcrumbItems })(TenantCredits)
