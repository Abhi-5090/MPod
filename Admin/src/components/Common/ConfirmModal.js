import React from "react"
import PropTypes from "prop-types"
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "reactstrap"

// Generic confirmation dialog. `onConfirm` is called when the user confirms.
const ConfirmModal = ({
  isOpen,
  toggle,
  onConfirm,
  title = "Confirm",
  message = "Are you sure?",
  confirmLabel = "Delete",
  confirmColor = "danger",
  busy = false,
}) => (
  <Modal isOpen={isOpen} toggle={busy ? undefined : toggle}>
    <ModalHeader toggle={busy ? undefined : toggle}>{title}</ModalHeader>
    <ModalBody>{message}</ModalBody>
    <ModalFooter>
      <Button color={confirmColor} onClick={onConfirm} disabled={busy}>
        {busy && <Spinner size="sm" className="me-1" />}
        {confirmLabel}
      </Button>
      <Button color="secondary" onClick={toggle} disabled={busy}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
)

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.node,
  message: PropTypes.node,
  confirmLabel: PropTypes.node,
  confirmColor: PropTypes.string,
  busy: PropTypes.bool,
}

export default ConfirmModal
