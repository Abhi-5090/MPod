import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Row,
  Form,
  Input,
  Label,
  Button,
  CardTitle,
} from "reactstrap";

import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import { EditorState, convertToRaw } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const AddCodingQuestion = () => {
  const navigate = useNavigate();
  const [problemName, setProblemName] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [inputEditorState, setInputEditorState] = useState(EditorState.createEmpty());
  const [outputEditorState, setOutputEditorState] = useState(EditorState.createEmpty());
  const [constraintsEditorState, setConstraintsEditorState] = useState(EditorState.createEmpty());
  const [selectedComplexity, setSelectedComplexity] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyData, setCompanyData] = useState([]);
  const [user, setUser] = useState(null);

  const complexityOptions = [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
  ];

  const timeOptions = [
    { label: "15 min", value: "15" },
    { label: "20 min", value: "20" },
    { label: "25 min", value: "25" },
    { label: "30 min", value: "30" },
  ];
  const uploadImageCallBack = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ data: { link: reader.result } });
      };
      reader.readAsDataURL(file);
    });
  };
  useEffect(() => {
    fetchCompanyData();
  }, []);

  useEffect(() => {
    fetchCurrentUserData();
  }, []);

  const fetchCurrentUserData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

      const response = await axios.get(backendUrl + "get-admin-current-user");
      if (response.data) {
        setUser(response.data);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  const fetchCompanyData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + "companies-list");
      if (response.status === 200) {
        setCompanyData(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const companyOptions = companyData.map((company) => ({
    label: company.company_name,
    value: company._id,
  }));

  const addQuestion = async () => {
    if (!problemName || !selectedComplexity || !selectedTime) {
      toast.error("Please fill all required fields", { autoClose: 3000 });
      return;
    }

    const data = {
      problem_name: problemName,
      complexity: selectedComplexity.value,
      time: selectedTime.value,
      company: selectedCompany ? selectedCompany.value : null,
      description: draftToHtml(convertToRaw(editorState.getCurrentContent())),
      input: draftToHtml(convertToRaw(inputEditorState.getCurrentContent())),
      output: draftToHtml(convertToRaw(outputEditorState.getCurrentContent())),
      constraints: draftToHtml(convertToRaw(constraintsEditorState.getCurrentContent())),
      added_by: user?.roll_no || "Unknown",
    };

    try {
      const response = await axios.post(
        process.env.REACT_APP_MPOD_BACKEND_URL + "add-coding-question",
        data
      );

      if (response.status === 200) {
        toast.success("Question added successfully", { autoClose: 3000 });
        navigate("/coding-questions-list");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed to add question", { autoClose: 3000 });
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col lg={8}>
          <Card>
            <CardBody>
              <CardTitle className="mb-4">Add Coding Question</CardTitle>
              <Form>
                <Label>Problem Name</Label>
                <Input
                  type="text"
                  value={problemName}
                  onChange={(e) => setProblemName(e.target.value)}
                />

                <Label className="mt-3">Complexity</Label>
                <Select
                  value={selectedComplexity}
                  onChange={setSelectedComplexity}
                  options={complexityOptions}
                />

                <Label className="mt-3">Time</Label>
                <Select
                  value={selectedTime}
                  onChange={setSelectedTime}
                  options={timeOptions}
                />

                <Label className="mt-3">Company (Optional)</Label>
                <Select
                  value={selectedCompany}
                  onChange={setSelectedCompany}
                  options={companyOptions}
                  isClearable
                />

                <Label className="mt-3">Description</Label>
                <Editor
                  editorState={editorState}
                  wrapperClassName="editor-wrapper"
                  editorClassName="editor"
                  onEditorStateChange={setEditorState}
                  toolbar={{
                    image: {
                      uploadCallback: uploadImageCallBack,
                      previewImage: true,
                      alt: { present: true, mandatory: false },
                    },
                  }}
                />

                <Label className="mt-3">Input</Label>
                <Editor
                  editorState={inputEditorState}
                  wrapperClassName="editor-wrapper"
                  editorClassName="editor"
                  onEditorStateChange={setInputEditorState}
                  toolbar={{
                    image: {
                      uploadCallback: uploadImageCallBack,
                      previewImage: true,
                      alt: { present: true, mandatory: false },
                    },
                  }}
                />

                <Label className="mt-3">Output</Label>
                <Editor
                  editorState={outputEditorState}
                  wrapperClassName="editor-wrapper"
                  editorClassName="editor"
                  onEditorStateChange={setOutputEditorState}
                  toolbar={{
                    image: {
                      uploadCallback: uploadImageCallBack,
                      previewImage: true,
                      alt: { present: true, mandatory: false },
                    },
                  }}
                />

                <Label className="mt-3">Constraints</Label>
                <Editor
                  editorState={constraintsEditorState}
                  wrapperClassName="editor-wrapper"
                  editorClassName="editor"
                  onEditorStateChange={setConstraintsEditorState}
                  toolbar={{
                    image: {
                      uploadCallback: uploadImageCallBack,
                      previewImage: true,
                      alt: { present: true, mandatory: false },
                    },
                  }}
                />

                <Button color="primary" className="mt-3" onClick={addQuestion}>
                  Submit
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <ToastContainer />
    </React.Fragment>
  );
};

export default AddCodingQuestion;
