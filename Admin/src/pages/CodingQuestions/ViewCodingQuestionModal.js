import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

const ViewCodingQuestionModal = ({ isOpen, toggle, question }) => {
  if (!question) return null;

  // Convert HTML-encoded strings to readable text
  const renderHTML = (html) => {
    return {
      __html: html
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
    };
  };

  // Strip HTML tags and decode entities for clean text blocks
  const formatPlainText = (html) => {
    return html
      ?.replace(/<\/(p|li|br)>/gi, '\n')
      ?.replace(/<br\s*\/?>/gi, '\n')
      ?.replace(/<[^>]+>/g, '')
      ?.replace(/&nbsp;/g, ' ')
      ?.replace(/&lt;/g, '<')
      ?.replace(/&gt;/g, '>')
      ?.trim();
  };

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

export default ViewCodingQuestionModal;
