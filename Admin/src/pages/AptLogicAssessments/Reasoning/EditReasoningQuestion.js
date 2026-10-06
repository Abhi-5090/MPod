import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  FormGroup,
  Input
} from "reactstrap";
import { AvForm } from "availity-reactstrap-validation";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../../store/actions";
import Select from "react-select";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState } from 'draft-js';
import { convertFromHTML } from 'draft-js';

const Option = ({ label, isChecked, onCheckChange, editorState, onEditorStateChange, isDisabled }) => (
  <Row>
    <Col lg="12">
      <FormGroup className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <Label>{label}</Label>
          {label !== "Question" && (
            <div className="d-flex align-items-center">
              <Label className="mr-2">Answer</Label>
              <Input
                type="checkbox"
                checked={isChecked}
                onChange={onCheckChange}  // Ensure the checkbox changes state
                disabled={isDisabled}
                style={{ marginTop: '-5px', marginLeft: "10px" }}
              />
            </div>
          )}
        </div>
        <Editor
          editorState={editorState}
          toolbarClassName="toolbarClassName"
          wrapperClassName="wrapperClassName"
          editorClassName="editorClassName"
          onEditorStateChange={onEditorStateChange}
          editorStyle={{
            minHeight: "300px",
            border: "1px solid",
            borderRadius: "4px",
            padding: "10px",
          }}
        />
      </FormGroup>
    </Col>
  </Row>
);

const UploadCodingQuestions = (props) => {
  document.title = "Technical Hub | Edit Assessment Questions";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Edit Assessment Question", link: "/edit-assessment-question" },
    { title: "Edit Assessment Question", link: "/edit-assessment-question" },
  ];

  const [data, setData] = useState(null);
  const [selectedLevelGroup, setSelectedLevelGroup] = useState(null);
  const [editorStates, setEditorStates] = useState({
    question: EditorState.createEmpty(),
    option1: EditorState.createEmpty(),
    option2: EditorState.createEmpty(),
    option3: EditorState.createEmpty(),
    option4: EditorState.createEmpty(),
  });
  const [selectedOption, setSelectedOption] = useState('');  // Track selected option
  const [showButton, setShowButton] = useState(true);
  const question = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestionData();  // Fetch question data on load
  }, []);

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem('authUser'));
    props.setBreadcrumbItems('Edit Assessment Question', breadcrumbItems);
  }, []);

  const fetchQuestionData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(`${backendUrl}get-reasoning-question-by-id/${question.questionId}`);
      if (response.status === 200) {
        const questionData = response.data;
        setData(questionData);
        setSelectedLevelGroup({ value: questionData.level, label: questionData.level });

        // Load the editor state from the fetched question data
        setEditorStates({
          question: EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(questionData.question))),
          option1: EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(questionData.option1))),
          option2: EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(questionData.option2))),
          option3: EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(questionData.option3))),
          option4: EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(questionData.option4))),
        });

        // Set the correct option based on the fetched answer
        setSelectedOption(determineSelectedOption(questionData));
      }
    } catch (error) {
      console.log("Error fetching question data:", error);
    }
  };

  const determineSelectedOption = (data) => {
    if (data.option1 === data.answer) return 'option1';
    if (data.option2 === data.answer) return 'option2';
    if (data.option3 === data.answer) return 'option3';
    if (data.option4 === data.answer) return 'option4';
    return '';
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option); // Update the selected option when a user clicks a checkbox
  };

  const handleEditorStateChange = (key) => (editorState) => {
    setEditorStates(prevStates => ({
      ...prevStates,
      [key]: editorState
    }));
  };

  const handleSubmit = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const payload = {
      question: editorStates.question.getCurrentContent().getPlainText(),
      option1: editorStates.option1.getCurrentContent().getPlainText(),
      option2: editorStates.option2.getCurrentContent().getPlainText(),
      option3: editorStates.option3.getCurrentContent().getPlainText(),
      option4: editorStates.option4.getCurrentContent().getPlainText(),
      answer: selectedOption ? editorStates[selectedOption].getCurrentContent().getPlainText() : null,
    };

    try {
      const response = await axios.post(`${backendUrl}update-reasoning-question-by-id/${question.questionId}`, payload);
      if (response.status === 200) {
        console.log("Question updated successfully:", response.data);
        // Optionally navigate back after submission
        navigate('/reasoning-questions');
      }
    } catch (error) {
      console.error("Error updating the question:", error);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <AvForm>
          <Row>
            <Col lg="6">
              <Card>
                <CardBody>

                  <Option
                    label="Question"
                    editorState={editorStates.question}
                    onEditorStateChange={handleEditorStateChange('question')}
                  />
                  <Option
                    label="Option 1"
                    isChecked={selectedOption === 'option1'}  // Ensure only option1 is checked if selected
                    onCheckChange={() => handleOptionChange('option1')} // Handle checkbox change
                    editorState={editorStates.option1}
                    onEditorStateChange={handleEditorStateChange('option1')}
                    isDisabled={false}
                  />
                  <Option
                    label="Option 2"
                    isChecked={selectedOption === 'option2'}  // Ensure only option2 is checked if selected
                    onCheckChange={() => handleOptionChange('option2')} // Handle checkbox change
                    editorState={editorStates.option2}
                    onEditorStateChange={handleEditorStateChange('option2')}
                    isDisabled={false}
                  />
                  <Option
                    label="Option 3"
                    isChecked={selectedOption === 'option3'}  // Ensure only option3 is checked if selected
                    onCheckChange={() => handleOptionChange('option3')} // Handle checkbox change
                    editorState={editorStates.option3}
                    onEditorStateChange={handleEditorStateChange('option3')}
                    isDisabled={false}
                  />
                  <Option
                    label="Option 4"
                    isChecked={selectedOption === 'option4'}  // Ensure only option4 is checked if selected
                    onCheckChange={() => handleOptionChange('option4')} // Handle checkbox change
                    editorState={editorStates.option4}
                    onEditorStateChange={handleEditorStateChange('option4')}
                    isDisabled={false}
                  />

                  {showButton && (
                    <Button
                      color="primary"
                      className="mt-3"
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </AvForm>
      </div>
    </React.Fragment>
  );
};

const mapStatetoProps = (state) => {
  return {};
};

export default connect(mapStatetoProps, {
  setBreadcrumbItems,
})(UploadCodingQuestions);
