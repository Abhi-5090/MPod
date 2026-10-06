import React from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

// Decode the few entities the editor stores, then sanitize before injecting.
const renderHTML = (html) => {
  if (html === null || html === undefined) return { __html: '' };
  const decoded = String(html)
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  return { __html: DOMPurify.sanitize(decoded) };
};

// Strip HTML tags and decode entities for clean text blocks (rendered as text, not HTML).
const formatPlainText = (html) => {
  if (html === null || html === undefined) return '';
  return String(html)
    .replace(/<\/(p|li|br)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
};

const ViewCodingQuestionModal = ({ isOpen, toggle, question }) => {
  if (!question) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>{question.problem_name}</ModalHeader>
      <ModalBody style={{ backgroundColor: "#333", color: "#ccc", borderRadius: "10px", padding: "20px" }}>
        <h5>Description:</h5>
        <div dangerouslySetInnerHTML={renderHTML(question.description)} />

        <h5 className="mt-3">Input:</h5>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{formatPlainText(question.input)}</pre>

        <h5 className="mt-3">Output:</h5>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{formatPlainText(question.output)}</pre>

        <h5 className="mt-3">Constraints:</h5>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{formatPlainText(question.constraints)}</pre>
      </ModalBody>
    </Modal>
  );
};

ViewCodingQuestionModal.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
  question: PropTypes.object,
};

export default ViewCodingQuestionModal;
