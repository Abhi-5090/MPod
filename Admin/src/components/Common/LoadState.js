import React from "react"
import PropTypes from "prop-types"
import { Alert, Button, Spinner } from "reactstrap"

// Renders loading / error / empty states; otherwise renders children.
// Usage: <LoadState loading={loading} error={error} empty={!rows.length} onRetry={load}>...table...</LoadState>
const LoadState = ({ loading, error, empty, emptyText = "No records found.", onRetry, children }) => {
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner color="primary" />
        <span className="ms-2 text-muted">Loading...</span>
      </div>
    )
  }
  if (error) {
    return (
      <Alert color="danger" className="d-flex justify-content-between align-items-center">
        <span>{error}</span>
        {onRetry && (
          <Button size="sm" color="danger" outline onClick={onRetry}>
            Retry
          </Button>
        )}
      </Alert>
    )
  }
  if (empty) {
    return <div className="text-center text-muted py-5">{emptyText}</div>
  }
  return <React.Fragment>{children}</React.Fragment>
}

LoadState.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.node,
  empty: PropTypes.bool,
  emptyText: PropTypes.node,
  onRetry: PropTypes.func,
  children: PropTypes.node,
}

export default LoadState
