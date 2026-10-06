import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  Input,
} from "reactstrap";
import Select from "react-select";
import { toast } from 'react-toastify';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { EditorState, ContentState, convertToRaw } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { apiUrl, getErrorMessage } from "../../config/api";

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


const EditCodingQuestion = (props) => {
  document.title = "Edit Coding Question | Mpod";

  const { questionId } = useParams();
  const navigate = useNavigate();
  const [problemName, setProblemName] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [inputEditorState, setInputEditorState] = useState(EditorState.createEmpty());
  const [outputEditorState, setOutputEditorState] = useState(EditorState.createEmpty());
  const [constraintsEditorState, setConstraintsEditorState] = useState(EditorState.createEmpty());
  const [selectedComplexity, setSelectedComplexity] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const uploadImageCallBack = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ data: { link: reader.result } });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  useEffect(() => {
    props.setBreadcrumbItems('Edit Coding Question', [
      { title: "Mpod", link: "#" },
      { title: "Coding Questions", link: "/coding-questions-list" },
      { title: "Edit Coding Question", link: "#" },
    ]);
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  // Load companies and the question together so the question loads even if the company list is empty.
  const loadAll = async () => {
    const [companiesRes, questionRes] = await Promise.allSettled([
      axios.get(apiUrl("companies-list")),
      axios.get(apiUrl(`get-coding-question-by-id/${questionId}`)),
    ]);

    const companyList = companiesRes.status === "fulfilled" && Array.isArray(companiesRes.value.data) ? companiesRes.value.data : [];
    setCompanies(companyList);
    if (companiesRes.status === "rejected") toast.error(getErrorMessage(companiesRes.reason, "Failed to load companies."));

    if (questionRes.status === "rejected") {
      toast.error(getErrorMessage(questionRes.reason, "Failed to load coding question."));
      return;
    }
    const data = questionRes.value.data || {};
    const company = companyList.find(c => c._id === data.company);

    setProblemName(data.problem_name || "");
    setSelectedComplexity(complexityOptions.find(opt => opt.value === data.complexity) || null);
    setSelectedTime(timeOptions.find(opt => opt.value === String(data.time)) || null);
    setSelectedCompany(company ? { label: company.company_name, value: company._id } : null);

    // Convert HTML to EditorState
    setEditorState(convertHtmlToEditorState(data.description));
    setInputEditorState(convertHtmlToEditorState(data.input));
    setOutputEditorState(convertHtmlToEditorState(data.output));
    setConstraintsEditorState(convertHtmlToEditorState(data.constraints));
  };

  const convertHtmlToEditorState = (html) => {
    const blocksFromHtml = htmlToDraft(html || "<p></p>");
    const contentState = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);
    return EditorState.createWithContent(contentState);
  };

  const companyOptions = companies.map(company => ({
    label: company.company_name,
    value: company._id
  }));

  const updateQuestion = async () => {
    if (!problemName || !selectedComplexity || !selectedTime) {
      toast.error("Please fill all required fields", { autoClose: 3000 });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.put(apiUrl(`update-coding-question/${questionId}`), {
        problem_name: problemName,
        complexity: selectedComplexity.value,
        time: selectedTime.value,
        company: selectedCompany?.value || null,
        description: draftToHtml(convertToRaw(editorState.getCurrentContent())),
        input: draftToHtml(convertToRaw(inputEditorState.getCurrentContent())),
        output: draftToHtml(convertToRaw(outputEditorState.getCurrentContent())),
        constraints: draftToHtml(convertToRaw(constraintsEditorState.getCurrentContent())),
      });

      if (response.status === 200) {
        toast.success("Question updated successfully", { autoClose: 3000 });
        navigate(`/coding-questions-list`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update question"), { autoClose: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">EDIT CODING QUESTION</h4>

              <Row>
                <Col md="12">
                  <Label>Problem Name</Label>
                  <Input
                    type="text"
                    value={problemName}
                    onChange={(e) => setProblemName(e.target.value)}
                  />
                </Col>

              </Row>

              <Row className="mt-3">
                <Col md="6">
                  <Label className="mt-3">Time</Label>
                  <Select
                    value={selectedTime}
                    onChange={setSelectedTime}
                    options={timeOptions}
                  />
                </Col>
                <Col md="6">
                  <Label className="mt-3">Company (Optional)</Label>
                  <Select
                    value={selectedCompany}
                    onChange={setSelectedCompany}
                    options={companyOptions}
                    isClearable
                  />
                </Col>
              </Row>
              <Row>
                <Col md="6">
                  <Label className="mt-3">Complexity</Label>
                  <Select
                    value={selectedComplexity}
                    onChange={setSelectedComplexity}
                    options={complexityOptions}
                  />
                </Col>
              </Row>
              <Label className="mt-3">Description</Label>
              <Editor editorState={editorState} onEditorStateChange={setEditorState}
              toolbar={{
                image: {
                  uploadCallback: uploadImageCallBack,
                  previewImage: true,
                  alt: { present: true, mandatory: false },
                },
              }} />

              <Label className="mt-3">Input</Label>
              <Editor editorState={inputEditorState} onEditorStateChange={setInputEditorState} 
               toolbar={{
                image: {
                  uploadCallback: uploadImageCallBack,
                  previewImage: true,
                  alt: { present: true, mandatory: false },
                },
              }}/>

              <Label className="mt-3">Output</Label>
              <Editor editorState={outputEditorState} onEditorStateChange={setOutputEditorState} 
               toolbar={{
                image: {
                  uploadCallback: uploadImageCallBack,
                  previewImage: true,
                  alt: { present: true, mandatory: false },
                },
              }}/>

              <Label className="mt-3">Constraints</Label>
              <Editor editorState={constraintsEditorState} onEditorStateChange={setConstraintsEditorState} 
               toolbar={{
                image: {
                  uploadCallback: uploadImageCallBack,
                  previewImage: true,
                  alt: { present: true, mandatory: false },
                },
              }}/>

              <Button color="primary" className="mt-3" onClick={updateQuestion} disabled={submitting}>Update</Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(EditCodingQuestion);
