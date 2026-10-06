import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const DeleteConfirmationModal = ({ isOpen, toggle, onDelete }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Confirm Delete</ModalHeader>
      <ModalBody>
        Are you sure you want to delete this course?
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onDelete}>Delete</Button>
        <Button color="secondary" onClick={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteConfirmationModal;
