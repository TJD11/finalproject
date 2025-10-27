import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmDialog = ({ show, title, message, onConfirm, onCancel }) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || 'Confirm Action'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message || 'Are you sure you want to proceed?'}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDialog;
