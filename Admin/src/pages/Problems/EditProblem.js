import React, { useEffect, useRef, useContext, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Input,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Label,
  Button,
  CardTitle,
  Table,
  Spinner,
  Nav,
  CardText
} from "reactstrap";

import Select from "react-select";
import classnames from "classnames";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { Modal, Button as BUTTON } from 'react-bootstrap';
import { Link } from "react-router-dom";
// import { axios } from "components/VerticalLayout/SidebarContent";
// Form Editor
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./AddProblem-SqlImage.css"
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  EditorState,
  convertToRaw,
  ContentState,
  convertFromHTML,
  convertFromRaw,
} from "draft-js";
// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";
import FormData from "form-data";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { Resizable } from "react-resizable";
import Editor1 from "@monaco-editor/react";
import Switch from "react-switch";
// import LocalStorageContext from "../Common/localStorageContext"
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
let indexVal = 0;
let testcases_input = [];
let testcases_output = [];
let temp = [];
const TestCasesFun = () => {
  return <div></div>;
};
var companyOptionGroup;
var companyRemianOptions = {};
let remainCompanies = [{}];
const EditProblem = () => {
  const axiosAPI = axios.create();
  const params = useParams();
  const navigate = useNavigate();
  const added_by = JSON.parse(localStorage.getItem("authUser"));
  const [activeTab, setactiveTab] = useState(1);
  const [activeTabProgress, setactiveTabProgress] = useState(1);
  const [progressValue, setprogressValue] = useState(25);
  const [activeTabVartical, setoggleTabVertical] = useState(1);
  const [users, setUsers] = useState([]);
  const [levels, setLevels] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState();
  const [selectedMandatoryTag, setSelectedMandatoryTag] = useState();

  const [mandatoryTags, setMandatoryTags] = useState([]);

  const [loading, setLoading] = useState(false);
  const [editor, setEditor] = useState();
  const [theme, setEditorTheme] = useState("vs-dark");
  const [switch1, setswitch1] = useState(false);
  const [switchvalue, setSwitchValue] = useState();
  const [temp1, setTemp] = useState({});
  const [htmlElements, setHtmlElements] = useState([]);
  const [testCaseData, setTestCaseData] = useState([]);
  const [testCaseOldData, setTestCaseOldData] = useState([]);
  const [hiddenTestCaseData, setHiddenTestCaseData] = useState([]);
  const [hiddenTestCaseOldData, setHiddenTestCaseOldData] = useState([]);
  var temp = 0;
  var flag = false;
  var hiddenflag = false;
  const [data, setData] = useState({});
  const [problem, setProblem] = useState({});
  const [stc, setStc] = useState([]);
  const [rows1, setRows1] = useState([
    { hidden_testcase_input: "", hidden_testcase_output: "" },
  ]);
  const [rows2, setRows2] = useState([
    { testcase_input: "", testcase_output: "" },
  ]);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [inputFormatState, setInputFormatState] = useState(() =>
    EditorState.createEmpty()
  );
  const [outputFormatState, setOutputFormatState] = useState(() =>
    EditorState.createEmpty()
  );
  const [inputState, setInputState] = useState(() =>
    EditorState.createEmpty()
  );


  const [hintState, setHintState] = useState(() =>
    EditorState.createEmpty()
  );

  const [editorialState, setEditorialState] = useState(() =>
    EditorState.createEmpty()
  );

  const [input2State, setInput2State] = useState(() =>
    EditorState.createEmpty()
  );

  const [input3State, setInput3State] = useState(() =>
    EditorState.createEmpty()
  );

  const [input4State, setInput4State] = useState(() =>
    EditorState.createEmpty()
  );

  const [outputState, setOutputState] = useState(() =>
    EditorState.createEmpty()
  );

  const [output2State, setOutput2State] = useState(() =>
    EditorState.createEmpty()
  );

  const [output3State, setOutput3State] = useState(() =>
    EditorState.createEmpty()
  );

  const [output4State, setOutput4State] = useState(() =>
    EditorState.createEmpty()
  );
  const [explainationState, setExplainationState] = useState(() =>
    EditorState.createEmpty()
  );

  const [constraintsState, setConstraintsState] = useState(() =>
    EditorState.createEmpty()
  );
  const [problemData, setProblemData] = useState();
  const editorRef = useRef(null);
  const [testcaseinput, setTestcaseInput] = useState([]);
  const [testcaseoutput, setTestcaseOutput] = useState([]);
  const [hiddentestcaseinput, setHiddenTestcaseInput] = useState([]);
  const [hiddentestcaseoutput, setHiddenTestcaseOutput] = useState([]);
  // const [newTestCaseInput, setNewTestCaseInput] = useState([]);
  const [clangfinalres, setClangFinal] = useState([]);
  const [cppfinalres, setCppFinal] = useState([]);
  const [javafinalres, setJavaFinal] = useState([]);
  const [pythonfinalres, setPythonFinal] = useState([]);
  const [plainText, setPlainText] = useState("");
  const [c_editor_data, setCEditorData] = useState("");
  const [cpp_editor_data, setCppEditorData] = useState("");
  const [java_editor_data, setJavaEditorData] = useState("");
  const [python_editor_data, setPythonEditorData] = useState("");
  const [companies, setCompanies] = useState([]);
  const [selectedMulti, setselectedMulti] = useState(null);
  const [selectedMultiMandatory, setselectedMultiMandatory] = useState(null);

  const [matchedCompanies, setMatchedCompanies] = useState([]);
  const [hiddenTestCaseMsgC, setHiddenTestCaseMsgC] = useState("");
  const [hiddenTestCaseMsgCpp, setHiddenTestCaseMsgCpp] = useState("");
  const [hiddenTestCaseMsgJava, setHiddenTestCaseMsgJava] = useState("");
  const [hiddenTestCaseMsgPython, setHiddenTestCaseMsgPython] = useState("");
  const [cMsgClassName, setCMsgClassName] = useState("");
  const [cppMsgClassName, setCppMsgClassName] = useState("");
  const [javaMsgClassName, setJavaMsgClassName] = useState("");
  const [pythonMsgClassName, setPythonMsgClassName] = useState("");

  //  LOADER

  const [cIsLoading, setCIsLoading] = useState(false);
  const [cppIsLoading, setCppIsLoading] = useState(false);
  const [javaIsLoading, setJavaIsLoading] = useState(false);
  const [pythonIsLoading, setPythonIsLoading] = useState(false);

  const [Cistab, setCistab] = useState(false);
  const [cEditorValue, setCEditorValue] = useState("");
  const [cppEditorValue, setCppEditorValue] = useState("");
  const [javaEditorValue, setJavaEditorValue] = useState("");
  const [pythonEditorValue, setPythonEditorValue] = useState("");

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    console.log("editor........");
  }
  const cStubeditorRef = useRef(null);
  const cppStubeditorRef = useRef(null);
  const javaStubeditorRef = useRef(null);
  const pythonStubeditorRef = useRef(null);
  const addBoundaryComments = (editorRef, startComment, endComment) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection(); // Get the current selection
      const model = editor.getModel(); // Get the editor model
  
      if (selection && model) {
        const startLineNumber = selection.startLineNumber;
        const endLineNumber = selection.endLineNumber;
  
        // Add the start and end comments with a new line after the end comment
        const edits = [
          {
            range: {
              startLineNumber: startLineNumber,
              startColumn: 1,
              endLineNumber: startLineNumber,
              endColumn: 1,
            },
            text: `// ${startComment}\n`, // Insert start comment
          },
          {
            range: {
              startLineNumber: endLineNumber + 1,
              startColumn: 1,
              endLineNumber: endLineNumber + 1,
              endColumn: 1,
            },
            text: `\n// ${endComment}\n`, // Insert end comment with a new line after it
          },
        ];
  
        // Apply edits programmatically
        model.applyEdits(edits);
  
        // Update the state with the modified content
        const updatedValue = model.getValue();
        setCEditorValue(updatedValue);
      }
    }
  };
  

  function handleCEditorStubDidMount(editor, monaco) {
    cStubeditorRef.current = editor;
    console.log("editor........");
  }
  function handleCppEditorStubDidMount(editor, monaco) {
    cppStubeditorRef.current = editor;
    console.log("editor........");
  }
  function handleJavaEditorStubDidMount(editor, monaco) {
    javaStubeditorRef.current = editor;
    console.log("editor........");
  }
  function handlePythonEditorStubDidMount(editor, monaco) {
    pythonStubeditorRef.current = editor;
    console.log("editor........");
  }
  function handleEditorReset(editor, monaco) {
    editorRef.current.setValue("");
  }

  const cppeditorRef = useRef(null);

  function handleCppEditorDidMount(editor, monaco) {
    cppeditorRef.current = editor;
  }
  function handleCppEditorReset(editor, monaco) {
    cppeditorRef.current.setValue("");
  }
  const javaeditorRef = useRef(null);

  function handleJavaEditorDidMount(editor, monaco) {
    javaeditorRef.current = editor;
  }
  function handleJavaEditorReset(editor, monaco) {
    javaeditorRef.current.setValue("");
  }
  const pythoneditorRef = useRef(null);

  function handlePythonEditorDidMount(editor, monaco) {
    pythoneditorRef.current = editor;
  }
  function handlePythonEditorReset(editor, monaco) {
    pythoneditorRef.current.setValue("");
  }
  function showValue() {
    alert(editorRef.current.getValue());
  }
  function handleAddRowNested() {
    setRows1([
      ...rows1,
      { hidden_testcase_input: "", hidden_testcase_output: "" },
    ]);
  }
  function handleAddRowNestedTestcases() {
    setTestCaseData((oldArray) => [
      ...oldArray,
      { testcase_input: "", testcase_output: "" },
    ]);
    // const newElement = `<p>Hello world</p>`;
    // setHtmlElements(prevElements => [...prevElements, newElement]);
  }

  function handleAddRowNestedHiddenTestcases() {
    console.log(hiddenTestCaseData);
    setHiddenTestCaseData((oldArray) => [
      ...oldArray,
      { hidden_testcase_input: "", hidden_testcase_output: "" },
    ]);
    // const newElement = `<p>Hello world</p>`;
    // setHtmlElements(prevElements => [...prevElements, newElement]);
  }

  function handleRemoveRow(e, index) {
    const rows = [...rows1];
    rows.splice(index, 1);

    setRows1(rows);
  }

  function handleRemoveRows(e, index) {
    const rows = [...testCaseOldData];
    rows.splice(index, 1);
    setTestCaseOldData(rows);
  }

  function handleRemoveRows1(e, index) {
    const testcaseData = [...testCaseData];
    testcaseData.splice(index, 1);
    setTestCaseData(testcaseData);
  }

  function handleRemoveHiddenRows(e, index) {
    const rows = [...hiddenTestCaseOldData];
    rows.splice(index, 1);
    setHiddenTestCaseOldData(rows);
  }

  function handleRemoveHiddenRows1(e, index) {
    const testcaseData = [...hiddenTestCaseData];
    testcaseData.splice(index, 1);
    setHiddenTestCaseData(testcaseData);
  }

  const companyOptionGroup = companies.map((ele) => {
    // console.log(ele)
    return { label: ele.company_name, value: ele._id };
  });

  const tagOptionGroup = tags.map((ele) => {
    // console.log(ele)
    return { label: ele.tag_name, value: ele._id };
  });

  const mandatoryTagOptionGroup = mandatoryTags.map((ele) => {
    // console.log(ele)
    return { label: ele.tag_name + `-(${ele.technology_name})`, value: ele._id };
  });
  let headers;
  useEffect(() => {
    const item = JSON.parse(localStorage.getItem('authUser'));
    if (item) {
      headers = {
        'Authorization': `Bearer ${item.Access_Token}`,
        'Content-Type': 'application/json',
      };
    }
    const baseURL =
      `${process.env.REACT_APP_BACKEND_URL}get-problem/` + params.problemId;
    axiosAPI
      .get(baseURL, { headers })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data[0]);
          //assigning testcase_input and output to setTestCaseOldData as oldtestcase data
          res.data[0]["testcase_input"].map((ele, i) => {
            setTestCaseOldData((oldArray) => [
              ...oldArray,
              {
                testcase_input: ele,
                testcase_output: res.data[0]["testcase_output"][i],
              },
            ]);
          });
          //assigning hidden_testcase_input and output to setHiddenTestCaseOldData as oldHiddenTestcase data
          res.data[0]["hidden_testcase_input"].map((ele, i) => {
            setHiddenTestCaseOldData((oldArray) => [
              ...oldArray,
              {
                hidden_testcase_input: ele,
                hidden_testcase_output:
                  res.data[0]["hidden_testcase_output"][i],
              },
            ]);
          });
          setData(res.data[0]);
          setCEditorValue(res.data[0].c_stub_editor_data.c_stub_code || "");
          setCppEditorValue(res.data[0].cpp_stub_editor_data.cpp_stub_code || "");
          setJavaEditorValue(res.data[0].java_stub_editor_data.java_stub_code || "");
          setPythonEditorValue(res.data[0].python_stub_editor_data.python_stub_code || "");
          setProblemData(res.data[0]["problem_data"]);
          setSelectedTag(res.data[0].tags)
          setSelectedMandatoryTag(res.data[0].mandatory_tags)

          // setNewTestCaseInput({
          //     "testcase_input": res.data.problem[0]['testcase_input'],
          //     "testcase_output": res.data.problem[0]['testcase_output']
          // })

          for (
            let i = 0;
            i < res.data[0]["testcase_input"].length;
            i++
          ) {
            testcases_input.push(res.data[0]["testcase_input"][i]);
          }
          for (
            let i = 0;
            i < res.data[0]["testcase_output"].length;
            i++
          ) {
            testcases_output.push(res.data[0]["testcase_output"][i]);
          }
          setTestcaseInput(testcases_input);
          setTestcaseOutput(testcases_output);

          let selectedCompanies = [];
          const selectedValuesFromDatabase = res.data[0]["companies"];
          const temp = selectedValuesFromDatabase.map((value) => {
            const companyURL =
              `${process.env.REACT_APP_BACKEND_URL}get-company/` + value;
            axiosAPI.get(companyURL).then((res) => {
              console.log(res.data["company_name"]);
              selectedCompanies.push({
                label: res.data.company_name,
                value: res.data._id,
              });
              const formattedSelectedValues = selectedCompanies.map((ele) => ({
                label: ele.label,
                value: ele.value,
              }));
              setselectedMulti(formattedSelectedValues);
            });
          });
          let problemCompanies = res.data[0]["companies"];
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [params.id]);

  useEffect(() => {
    console.log(selectedMulti);
    const companiesURL = `${process.env.REACT_APP_BACKEND_URL}companies-list`;
    axiosAPI.get(companiesURL).then((res) => {
      companyOptionGroup.length = 0;
      res.data.companies.map((ele, i) => {
        if (data.companies?.includes(ele._id)) {
          console.log("element exits");
        } else {
          companyOptionGroup.push({
            label: ele.company_name,
            value: ele._id,
          });
        }
      });
    })
      .catch((er) => console.log("company option " + er))
  }, [selectedMulti]);

  useEffect(() => {
    // Update the editor state when 'data' changes
    if (data.problem_data && data.problem_data.problem_desc) {
      const defaultContent = data.problem_data.problem_desc;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setEditorState(EditorState.createWithContent(contentState));
    }
    if (data.problem_data && data.problem_data.input_format) {
      const defaultContent = data.problem_data.input_format;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setInputFormatState(EditorState.createWithContent(contentState));
    }
    if (data.problem_data && data.problem_data.output_format) {
      const defaultContent = data.problem_data.output_format;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setOutputFormatState(EditorState.createWithContent(contentState));
    }

    if (data.problem_data && data.problem_data.input) {
      const defaultContent = data.problem_data.input;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setInputState(EditorState.createWithContent(contentState));
    }

    if (data.problem_data && data.problem_data.input2) {
      const defaultContent = data.problem_data.input2;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setInput2State(EditorState.createWithContent(contentState));
    }

    if (data.problem_data && data.problem_data.input3) {
      const defaultContent = data.problem_data.input3;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setInput3State(EditorState.createWithContent(contentState));
    }

    if (data.problem_data && data.problem_data.input4) {
      const defaultContent = data.problem_data.input4;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setInput4State(EditorState.createWithContent(contentState));
    }
    if (data.problem_data && data.problem_data.output) {
      const defaultContent = data.problem_data.output;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setOutputState(EditorState.createWithContent(contentState));
    }

    if (data.problem_data && data.problem_data.output2) {
      const defaultContent = data.problem_data.output2;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setOutput2State(EditorState.createWithContent(contentState));
    }

    if (data.problem_data && data.problem_data.output3) {
      const defaultContent = data.problem_data.output3;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setOutput3State(EditorState.createWithContent(contentState));
    }

    if (data.problem_data && data.problem_data.output4) {
      const defaultContent = data.problem_data.output4;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setOutput4State(EditorState.createWithContent(contentState));
    }

    if (data.problem_data && data.problem_data.explaination) {
      const defaultContent = data.problem_data.explaination;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setExplainationState(EditorState.createWithContent(contentState));
    }


    if (data.problem_data && data.problem_data.constraints) {
      const defaultContent = data.problem_data.constraints;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setConstraintsState(EditorState.createWithContent(contentState));
    }

    if (data.problem_data && data.problem_data.hint) {
      const defaultContent = data.problem_data.hint;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setHintState(EditorState.createWithContent(contentState));
    }

    if (data.problem_data && data.problem_data.editorial) {
      const defaultContent = data.problem_data.editorial;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setEditorialState(EditorState.createWithContent(contentState));
    }
  }, [data]);
  useEffect(() => {
    setLoading(true);
    const baseURL1 = `${process.env.REACT_APP_BACKEND_URL}get-users`;

    axiosAPI
      .get(baseURL1)
      .then((response) => {
        setUsers(response.data);
      })
      .finally(() => {
        setLoading(false);
      });

    const companyBaseURL = `${process.env.REACT_APP_BACKEND_URL}companies-list`;
    axiosAPI
      .get(companyBaseURL)
      .then((response) => {
        setCompanies(response.data);
      })
      .finally(() => {
        setLoading(false);
      });
    const tagsBaseURL = `${process.env.REACT_APP_BACKEND_URL}tags-list`;
    axiosAPI
      .get(tagsBaseURL)
      .then((response) => {

        setTags(response.data["tags"]);
      })
      .finally(() => {
        setLoading(false);
      });

    const mandatoryTagsBaseURL = `${process.env.REACT_APP_BACKEND_URL}mandatory-tags-list`;
    axiosAPI
      .get(mandatoryTagsBaseURL)
      .then((response) => {

        setMandatoryTags(response.data["tags"]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  const updateData = (e) => {
    temp = e.target.value;
    console.log(temp);
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };
  function toggleTab(tab) {
    if (activeTab !== tab) {
      if (tab >= 1 && tab <= 2) {
        setactiveTab(tab);
      }
    }
  }

  function toggleTabVertical(tab) {
    if (activeTabVartical !== tab) {
      if (tab >= 1 && tab <= 2) {
        setoggleTabVertical(tab);
      }
    }
  }

  function toggleTabProgress(tab) {
    if (activeTabProgress !== tab) {
      if (tab >= 1 && tab <= 2) {
        setactiveTabProgress(tab);

        if (tab === 1) {
          setprogressValue(50);
        }
        if (tab === 2) {
          setprogressValue(100);
        }
      }
    }
  }

  // Form validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,
    initialValues: {
      firstname: "Mark",
      lastname: "Otto",
      city: "City",
      state: "State",
      zip: "Zip",
    },
    validationSchema: Yup.object({
      firstname: Yup.string().required("Please Enter Your First Name"),
      lastname: Yup.string().required("Please Enter Your Last Name"),
      city: Yup.string().required("Please Enter Your City"),
      state: Yup.string().required("Please Enter Your State"),
      zip: Yup.string().required("Please Enter Your Zip"),
    }),
    onSubmit: (values) => { },
  });
  //Submit
  const updateProblemSubmit = () => {
    testCaseData.map((ele, ind) => {
      testCaseOldData.push(ele);
    });
    hiddenTestCaseData.map((ele, ind) => {
      hiddenTestCaseOldData.push(ele);
    });
    data.problem_data = problemData;
    console.log(data);
    data.hidden_testcase_input.length = 0;
    data.hidden_testcase_output.length = 0;
    data.hidden_testcase_input = hiddenTestCaseOldData.map(
      (ele) => ele.hidden_testcase_input
    );
    data.hidden_testcase_output = hiddenTestCaseOldData.map(
      (ele) => ele.hidden_testcase_output
    );
    data.testcase_input.length = 0;
    data.testcase_output.length = 0;
    data.testcase_input = testCaseOldData.map((ele) => ele.testcase_input);
    data.testcase_output = testCaseOldData.map((ele) => ele.testcase_output);
    data.c_editor_data = {
      c_author: data.c_editor_data.c_author,
      c_code: editorRef.current.getValue(),
    };
    data.cpp_editor_data = {
      cpp_author: data.cpp_editor_data.cpp_author,
      cpp_code: cppeditorRef.current.getValue(),
    };
    data.java_editor_data = {
      java_author: data.java_editor_data.java_author,
      java_code: javaeditorRef.current.getValue(),
    };
    data.python_editor_data = {
      python_author: data.python_editor_data.python_author,
      python_code: pythoneditorRef.current.getValue(),
    };
    // data.added_by = added_by.email
    data.c_stub_editor_data = {
      c_stub_code: cStubeditorRef.current.getValue(),
    };
    data.cpp_stub_editor_data = {
      cpp_stub_code: cppStubeditorRef.current.getValue(),
    };
    data.java_stub_editor_data = {
      java_stub_code: javaStubeditorRef.current.getValue(),
    };
    data.python_stub_editor_data = {
      python_stub_code: pythonStubeditorRef.current.getValue(),
    };
    console.log(data)
    let currentTime = new Date();
    let curr_date_time = currentTime.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    data.updated_date = curr_date_time;
    data.updated_by = added_by.id;

    const baseURL =
      `${process.env.REACT_APP_BACKEND_URL}update-problem/` + params.problemId;
    axiosAPI
      .post(baseURL, data)
      .then((res) => {
        if (res.status == 200) {
          toast.success("Problem Updated", {
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
          navigate("/problems-list");
        }
      })
      .catch((error) => {
        toast.error("Problem update failed", {
          position: "top-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      });
  };
  const optionGroup = users.map((ele) => {
    return { label: ele.first_name, value: ele._id };
  });

  // const handleChange = (e) => {

  //     setData({
  //         ...data,
  //         [e.target.name]: e.target.value
  //     })
  // }
  const authorChange = (e) => {
    // setData({
    //     ...data,
    //     [e.target.name]: e.target.value
    // })
    // console.log(data.python_author)
    console.log(data);
    if (e.target.name == "c_author") {
      data.c_editor_data["c_author"] = e.target.value;
    } else if (e.target.name == "java_author") {
      data.java_editor_data["java_author"] = e.target.value;
    } else if (e.target.name == "cpp_author") {
      data.cpp_editor_data["cpp_author"] = e.target.value;
    } else if (e.target.name == "python_author") {
      data.python_editor_data["python_author"] = e.target.value;
    }
    console.log(data);
  };
  const handleOptionChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    console.log(data);
  };
  const handleOldTestcaseChange = (e, index) => {
    // console.log("i am getting changed")
    const { name, value } = e.target;
    console.log(index + " is the index value");
    console.log(testCaseData);

    setTestCaseOldData((prevFormItems) =>
      prevFormItems.map((item, i) =>
        i == index ? { ...item, [name]: value } : item
      )
    );
    console.log(testCaseOldData);
  };
  const handleTestcaseChange = (e, index) => {
    const { name, value } = e.target;
    console.log(index + " is the index value");
    console.log(testCaseData);
    setTestCaseData((prevFormItems) =>
      prevFormItems.map((item, i) =>
        i == index ? { ...item, [name]: value } : item
      )
    );
    console.log(testCaseData);
  };
  const handleOldHiddenTestcaseChange = (e, index) => {
    // console.log("i am getting changed")
    const { name, value } = e.target;

    setHiddenTestCaseOldData((prevFormItems) =>
      prevFormItems.map((item, i) =>
        i == index ? { ...item, [name]: value } : item
      )
    );
  };
  const handleHiddenTestcaseChange = (e, index) => {
    const { name, value } = e.target;
    setHiddenTestCaseData((prevFormItems) =>
      prevFormItems.map((item, i) =>
        i == index ? { ...item, [name]: value } : item
      )
    );
  };

  const coursesOptionGroup = courses.map((ele) => {
    return { label: ele.course_name, value: ele._id };
  });
  const tagsOptionGroup = tags.map((ele) => {
    return { label: ele.tag_name, value: ele._id };
  });
  const mandatoryTagsOptionGroup = tags.map((ele) => {
    return { label: ele.tag_name, value: ele._id };
  });
  const handleTagsOptionChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
    setSelectedTag(e.target.value)
  }
  const handleDateInputChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
  }
  const handleLevelOptionChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };
  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    setPlainText(draftToHtml(convertToRaw(editorState.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["problem_desc"]: plainText,
    });
  };
  const inputFormatStateChange = (inputFormatState) => {
    setInputFormatState(inputFormatState);
    setPlainText(draftToHtml(convertToRaw(inputFormatState.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["input_format"]: plainText,
    });
    // console.log(problemData)
  };

  const hintStateChange = (hintState) => {
    setHintState(hintState);
    setPlainText(draftToHtml(convertToRaw(hintState.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["hint"]: plainText,
    });
    // console.log(problemData)
  };

  const editorialStateChange = (editorialState) => {
    setEditorialState(editorialState);
    setPlainText(draftToHtml(convertToRaw(editorialState.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["editorial"]: plainText,
    });
    // console.log(problemData)
  };


  const outputFormatStateChange = (outputFormatState) => {
    setOutputFormatState(outputFormatState);
    setPlainText(draftToHtml(convertToRaw(outputFormatState.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["output_format"]: plainText,
    });
    // console.log(problemData)
  };
  const inputStateChange = (inputState) => {
    setInputState(inputState);
    setPlainText(draftToHtml(convertToRaw(inputState.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["input"]: plainText,
    });
    // console.log(problemData)
  };

  const input2StateChange = (input2State) => {
    setInput2State(input2State);
    setPlainText(draftToHtml(convertToRaw(input2State.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["input2"]: plainText,
    });
    // console.log(problemData)
  };

  const input3StateChange = (input3State) => {
    setInput3State(input3State);
    setPlainText(draftToHtml(convertToRaw(input2State.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["input3"]: plainText,
    });
    // console.log(problemData)
  };

  const input4StateChange = (input4State) => {
    setInput4State(input4State);
    setPlainText(draftToHtml(convertToRaw(input4State.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["input4"]: plainText,
    });
    // console.log(problemData)
  };


  const outputStateChange = (outputState) => {
    setOutputState(outputState);
    setPlainText(draftToHtml(convertToRaw(outputState.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["output"]: plainText,
    });
    // console.log(problemData)
  };

  const output2StateChange = (output2State) => {
    setOutput2State(output2State);
    setPlainText(draftToHtml(convertToRaw(output2State.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["output2"]: plainText,
    });
    // console.log(problemData)
  };

  const output3StateChange = (output3State) => {
    setOutput3State(output3State);
    setPlainText(draftToHtml(convertToRaw(output3State.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["output3"]: plainText,
    });
    // console.log(problemData)
  };

  const output4StateChange = (output4State) => {
    setOutput4State(output4State);
    setPlainText(draftToHtml(convertToRaw(output4State.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["output4"]: plainText,
    });
    // console.log(problemData)
  };

  const explainationStateChange = (explainationState) => {
    setExplainationState(explainationState);
    setPlainText(draftToHtml(convertToRaw(explainationState.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["explaination"]: plainText,
    });
    // console.log(problemData)
  };




  const constraintStateChange = (constraintsState) => {
    setConstraintsState(constraintsState);
    setPlainText(draftToHtml(convertToRaw(constraintsState.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["constraints"]: plainText,
    });
    // console.log(problemData)
  };
  const options = {
    autoIndent: "full",
    contextmenu: true,
    fontFamily: "monospace",
    fontSize: 17,
    lineHeight: 24,
    hideCursorInOverviewRuler: true,
    matchBrackets: "always",
    minimap: {
      enabled: true,
    },
    scrollbar: {
      horizontalSliderSize: 4,
      verticalSliderSize: 18,
    },
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: "line",
    automaticLayout: true,
    dragAndDrop: true,
  };
  // const [userTheme, setUserTheme] = useState("vs-dark");
  const themes = [
    { value: "vs-dark", label: "Dark" },
    { value: "light", label: "Light" },
  ];
  const optionGroups = themes.map((ele) => {
    return { label: ele.label, value: ele.value };
  });

  const Offsymbol = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 12,
          color: "#fff",
          paddingRight: 2,
        }}
      >
        {" "}
        <i className="fas fa-moon"></i>
      </div>
    );
  };

  const OnSymbol = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 12,
          color: "#fff",
          paddingRight: 2,
        }}
      >
        {" "}
        <i className="dripicons-brightness-max"></i>
      </div>
    );
  };
  function toggleTheme() {
    setswitch1(!switch1);
    let temp = theme === "light" ? "vs-dark" : "light";
    setEditorTheme(temp);
  }
  useEffect(() => {
    switch1 == true
      ? setSwitchValue((prevstate) => !prevstate)
      : setSwitchValue((prevstate) => !prevstate);
  }, [switch1]);

  const handleRunCode = (lang) => {
    let finalTestCases = testCaseOldData.concat(testCaseData);
    let finalHiddenTestCases = hiddenTestCaseOldData.concat(hiddenTestCaseData);
    let finalTestCaseInput = [];
    let finalTestCaseOutput = [];
    let finalHiddenTestCaseInput = [];
    let finalHiddenTestCaseOutput = [];
    finalTestCases.map((ele) => {
      finalTestCaseInput.push(ele.testcase_input);
      finalTestCaseOutput.push(ele.testcase_output);
    });
    finalHiddenTestCases.map((ele) => {
      finalHiddenTestCaseInput.push(ele.hidden_testcase_input);
      finalHiddenTestCaseOutput.push(ele.hidden_testcase_output);
    });
    let code_editor_data;
    if (lang == "c") {
      setCIsLoading(true);
      code_editor_data = editorRef.current.getValue();
      setCEditorData(code_editor_data);
    } else if (lang == "cpp") {
      setCppIsLoading(true);
      code_editor_data = cppeditorRef.current.getValue();
      setCppEditorData(code_editor_data);
    } else if (lang == "java") {
      setJavaIsLoading(true);
      code_editor_data = javaeditorRef.current.getValue();
      setJavaEditorData(code_editor_data);
    } else {
      setPythonIsLoading(true);
      code_editor_data = pythoneditorRef.current.getValue();
      setPythonEditorData(code_editor_data);
    }

    const baseURL = `${process.env.REACT_APP_BACKEND_URL}run-compiler`;
    const dataa = {
      lang,
      code_editor_data,
      testcases_input: finalTestCaseInput,
      testcases_output: finalTestCaseOutput,
      hidden_testcases_input: finalHiddenTestCaseInput,
      hidden_testcases_output: finalHiddenTestCaseOutput,
    };
    console.log(dataa);
    axiosAPI
      .post(baseURL, dataa)
      .then((res) => {
        setTemp(res.data);
        setCIsLoading(false);
        setCppIsLoading(false);
        setJavaIsLoading(false);
        setPythonIsLoading(false);
        // console.log(res.data)
      })
      .catch((error) => {
        console.log(error);
      });
    //    console.log(temp1)
  };
  useEffect(() => {
    let finalTestCases = testCaseOldData.concat(testCaseData);
    let finalHiddenTestCases = hiddenTestCaseOldData.concat(hiddenTestCaseData);
    let finalTestCaseInput = [];
    let finalTestCaseOutput = [];
    let finalHiddenTestCaseInput = [];
    let finalHiddenTestCaseOutput = [];
    finalTestCases.map((ele) => {
      finalTestCaseInput.push(ele.testcase_input);
      finalTestCaseOutput.push(ele.testcase_output);
    });
    finalHiddenTestCases.map((ele) => {
      finalHiddenTestCaseInput.push(ele.hidden_testcase_input);
      finalHiddenTestCaseOutput.push(ele.hidden_testcase_output);
    });

    let cur_hidden_output = temp1["hidden_testcases_response"];
    if (typeof cur_hidden_output != "undefined") {
      cur_hidden_output = cur_hidden_output.map((ele) => ele.output.trim());

      if (
        JSON.stringify(finalHiddenTestCaseOutput) ===
        JSON.stringify(cur_hidden_output)
      ) {
        if (temp1["lang"] == "c") {
          setHiddenTestCaseMsgC("All Hidden testcases passed");
          setCMsgClassName("text-success");
        } else if (temp1["lang"] == "cpp") {
          setHiddenTestCaseMsgCpp("All Hidden testcases passed");
          setCppMsgClassName("text-success");
        } else if (temp1["lang"] == "java") {
          setHiddenTestCaseMsgJava("All Hidden testcases passed");
          setJavaMsgClassName("text-success");
        } else if (temp1["lang"] == "python") {
          setHiddenTestCaseMsgPython("All Hidden testcases passed");
          setPythonMsgClassName("text-success");
        }
      } else {
        if (temp1["lang"] == "c") {
          setHiddenTestCaseMsgC("Some hidden testcases are failed");
          setCMsgClassName("text-warning");
        } else if (temp1["lang"] == "cpp") {
          setHiddenTestCaseMsgCpp("Some hidden testcases are failed");
          setCppMsgClassName("text-warning");
        } else if (temp1["lang"] == "java") {
          setHiddenTestCaseMsgJava("Some hidden testcases are failed");
          setJavaMsgClassName("text-warning");
        } else if (temp1["lang"] == "python") {
          setHiddenTestCaseMsgPython("Some hidden testcases are failed");
          setPythonMsgClassName("text-warning");
        }
      }
    }

    let cur_sample_output = temp1["testcases_response"];
    let cur_sample_output1;
    if (typeof cur_sample_output != "undefined") {
      cur_sample_output1 = cur_sample_output.map((ele) => {
        return ele.output.trim();
      });
      let resultObj = [];
      for (let i = 0; i < cur_sample_output.length; i++) {
        if (cur_sample_output1[i] == finalTestCaseOutput[i]) {
          resultObj.push({
            id: i + 1,
            TestCase1: "TestCase-" + (i + 1),
            Input: finalTestCaseInput[i],
            Output: finalTestCaseOutput[i],
            YourOutput: cur_sample_output1[i],
            memory: cur_sample_output[i]["memory"],
            cpuTime: cur_sample_output[i]["cpuTime"],
            Result: "pass",
          });
        } else {
          resultObj.push({
            id: i + 1,
            TestCase1: "TestCase-" + (i + 1),
            Input: finalTestCaseInput[i],
            Output: finalTestCaseOutput[i],
            YourOutput: cur_sample_output1[i],
            memory: cur_sample_output[i]["memory"],
            cpuTime: cur_sample_output[i]["cpuTime"],
            Result: "fail",
          });
        }
      }
      // console.log(resultObj)
      if (temp1.lang == "c") {
        setClangFinal(resultObj);
      } else if (temp1.lang == "cpp") {
        setCppFinal(resultObj);
      } else if (temp1.lang == "java") {
        setJavaFinal(resultObj);
      } else if (temp1.lang == "python") {
        setPythonFinal(resultObj);
      }
    }
  }, [temp1]);

  const validateEditorContent = (editorState) => {
    const contentState = editorState.getCurrentContent();
    return !contentState.hasText();
  };

  const validate = (values) => {
    console.log(plainText);
    const errors = {};
    const field_required_regex = /^[A-Za-z0-9_-]*$/;

    //Toast validation for Problem name
    if (!values.problem_name) {
      errors.problem_name = "Problem name is required!";
      toast.error("Required Problem name!", {
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
    //Toast validation for course content
    else if (!values.complexity) {
      errors.complexity = "Required Complexity";
      toast.error("Required Complexity!", {
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
    //Toast validation for level
    // else if (!values.level) {
    //   errors.level = "Required level";
    //   toast.error("Required level!", {
    //     position: "top-right",
    //     hideProgressBar: false,
    //     closeOnClick: true,
    //     pauseOnHover: true,
    //   });
    // }
    //Toast validation for author
    else if (!values.author) {
      errors.author = "Required author";
      toast.error("Required author!", {
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } else {
      if (editorState) {
        const isValidContent = validateEditorContent(editorState); //Toast validation for problem description
        if (isValidContent) {
          errors.problem_des = "Required problem description";
          toast.error("Required problem description!", {
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }
      }
      if (inputFormatState) {
        const isValidContent = validateEditorContent(inputFormatState);
        console.log(isValidContent);
        if (isValidContent) {
          errors.input_format = "Required input format";
          toast.error("Required input format!", {
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }
      }
      if (outputFormatState) {
        const isValidContent = validateEditorContent(outputFormatState);
        if (isValidContent) {
          errors.output_format = "Required output format";
          toast.error("Required output format!", {
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }
      }
      if (inputState) {
        const isValidContent = validateEditorContent(inputState);
        if (isValidContent) {
          errors.input = "Required input";
          toast.error("Required input value!", {
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }
      }
      if (outputState) {
        const isValidContent = validateEditorContent(outputState);
        if (isValidContent) {
          errors.output = "Required output";
          toast.error("Required output value!", {
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }
      }
      if (constraintsState) {
        const isValidContent = validateEditorContent(constraintsState);
        if (isValidContent) {
          errors.constraints = "Required Constraints";
          toast.error("Required Constraints!", {
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }
      }
    }

    console.log(errors);
    return errors;
  };
  const testcase_validate = () => {
    const errors = {};
    // console.log(testcaseinput)
    //Toast validation for testcase_input
    if (testCaseOldData.length == 0) {
      errors.problem_des = "Required sample testcase input-";
      toast.error("Required sample testcase input-", {
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } else {
      testCaseOldData.map((ele, i) => {
        if (ele.testcase_input == "") {
          errors.testcase_input = "Required sample testcase input-" + (i + 1);
          toast.error("Required sample testcase input-" + (i + 1) + "!", {
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }
      });
    }
    return errors;
  };
  function handleMultipleCompany(selectedOptions) {
    console.log(selectedOptions);
    setselectedMulti(selectedOptions);
    const objj = selectedOptions.map((ele) => {
      return ele.value;
    });
    // console.log(objj)
    setData({
      ...data,
      ["companies"]: objj,
    });
  }

  function handleMultipleTag(selectedOptions) {
    console.log(selectedOptions);
    setselectedMulti(selectedOptions);
    const objj = selectedOptions.map((ele) => {
      return ele.value;
    });
    // console.log(objj)
    setData({
      ...data,
      ["tags"]: objj,
    });
  }
  function handleMultipleMandatoryTag(selectedOptions) {
    console.log(selectedOptions);
    setselectedMultiMandatory(selectedOptions);
    const objj = selectedOptions.map((ele) => {
      return ele.value;
    });
    // console.log(objj)
    setData({
      ...data,
      ["mandatory_tags"]: objj,
    });
  }
  document.title = "Edit Problems | Technical Hub";


  const imageUploadCallback = (file) => {

    return new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.onloadend = () => {

        // Simulate uploading the image to your server

        // In a real-world case, you would upload to a server and get the URL back

        const imageUrl = reader.result;

        resolve({ data: { link: imageUrl } });  // Returning the image URL

      };

      reader.onerror = reject;

      reader.readAsDataURL(file);  // Convert image to Data URL (Base64)

    });


  };


  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [Sqlimages, setSqlimages] = useState([])
  const [Sqlgetimages, setSqlgetimages] = useState(true)
  useEffect(() => {
    try {
      axios.get(`${process.env.REACT_APP_BACKEND_URL}get-sql-images`)
        .then((res) => {
          // console.log(res.data)/
          setSqlimages(res.data)
        })
    } catch (err) {
      console.log(err)
    }
  }, [Sqlgetimages])


  const [SqlImage, setSqlImage] = useState(null);
  const SqlImageUpload = async (event) => {
    // console.log(event.target.files[0])

    setSqlImage(event.target.files[0])
  }

  const UploadingSqlImage = async () => {
    if (SqlImage == null) {
      toast.error("No File Selected", {
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
    else {
      const MyFormData = new FormData()
      MyFormData.append('file', SqlImage)
      try {
        const response = await axios.post(process.env.REACT_APP_BACKEND_URL + "sql-image-upload", MyFormData);
        console.log(response.status)
        if (response.status == 200) {
          toast.success("Image Uploaded", {
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
          setSqlgetimages(!Sqlgetimages)
        }
        else if (response.status == 205) {
          toast.error("Extension not supported", {
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }
        else {
          toast.error("Internal Server Error", {
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }
      }
      catch (err) {
        toast.error(err, {
          position: "top-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      }
    }

  }
  // State for current active Tab
  const [currentActiveTab, setCurrentActiveTab] = useState('c1');

  // Toggle active state for Tab
  const toggle = (tab) => {
    if (currentActiveTab !== tab) {
      setCurrentActiveTab(tab); // Update the active tab
    }
  };
  return (
    <React.Fragment>
      <div className="page-content">
        {/* <Container fluid={true}>
          <Breadcrumbs
            maintitle="Owlcoder Level problems"
            title="Forms"
            breadcrumbItem="Edit Form "
          /> */}
        <Form>
          <Row>
            <Col sm="12">
              <Card>
                <CardBody>
                  <h4 className="card-title mb-4">Edit Problem</h4>
                  <div className="form-horizontal form-wizard-wrapper wizard clearfix">
                    <div className="steps clearfix">
                      <ul>
                        <NavItem
                          className={classnames({ current: activeTab === 1 })}
                        >
                          <NavLink
                            className={classnames({
                              current: activeTab === 1,
                            })}
                            onClick={() => {
                              setactiveTab(1);
                            }}
                          >
                            <span className="number">1.</span> Edit problem
                          </NavLink>
                        </NavItem>
                        <NavItem
                          className={classnames({ current: activeTab === 2 })}
                        >
                          <NavLink
                            className={classnames({
                              active: activeTab === 2,
                            })}
                            onClick={() => {
                              setactiveTab(2);
                            }}
                          >
                            <span className="number">2.</span> Add and edit
                            Test Cases
                          </NavLink>
                        </NavItem>
                        <NavItem
                          className={classnames({ current: activeTab === 3 })}
                        >
                          <NavLink
                            className={classnames({
                              active: activeTab === 3,
                            })}
                            onClick={() => {
                              setactiveTab(3);
                            }}
                          >
                            <span className="number">3.</span>
                            Run your Code
                          </NavLink>
                        </NavItem>
                      </ul>
                    </div>
                    <div className="content clearfix">
                      <TabContent activeTab={activeTab} className="body">
                        <TabPane tabId={1}>
                          <Row>
                            <Col md={12}>
                              <Row className="mb-3">
                                <label
                                  htmlFor="problem_name"
                                  className="col-lg-3 col-form-label"
                                >
                                  Problem Name
                                </label>
                                <div className="col-lg-9">
                                  <Input
                                    id=""
                                    name="problem_name"
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter your problem name"
                                    onChange={updateData}
                                    defaultValue={data.problem_name}
                                    onBlur={validation.handleBlur}
                                    invalid={
                                      validation.touched.problem_name &&
                                        validation.errors.problem_name
                                        ? true
                                        : false
                                    }
                                  />
                                </div>
                              </Row>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <Row className="mb-3">
                                <label
                                  htmlFor="complexity"
                                  className="col-lg-3 col-form-label"
                                >
                                  Problem Complexity
                                </label>
                                <div className="col-lg-9">
                                  <div className="form-check form-check-inline">
                                    <Input
                                      type="radio"
                                      id="complexity"
                                      name="complexity"
                                      className="form-check-input"
                                      onChange={handleOptionChange}
                                      value="easy"
                                    // checked={
                                    //   data.complexity == "easy" ?? ""
                                    // }
                                    />
                                    <Label
                                      className="form-check-label"
                                      htmlFor="customRadioInline1"
                                    >
                                      Easy
                                    </Label>
                                  </div>
                                  <div className="form-check form-check-inline">
                                    <Input
                                      type="radio"
                                      id="complexity"
                                      name="complexity"
                                      className="form-check-input"
                                      onChange={handleOptionChange}
                                      value="medium"
                                    // checked={
                                    //   data.complexity == "medium" ?? ""
                                    // }
                                    />
                                    <Label
                                      className="form-check-label"
                                      htmlFor="customRadioInline2"
                                    >
                                      Medium
                                    </Label>
                                  </div>
                                  <div className="form-check form-check-inline">
                                    <Input
                                      type="radio"
                                      id="complexity"
                                      name="complexity"
                                      className="form-check-input"
                                      onChange={handleOptionChange}
                                      value="hard"
                                    // checked={
                                    //   data.complexity == "hard" ?? ""
                                    // }
                                    />
                                    <Label
                                      className="form-check-label"
                                      htmlFor="customRadioInline2"
                                    >
                                      Hard
                                    </Label>
                                  </div>
                                </div>
                              </Row>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={12}>
                              <Row className="mb-3">
                                <label
                                  htmlFor="txtTagBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Tags
                                </label>
                                <div className="col-lg-9">
                                  <Select
                                    name="mapped_to"
                                    value={Array.isArray(data.tags)
                                      ? data.tags.map(tagId => {
                                        const selectedOption = tagOptionGroup.find(option => option.value === tagId);
                                        return selectedOption || { value: tagId, label: tagId };
                                      })
                                      : []
                                    }
                                    isMulti={true}
                                    onChange={handleMultipleTag}
                                    options={tagOptionGroup}
                                    classNamePrefix="select2-selection"
                                  />
                                </div>
                              </Row>
                            </Col>

                          </Row>

                          <Row>
                            <Col md={12}>
                              <Row className="mb-3">
                                <label
                                  htmlFor="txtTagBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Mandatory Tags
                                </label>
                                <div className="col-lg-9">
                                  <Select
                                    name="mapped_to"
                                    value={Array.isArray(data.mandatory_tags)
                                      ? data.mandatory_tags.map(tagId => {
                                        const selectedOption = mandatoryTagOptionGroup.find(option => option.value === tagId);
                                        return selectedOption || { value: tagId, label: tagId };
                                      })
                                      : []
                                    }
                                    isMulti={true}
                                    onChange={handleMultipleMandatoryTag}
                                    options={mandatoryTagOptionGroup}
                                    classNamePrefix="select2-selection"
                                  />
                                </div>
                              </Row>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={12}>
                              <Row className="mb-3">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Companies
                                </label>
                                <div className="col-lg-9">
                                  <Select
                                    name="mapped_to"
                                    value={Array.isArray(data.companies)
                                      ? data.companies.map(companyId => {
                                        const selectedOption = companyOptionGroup.find(option => option.value === companyId);
                                        return selectedOption || { value: companyId, label: companyId };
                                      })
                                      : []
                                    }
                                    isMulti={true}
                                    onChange={handleMultipleCompany}
                                    options={companyOptionGroup}
                                    classNamePrefix="select2-selection"
                                  />
                                </div>
                              </Row>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={12}>
                              <Row className="mb-3">
                                <label
                                  htmlFor="video_url"
                                  className="col-lg-3 col-form-label"
                                >
                                  Video Url
                                </label>
                                <div className="col-lg-9">
                                  <Input
                                    id=""
                                    name="video_url"
                                    type="text"
                                    className="form-control"
                                    placeholder="Paste your video link here"
                                    onChange={updateData}
                                    defaultValue={data.video_url}
                                    onBlur={validation.handleBlur}
                                    invalid={
                                      validation.touched.video_url &&
                                        validation.errors.video_url
                                        ? true
                                        : false
                                    }
                                  />
                                </div>
                              </Row>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={12}>
                              <Row className="mb-3">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Choose Images
                                </label>
                                <div className="col-lg-9">
                                  <BUTTON variant="primary" onClick={handleShow} className="w-25 mb-4">
                                    Show Images
                                  </BUTTON>
                                </div>
                              </Row>
                            </Col>
                          </Row>
                          <Modal
                            show={show}
                            onHide={handleClose}
                            backdrop="static"
                            keyboard={false}
                            centered
                            size="xl" // Use the size prop to make the modal large
                          >
                            <Modal.Header closeButton>
                              <Modal.Title>Uploaded Images</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              <Row>
                                <Col md="6" className="mb-4">
                                  <input
                                    className="form-control"
                                    type="file"
                                    id="formFile"
                                    name="file"
                                    onChange={(event) => SqlImageUpload(event)}
                                  />
                                </Col>
                                <Col md="6">
                                  <Button variant="secondary" onClick={UploadingSqlImage}>
                                    Upload Image
                                  </Button>
                                </Col>
                              </Row>
                              <div className="SqlImages">
                                {Sqlimages?.map((ele, index) => (
                                  <img
                                    key={index}
                                    className="ImagesForUpload"
                                    src={ele}
                                    alt="Sql Image"
                                  />
                                ))}
                              </div>
                            </Modal.Body>
                            <Modal.Footer>

                              <Button variant="secondary" onClick={handleClose}>
                                Close
                              </Button>
                            </Modal.Footer>
                          </Modal>
                          <Row>
                            <Col md={12}>
                              <Row className="mb-3">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Problem Description
                                </label>
                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        editorState={editorState}
                                        onEditorStateChange={(
                                          newEditorState
                                        ) => {
                                          setEditorState(newEditorState);
                                          onEditorStateChange(newEditorState);
                                        }}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="problem_desc"
                                        className="text-area"
                                        value={editorState
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={12}>
                              <Row className="mb-3">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Select Images
                                </label>
                                <div className="col-lg-9">

                                </div>
                              </Row>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={12}>
                              <Row className="mb-3">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Problem Hint
                                </label>
                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        editorState={hintState}
                                        onEditorStateChange={(
                                          newEditorState
                                        ) => {
                                          setHintState(newEditorState);
                                          hintStateChange(newEditorState);
                                        }}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="hint"
                                        className="text-area"
                                        value={hintState
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={12}>
                              <Row className="mb-3">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Problem Editorial
                                </label>
                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        editorState={editorialState}
                                        onEditorStateChange={(
                                          newEditorState
                                        ) => {
                                          setEditorialState(newEditorState);
                                          editorialStateChange(newEditorState);
                                        }}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="editorial"
                                        className="text-area"
                                        value={editorialState
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>


                          <Row>
                            <Col md={12}>
                              <Row className="mb-3 ">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Input Format
                                </label>

                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        name="input_format"
                                        editorState={inputFormatState}
                                        onEditorStateChange={(
                                          inputFormatState
                                        ) => {
                                          setInputFormatState(inputFormatState);
                                          inputFormatStateChange(inputFormatState);
                                        }}
                                        // inputFormatState={inputFormatState}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        // onEditorStateChange={onEditorStateChange}
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="input_format"
                                        className="text-area "
                                        value={inputFormatState
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <Row className="mb-3 ">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Output Format
                                </label>

                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        name="output_format"
                                        editorState={outputFormatState}
                                        onEditorStateChange={(
                                          outputFormatState
                                        ) => {
                                          setOutputFormatState(outputFormatState);
                                          outputFormatStateChange(outputFormatState);
                                        }}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        // onEditorStateChange={onEditorStateChange}
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="output_format"
                                        className="text-area "
                                        value={outputFormatState
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                          {/* Input 1 and output 1 */}
                          <Row>
                            <Col md={12}>
                              <Row className="mb-3 ">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Input
                                </label>

                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        name="input"
                                        editorState={inputState}
                                        onEditorStateChange={(
                                          inputState
                                        ) => {
                                          setInputState(inputState);
                                          inputStateChange(inputState);
                                        }}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        // onEditorStateChange={onEditorStateChange}
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="input"
                                        className="text-area "
                                        value={inputState
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <Row className="mb-3 ">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Output{" "}
                                </label>

                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        name="output"
                                        editorState={outputState}
                                        onEditorStateChange={(
                                          outputState
                                        ) => {
                                          setOutputState(outputState);
                                          outputStateChange(outputState);
                                        }}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        // onEditorStateChange={onEditorStateChange}
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="output"
                                        className="text-area "
                                        value={outputState
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>

                          {/* input and output 2  */}
                          <Row>
                            <Col md={12}>
                              <Row className="mb-3 ">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Input-2
                                </label>

                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        name="input2"
                                        editorState={input2State}
                                        onEditorStateChange={(
                                          input2State
                                        ) => {
                                          setInput2State(input2State);
                                          input2StateChange(input2State);
                                        }}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        // onEditorStateChange={onEditorStateChange}
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="input2"
                                        className="text-area "
                                        value={input2State
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <Row className="mb-3 ">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Output-2{" "}
                                </label>

                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        name="output2"
                                        editorState={output2State}
                                        onEditorStateChange={(
                                          output2State
                                        ) => {
                                          setOutput2State(output2State);
                                          output2StateChange(output2State);
                                        }}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        // onEditorStateChange={onEditorStateChange}
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="output2"
                                        className="text-area "
                                        value={output2State
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>

                          {/* input and output 3  */}
                          <Row>
                            <Col md={12}>
                              <Row className="mb-3 ">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Input-3
                                </label>

                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        name="input3"
                                        editorState={input3State}
                                        onEditorStateChange={(
                                          input3State
                                        ) => {
                                          setInput3State(input3State);
                                          input3StateChange(input3State);
                                        }}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        // onEditorStateChange={onEditorStateChange}
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="input3"
                                        className="text-area "
                                        value={input3State
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <Row className="mb-3 ">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Output-3{" "}
                                </label>

                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        name="output3"
                                        editorState={output3State}
                                        onEditorStateChange={(
                                          output3State
                                        ) => {
                                          setOutput3State(output3State);
                                          output3StateChange(output3State);
                                        }}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        // onEditorStateChange={onEditorStateChange}
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="output3"
                                        className="text-area "
                                        value={output2State
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>

                          {/* input and output 4  */}
                          <Row>
                            <Col md={12}>
                              <Row className="mb-3 ">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Input-4
                                </label>

                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        name="input4"
                                        editorState={input4State}
                                        onEditorStateChange={(
                                          input4State
                                        ) => {
                                          setInput4State(input4State);
                                          input4StateChange(input4State);
                                        }}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        // onEditorStateChange={onEditorStateChange}
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="input4"
                                        className="text-area "
                                        value={input4State
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <Row className="mb-3 ">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Output-4{" "}
                                </label>

                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        name="output4"
                                        editorState={output4State}
                                        onEditorStateChange={(
                                          output4State
                                        ) => {
                                          setOutput4State(output4State);
                                          output4StateChange(output4State);
                                        }}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        // onEditorStateChange={onEditorStateChange}
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="output4"
                                        className="text-area "
                                        value={output4State
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={12}>
                              <Row className="mb-3 ">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Explaination{" "}
                                </label>

                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        name="explaination"
                                        editorState={explainationState}
                                        onEditorStateChange={(
                                          explainationState
                                        ) => {
                                          setExplainationState(explainationState);
                                          explainationStateChange(explainationState);
                                        }}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        // onEditorStateChange={onEditorStateChange}
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="explaination"
                                        className="text-area "
                                        value={explainationState
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>


                          <Row>
                            <Col md={12}>
                              <Row className="mb-3 ">
                                <label
                                  htmlFor="txtCompanyBilling"
                                  className="col-lg-3 col-form-label"
                                >
                                  Constraints{" "}
                                </label>

                                <Col>
                                  <Card>
                                    <CardBody>
                                      <Editor
                                        name="constraints"
                                        editorState={constraintsState}
                                        onEditorStateChange={(
                                          constraintsState
                                        ) => {
                                          setConstraintsState(constraintsState);
                                          constraintStateChange(constraintsState);
                                        }}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        // onEditorStateChange={onEditorStateChange}
                                        toolbar={{
                                          image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                        }}
                                      />
                                      <textarea
                                        hidden={true}
                                        name="constraints"
                                        className="text-area "
                                        value={constraintsState
                                          .getCurrentContent()
                                          .getPlainText()} // Use the 'editorState' value here if you need it for form submission, etc.
                                        onChange={updateData}
                                      />
                                    </CardBody>
                                  </Card>
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                        </TabPane>
                        <TabPane tabId={2}>
                          <Row>
                            <Col xs={12}>
                              <Card>
                                <CardBody>
                                  <CardTitle className="h4">
                                    Sample Test cases
                                  </CardTitle>
                                  <React.Fragment>
                                    {data.testcase_input !== undefined &&
                                      data.testcase_input.length > 0 &&
                                      flag == false ? (
                                      <div
                                        data-repeater-list="group-a"
                                        id={"addr"}
                                      >
                                        {(flag = true)}
                                        <div
                                          data-repeater-item
                                          className="row"
                                        >
                                          {testCaseOldData?.map((ele, i) => (
                                            <div>
                                              <div className="row">
                                                <h1 className="card-title mb-4">
                                                  Test case-{i + 1}
                                                </h1>
                                                <div className="mb-3 col-lg-2 ">
                                                  <label
                                                    className="form-label"
                                                    htmlFor="name"
                                                  >
                                                    Input
                                                  </label>
                                                  <textarea
                                                    id="testcase_input"
                                                    name="testcase_input"
                                                    rows="4"
                                                    className="form-control"
                                                    placeholder="Enter your Input"
                                                    value={ele.testcase_input}
                                                    onChange={(e) =>
                                                      handleOldTestcaseChange(
                                                        e,
                                                        i
                                                      )
                                                    }
                                                  />
                                                </div>
                                                <div className="mb-3 col-lg-2">
                                                  <label
                                                    className="form-label"
                                                    htmlFor="email"
                                                  >
                                                    Output
                                                  </label>
                                                  <textarea
                                                    id="testcase_output"
                                                    name="testcase_output"
                                                    rows="4"
                                                    className="form-control"
                                                    placeholder="Enter your Output"
                                                    value={
                                                      testCaseOldData[i]
                                                        .testcase_output
                                                    }
                                                    onChange={(e) =>
                                                      handleOldTestcaseChange(
                                                        e,
                                                        i
                                                      )
                                                    }
                                                  />
                                                </div>
                                              </div>
                                              {i > 1 ? (
                                                <Col
                                                  lg={2}
                                                  className="align-self-center d-grid"
                                                >
                                                  <Button
                                                    color="primary"
                                                    className="btn-block inner"
                                                    style={{ width: "100%" }}
                                                    onClick={(e) => {
                                                      handleRemoveRows(e, i);
                                                    }}
                                                  >
                                                    {" "}
                                                    Delete{" "}
                                                  </Button>
                                                </Col>
                                              ) : (
                                                ""
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div></div>
                                    )}
                                    <div data-repeater-list="group-a">
                                      {testCaseData.map((e, inc) => (
                                        <div
                                          data-repeater-item
                                          className="row"
                                          key={inc}
                                        >
                                          {console.log(e)}
                                          <h1 className="card-title mb-4">
                                            Test case-
                                            {testCaseOldData.length + inc + 1}
                                          </h1>
                                          <div className="mb-3 col-lg-2">
                                            <label
                                              className="form-label"
                                              htmlFor="name"
                                            >
                                              Input
                                            </label>
                                            <textarea
                                              id="testcase_input"
                                              name="testcase_input"
                                              rows="4"
                                              className="form-control"
                                              placeholder="Enter your Input"
                                              value={e.testcase_input}
                                              onChange={(e) =>
                                                handleTestcaseChange(e, inc)
                                              }
                                            />
                                          </div>
                                          <div className="mb-3 col-lg-2">
                                            <label
                                              className="form-label"
                                              htmlFor="email"
                                            >
                                              Output
                                            </label>
                                            <textarea
                                              id="testcase_output"
                                              name="testcase_output"
                                              rows="4"
                                              className="form-control"
                                              placeholder="Enter your Output"
                                              value={e.testcase_output}
                                              onChange={(e) =>
                                                handleTestcaseChange(e, inc)
                                              }
                                            />
                                          </div>
                                          <Col
                                            lg={2}
                                            className="align-self-center d-grid"
                                          >
                                            {/* <input data-repeater-delete type="button" className="btn btn-primary" value="Delete" /> */}
                                            <Button
                                              color="primary"
                                              className="btn-block inner"
                                              style={{ width: "100%" }}
                                              onClick={(e) => {
                                                handleRemoveRows1(e, inc);
                                              }}
                                            >
                                              {" "}
                                              Delete{" "}
                                            </Button>
                                          </Col>
                                        </div>
                                      ))}
                                    </div>
                                  </React.Fragment>
                                  {/* ))} */}
                                  <Button
                                    onClick={() => {
                                      handleAddRowNestedTestcases();
                                    }}
                                    color="success"
                                    className="btn btn-success mt-3 mt-lg-0"
                                  >
                                    Add
                                  </Button>
                                  {/* </Form> */}
                                </CardBody>
                              </Card>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12}>
                              <Card>
                                <CardBody>
                                  <CardTitle className="h4">
                                    Hidden Test cases
                                  </CardTitle>
                                  <React.Fragment>
                                    {data.hidden_testcase_input !==
                                      undefined &&
                                      data.hidden_testcase_input.length > 0 &&
                                      hiddenflag == false ? (
                                      <div data-repeater-list="group-a">
                                        {(hiddenflag = true)}
                                        <div
                                          data-repeater-item
                                          className="row"
                                        >
                                          {hiddenTestCaseOldData?.map(
                                            (ele, i) => (
                                              <div>
                                                <div className="row">
                                                  <h1 className="card-title mb-4">
                                                    Hidden Testcase-{i + 1}
                                                  </h1>

                                                  <div className="mb-3 col-lg-2">
                                                    <label
                                                      className="form-label"
                                                      htmlFor="name"
                                                    >
                                                      Input
                                                    </label>
                                                    <textarea
                                                      id="hidden_testcase_input"
                                                      name="hidden_testcase_input"
                                                      rows="4"
                                                      className="form-control"
                                                      placeholder="Enter your Input"
                                                      value={
                                                        ele.hidden_testcase_input
                                                      }
                                                      onChange={(e) =>
                                                        handleOldHiddenTestcaseChange(
                                                          e,
                                                          i
                                                        )
                                                      }
                                                    ></textarea>
                                                  </div>

                                                  <div className="mb-3 col-lg-2">
                                                    <label
                                                      className="form-label"
                                                      htmlFor="email"
                                                    >
                                                      Output
                                                    </label>
                                                    <textarea
                                                      id="hidden_testcase_output"
                                                      name="hidden_testcase_output"
                                                      rows="4"
                                                      className="form-control"
                                                      placeholder="Enter your Output"
                                                      value={
                                                        hiddenTestCaseOldData[
                                                          i
                                                        ]
                                                          .hidden_testcase_output
                                                      }
                                                      onChange={(e) =>
                                                        handleOldHiddenTestcaseChange(
                                                          e,
                                                          i
                                                        )
                                                      }
                                                    ></textarea>
                                                  </div>
                                                </div>
                                                {i > 1 ? (
                                                  <Col
                                                    lg={2}
                                                    className="align-self-center d-grid"
                                                  >
                                                    <Button
                                                      color="primary"
                                                      className="btn-block inner"
                                                      style={{
                                                        width: "100%",
                                                      }}
                                                      onClick={(e) => {
                                                        handleRemoveHiddenRows(
                                                          e,
                                                          i
                                                        );
                                                      }}
                                                    >
                                                      {" "}
                                                      Delete{" "}
                                                    </Button>
                                                  </Col>
                                                ) : (
                                                  ""
                                                )}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div></div>
                                    )}
                                    <div data-repeater-list="group-a">
                                      {hiddenTestCaseData.map((e, inc) => (
                                        <div
                                          data-repeater-item
                                          className="row"
                                        >
                                          <h1 className="card-title mb-4">
                                            Hidden Test case-
                                            {hiddenTestCaseOldData.length +
                                              inc +
                                              1}
                                          </h1>

                                          <div className="mb-3 col-lg-2">
                                            <label
                                              className="form-label"
                                              htmlFor="name"
                                            >
                                              Input
                                            </label>
                                            <textarea
                                              id="hidden_testcase_input"
                                              name="hidden_testcase_input"
                                              rows="4"
                                              className="form-control"
                                              placeholder="Enter your Input"
                                              value={e.hidden_testcase_input}
                                              onChange={(e) =>
                                                handleHiddenTestcaseChange(
                                                  e,
                                                  inc
                                                )
                                              }
                                            ></textarea>
                                          </div>

                                          <div className="mb-3 col-lg-2">
                                            <label
                                              className="form-label"
                                              htmlFor="email"
                                            >
                                              Output
                                            </label>
                                            <textarea
                                              id="hidden_testcase_output"
                                              name="hidden_testcase_output"
                                              rows="4"
                                              className="form-control"
                                              placeholder="Enter your Output"
                                              value={e.hidden_testcase_output}
                                              onChange={(e) =>
                                                handleHiddenTestcaseChange(
                                                  e,
                                                  inc
                                                )
                                              }
                                            ></textarea>
                                          </div>
                                          <Col
                                            lg={2}
                                            className="align-self-center d-grid"
                                          >
                                            {/* <input data-repeater-delete type="button" className="btn btn-primary" value="Delete" /> */}
                                            <Button
                                              color="primary"
                                              className="btn-block inner"
                                              style={{ width: "100%" }}
                                              onClick={(e) => {
                                                handleRemoveHiddenRows1(
                                                  e,
                                                  inc
                                                );
                                              }}
                                            >
                                              {" "}
                                              Delete{" "}
                                            </Button>
                                          </Col>
                                        </div>
                                      ))}
                                    </div>
                                  </React.Fragment>

                                  <Button
                                    onClick={() => {
                                      handleAddRowNestedHiddenTestcases();
                                    }}
                                    color="success"
                                    className="btn btn-success mt-3 mt-lg-0"
                                  >
                                    Add
                                  </Button>
                                  {/* </Form> */}
                                </CardBody>
                              </Card>
                            </Col>
                          </Row>
                        </TabPane>
                        <TabPane tabId={3}>
                          <Row>
                            <Nav tabs>
                              <NavItem>
                                <NavLink
                                  className={classnames({ active: currentActiveTab === "c1" })}
                                  onClick={() => toggle("c1")}
                                >
                                  C
                                </NavLink>
                              </NavItem>
                              <NavItem>
                                <NavLink
                                  className={classnames({ active: currentActiveTab === "c2" })}
                                  onClick={() => toggle("c2")}
                                >
                                  C++
                                </NavLink>
                              </NavItem>
                              <NavItem>
                                <NavLink
                                  className={classnames({ active: currentActiveTab === "c3" })}
                                  onClick={() => toggle("c3")}
                                >
                                  Java
                                </NavLink>
                              </NavItem>
                              <NavItem>
                                <NavLink
                                  className={classnames({ active: currentActiveTab === "c4" })}
                                  onClick={() => toggle("c4")}
                                >
                                  Python
                                </NavLink>
                              </NavItem>
                            </Nav>

                            <TabContent activeTab={currentActiveTab}>
                              <TabPane tabId="c1">
                              <Row>
                              <Col sm="6">
                                <Row className="mb-3">
                                  <label
                                    htmlFor="ddlCreditCardType"
                                    className="col-lg-2 col-form-label"
                                  >
                                    C Language
                                  </label>
                                  {/* <input type="button" onClick={handleEditorReset} value="Reset" > */}
                                  <div className="col-lg-10 ">
                                    <button
                                      className="btn btn-light "
                                      type="button"
                                      onClick={handleEditorReset}
                                    >
                                      <i className="mdi mdi-replay"></i>{" "}
                                    </button>

                                    {/* <div className="col-lg-9"> */}
                                    {/* <Select className="col-lg-2" options={optionGroups}
                                                                        onChange={handleThemeChange}
                                                                        placeholder="Theme" />
                                                                    </div> */}

                                    <label
                                      htmlFor="ddlCreditCardType"
                                      className="col-form-label  ml-6"
                                    >
                                      Theme
                                    </label>
                                    <Switch
                                      uncheckedIcon={<Offsymbol />}
                                      checkedIcon={<OnSymbol />}
                                      onColor="#626ed4"
                                      onChange={toggleTheme}
                                      checked={switch1}
                                    />
                                  </div>
                                  &nbsp;
                                  <Editor1
                                    height="50vh"
                                    defaultLanguage="c"
                                    value={
                                      typeof data.c_editor_data !== "undefined"
                                        ? data.c_editor_data["c_code"]
                                        : ""
                                    }
                                    options={options}
                                    theme={theme}
                                    onMount={handleEditorDidMount}
                                  />
                                  <div className="authorDivision">
                                    <div className="authorName">
                                      <label
                                        htmlFor="txtCompanyBilling"
                                        className="authorLabel"
                                      >
                                        Author
                                      </label>
                                      <Input
                                        type="select"
                                        id="author"
                                        name="c_author"
                                        className="authorOptions"
                                        onChange={authorChange}
                                        defaultValue={
                                          data.c_editor_data
                                            ? data.c_editor_data.c_author
                                            : ""
                                        }
                                      >
                                        <option value="">
                                          --Please Select--
                                        </option>
                                        {optionGroup.map((option) =>
                                          // <option value={option.value} key={option.value}>{option.label}</option>
                                          data.c_editor_data ? (
                                            option.value ==
                                              data.c_editor_data.c_author ? (
                                              <option
                                                value={option.value}
                                                key={option.value}
                                                selected
                                              >
                                                {option.label}
                                              </option>
                                            ) : (
                                              <option
                                                value={option.value}
                                                key={option.value}
                                              >
                                                {option.label}
                                              </option>
                                            )
                                          ) : (
                                            <option
                                              value={option.value}
                                              key={option.value}
                                            >
                                              {option.label}
                                            </option>
                                          )
                                        )}
                                      </Input>
                                    </div>
                                    {/* <button className="buttonRun" type="button" onClick={() => handleRunCode("c")}>Run</button> */}

                                    <button
                                      color="primary"
                                      className="buttonRun"
                                      type="button"
                                      onClick={() => handleRunCode("c")}
                                    >
                                      {cIsLoading == true ? (
                                        <Spinner size="sm">Loading...</Spinner>
                                      ) : (
                                        ""
                                      )}
                                      <span>
                                        {cIsLoading == true
                                          ? " Compailing"
                                          : "Run"}
                                      </span>
                                    </button>
                                  </div>
                                </Row>
                                <Row>
                                  <Col sm="12">
                                    <h5>C Language Editor</h5>
                                    <div style={{ marginBottom: "10px" }}>
                                      <Button
                                        color="primary"
                                        onClick={() =>
                                          addBoundaryComments(
                                            cStubeditorRef,
                                            "Constrained code starts here",
                                            "Constrained code ends here"
                                          )
                                        }
                                      >
                                        Add Constrained Comments
                                      </Button>
                                      <Button
                                        color="secondary"
                                        onClick={() =>
                                          addBoundaryComments(
                                            cStubeditorRef,
                                            "Editable code starts here",
                                            "Editable code ends here"
                                          )
                                        }
                                        style={{ marginLeft: "10px" }}
                                      >
                                        Add Editable Comments
                                      </Button>
                                    </div>
                                    <Editor1
                                      height="50vh"
                                      defaultLanguage="c"
                                      value={cEditorValue}
                                      options={options}
                                      theme={theme}
                                      onMount={handleCEditorStubDidMount}
                                      onChange={(newValue) => setCEditorValue(newValue)}
                                    />
                                  </Col>
                                </Row>
                                </Col>
                                </Row>
                              </TabPane>
                              <TabPane tabId="c2">
                                <Row>
                                  <Col sm="6">


                                    <Row className="mb-3">
                                      <label
                                        htmlFor="ddlCreditCardType"
                                        className="col-lg-2 col-form-label"
                                      >
                                        CPP Language
                                      </label>
                                      {/* <input type="button" onClick={handleEditorReset} value="Reset" > */}
                                      <div className="col-lg-10 ">
                                        <button
                                          className="btn btn-light "
                                          type="button"
                                          onClick={handleCppEditorReset}
                                        >
                                          <i className="mdi mdi-replay"></i>{" "}
                                        </button>
                                        <label
                                          htmlFor="ddlCreditCardType"
                                          className="col-form-label  ml-6"
                                        >
                                          Theme
                                        </label>
                                        <Switch
                                          uncheckedIcon={<Offsymbol />}
                                          checkedIcon={<OnSymbol />}
                                          onColor="#626ed4"
                                          onChange={toggleTheme}
                                          checked={switch1}
                                        />
                                      </div>
                                      &nbsp;

                                      <Editor1
                                        height="50vh"
                                        defaultLanguage="cpp"
                                        value={
                                          typeof data.cpp_editor_data !==
                                            "undefined"
                                            ? data.cpp_editor_data["cpp_code"]
                                            : ""
                                        }
                                        options={options}
                                        theme={theme}
                                        onMount={handleCppEditorDidMount}
                                        ref={cppeditorRef}
                                      />
                                      <div className="authorDivision">
                                        <div className="authorName">
                                          <label
                                            htmlFor="txtCompanyBilling"
                                            className="authorLabel"
                                          >
                                            Author
                                          </label>
                                          <Input
                                            type="select"
                                            id="author"
                                            name="cpp_author"
                                            className="authorOptions"
                                            onChange={authorChange}
                                            defaultValue={
                                              data.cpp_editor_data
                                                ? data.cpp_editor_data.cpp_author
                                                : ""
                                            }
                                          >
                                            <option value="">
                                              --Please Select--
                                            </option>
                                            {optionGroup.map((option) =>
                                              // <option value={option.value} key={option.value}>{option.label}</option>
                                              data.cpp_editor_data ? (
                                                option.value ==
                                                  data.cpp_editor_data.cpp_author ? (
                                                  <option
                                                    value={option.value}
                                                    key={option.value}
                                                    selected
                                                  >
                                                    {option.label}
                                                  </option>
                                                ) : (
                                                  <option
                                                    value={option.value}
                                                    key={option.value}
                                                  >
                                                    {option.label}
                                                  </option>
                                                )
                                              ) : (
                                                <option
                                                  value={option.value}
                                                  key={option.value}
                                                >
                                                  {option.label}
                                                </option>
                                              )
                                            )}
                                          </Input>
                                        </div>

                                        <button
                                          color="primary"
                                          className="buttonRun"
                                          type="button"
                                          onClick={() => handleRunCode("cpp")}
                                        >
                                          {cppIsLoading == true ? (
                                            <Spinner size="sm">Loading...</Spinner>
                                          ) : (
                                            ""
                                          )}
                                          <span>
                                            {cppIsLoading == true
                                              ? " Compailing"
                                              : "Run"}
                                          </span>
                                        </button>

                                        {/* <button className="col-lg-1 btn btn-primary mt-4 mr-20" type="button" onClick={() => handleRunCode("cpp")}>Run</button> */}
                                      </div>
                                    </Row>

                                    <Row
                                      className={
                                        cppfinalres.length <= 0 ||
                                          cppIsLoading == true
                                          ? "hidden-element"
                                          : ""
                                      }
                                    >
                                      <Col xl={12}>
                                        <Card>
                                          <CardBody>
                                            <CardTitle className="h4">
                                              Compiler Response
                                            </CardTitle>

                                            <div className="table-responsive">
                                              <Table className="table mb-0">
                                                <thead className="table-light">
                                                  <tr>
                                                    <th>#</th>
                                                    <th>Testcase</th>
                                                    <th>Input</th>
                                                    <th>Output</th>
                                                    <th>Your Output</th>
                                                    <th>Memory</th>
                                                    <th>CPU time</th>
                                                    <th>Result</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {cppfinalres.map((ele) => (
                                                    <tr>
                                                      <th scope="row">{ele.id}</th>
                                                      <td>{ele.TestCase1}</td>
                                                      <td>{ele.Input}</td>
                                                      <td>{ele.Output}</td>
                                                      <td>{ele.YourOutput}</td>
                                                      <td>{ele.memory}</td>
                                                      <td>{ele.cpuTime}</td>
                                                      <td
                                                        className={
                                                          ele.Result == "fail"
                                                            ? "text-danger"
                                                            : "text-success"
                                                        }
                                                      >
                                                        {ele.Result}
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </Table>
                                            </div>
                                            <p className={cppMsgClassName}>
                                              {hiddenTestCaseMsgCpp}
                                            </p>
                                          </CardBody>
                                        </Card>
                                      </Col>
                                    </Row>
                                    <Row className="mb-3">
                                      <label
                                        htmlFor="ddlCreditCardType"
                                        className="col-lg-4 col-form-label"
                                      >
                                        CPP Language- Constrained code
                                      </label>
                                      {/* <input type="button" onClick={handleEditorReset} value="Reset" > */}
                                      <div className="col-lg-2 ">
                                        <button
                                          className="btn btn-light "
                                          type="button"
                                          onClick={handleEditorReset}
                                        >
                                          <i className="mdi mdi-replay"></i>{" "}
                                        </button>

                                        {/* <div className="col-lg-9"> */}
                                        {/* <Select className="col-lg-2" options={optionGroups}
                                                                        onChange={handleThemeChange}
                                                                        placeholder="Theme" />
                                                                    </div> */}

                                        <label
                                          htmlFor="ddlCreditCardType"
                                          className="col-form-label  ml-6"
                                        >
                                          Theme
                                        </label>
                                        <Switch
                                          uncheckedIcon={<Offsymbol />}
                                          checkedIcon={<OnSymbol />}
                                          onColor="#626ed4"
                                          onChange={toggleTheme}
                                          checked={switch1}
                                        />
                                      </div>
                                      &nbsp;
                                      <div style={{ marginBottom: "10px" }}>
                                        <Button
                                          color="primary"
                                          onClick={() =>
                                            addBoundaryComments(
                                              cppStubeditorRef,
                                              "Constrained code starts here",
                                              "Constrained code ends here"
                                            )
                                          }
                                        >
                                          Add Constrained Comments
                                        </Button>
                                        <Button
                                          color="secondary"
                                          onClick={() =>
                                            addBoundaryComments(
                                              cppStubeditorRef,
                                              "Editable code starts here",
                                              "Editable code ends here"
                                            )
                                          }
                                          style={{ marginLeft: "10px" }}
                                        >
                                          Add Editable Comments
                                        </Button>
                                      </div>
                                      <Editor1
                                        height="50vh"
                                        defaultLanguage="c"
                                        value={cppEditorValue}
                                        options={options}
                                        theme={theme}
                                        onMount={handleCppEditorStubDidMount}
                                        onChange={(newValue) => setCppEditorValue(newValue)}
                                      />
                                    </Row>
                                  </Col>


                                </Row>
                              </TabPane>
                              <TabPane tabId="c3">
                                <Row>
                                  <Col sm="6">
                                    <Row className="mb-3">
                                      <label
                                        htmlFor="ddlCreditCardType"
                                        className="col-lg-2 col-form-label"
                                      >
                                        Java
                                      </label>
                                      {/* <input type="button" onClick={handleEditorReset} value="Reset" > */}
                                      <div className="col-lg-10 ">
                                        <button
                                          className="btn btn-light "
                                          type="button"
                                          onClick={handleJavaEditorReset}
                                        >
                                          <i className="mdi mdi-replay"></i>{" "}
                                        </button>

                                        <label
                                          htmlFor="ddlCreditCardType"
                                          className="col-form-label  ml-6"
                                        >
                                          Theme
                                        </label>
                                        <Switch
                                          uncheckedIcon={<Offsymbol />}
                                          checkedIcon={<OnSymbol />}
                                          onColor="#626ed4"
                                          onChange={toggleTheme}
                                          checked={switch1}
                                        />
                                      </div>
                                      &nbsp;
                                      <Editor1
                                        height="50vh"
                                        defaultLanguage="java"
                                        value={
                                          typeof data.java_editor_data !==
                                            "undefined"
                                            ? data.java_editor_data["java_code"]
                                            : ""
                                        }
                                        options={options}
                                        theme={theme}
                                        onMount={handleJavaEditorDidMount}
                                        ref={javaeditorRef}
                                      />
                                      <div className="authorDivision">
                                        <div className="authorName">
                                          <label
                                            htmlFor="txtCompanyBilling"
                                            className="authorLabel"
                                          >
                                            Author
                                          </label>
                                          <Input
                                            type="select"
                                            id="author"
                                            name="java_author"
                                            className="authorOptions"
                                            onChange={authorChange}
                                            defaultValue={
                                              data.java_editor_data
                                                ? data.java_editor_data.java_author
                                                : ""
                                            }
                                          >
                                            <option value="">
                                              --Please Select--
                                            </option>
                                            {optionGroup.map((option) =>
                                              // <option value={option.value} key={option.value}>{option.label}</option>
                                              data.java_editor_data ? (
                                                option.value ==
                                                  data.java_editor_data
                                                    .java_author ? (
                                                  <option
                                                    value={option.value}
                                                    key={option.value}
                                                    selected
                                                  >
                                                    {option.label}
                                                  </option>
                                                ) : (
                                                  <option
                                                    value={option.value}
                                                    key={option.value}
                                                  >
                                                    {option.label}
                                                  </option>
                                                )
                                              ) : (
                                                <option
                                                  value={option.value}
                                                  key={option.value}
                                                >
                                                  {option.label}
                                                </option>
                                              )
                                            )}
                                          </Input>
                                        </div>

                                        <button
                                          color="primary"
                                          className="buttonRun"
                                          type="button"
                                          onClick={() => handleRunCode("java")}
                                        >
                                          {javaIsLoading == true ? (
                                            <Spinner size="sm">Loading...</Spinner>
                                          ) : (
                                            ""
                                          )}
                                          <span>
                                            {javaIsLoading == true
                                              ? " Compailing"
                                              : "Run"}
                                          </span>
                                        </button>

                                        {/* <button className="col-lg-1 btn btn-primary mt-4 mr-20" type="button" onClick={() => handleRunCode("java")}>Run</button> */}
                                      </div>
                                    </Row>

                                    <Row
                                      className={
                                        javafinalres.length <= 0 ||
                                          javaIsLoading == true
                                          ? "hidden-element"
                                          : ""
                                      }
                                    >
                                      <Col xl={12}>
                                        <Card>
                                          <CardBody>
                                            <CardTitle className="h4">
                                              Compiler Response
                                            </CardTitle>

                                            <div className="table-responsive">
                                              <Table className="table mb-0">
                                                <thead className="table-light">
                                                  <tr>
                                                    <th>#</th>
                                                    <th>Testcase</th>
                                                    <th>Input</th>
                                                    <th>Output</th>
                                                    <th>Your Output</th>
                                                    <th>Memory</th>
                                                    <th>CPU time</th>
                                                    <th>Result</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {javafinalres.map((ele) => (
                                                    <tr>
                                                      <th scope="row">{ele.id}</th>
                                                      <td>{ele.TestCase1}</td>
                                                      <td>{ele.Input}</td>
                                                      <td>{ele.Output}</td>
                                                      <td>{ele.YourOutput}</td>
                                                      <td>{ele.memory}</td>
                                                      <td>{ele.cpuTime}</td>
                                                      <td
                                                        className={
                                                          ele.Result == "fail"
                                                            ? "text-danger"
                                                            : "text-success"
                                                        }
                                                      >
                                                        {ele.Result}
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </Table>
                                            </div>
                                            <p className={javaMsgClassName}>
                                              {hiddenTestCaseMsgJava}
                                            </p>
                                          </CardBody>
                                        </Card>
                                      </Col>
                                    </Row>
                                    <Row className="mb-3">
                                      <label
                                        htmlFor="ddlCreditCardType"
                                        className="col-lg-4 col-form-label"
                                      >
                                        Java Language- Constrained code
                                      </label>
                                      {/* <input type="button" onClick={handleEditorReset} value="Reset" > */}
                                      <div className="col-lg-2 ">
                                        <button
                                          className="btn btn-light "
                                          type="button"
                                          onClick={handleEditorReset}
                                        >
                                          <i className="mdi mdi-replay"></i>{" "}
                                        </button>

                                        {/* <div className="col-lg-9"> */}
                                        {/* <Select className="col-lg-2" options={optionGroups}
                                                                        onChange={handleThemeChange}
                                                                        placeholder="Theme" />
                                                                    </div> */}

                                        <label
                                          htmlFor="ddlCreditCardType"
                                          className="col-form-label  ml-6"
                                        >
                                          Theme
                                        </label>
                                        <Switch
                                          uncheckedIcon={<Offsymbol />}
                                          checkedIcon={<OnSymbol />}
                                          onColor="#626ed4"
                                          onChange={toggleTheme}
                                          checked={switch1}
                                        />
                                      </div>
                                      &nbsp;
                                      <div style={{ marginBottom: "10px" }}>
                                        <Button
                                          color="primary"
                                          onClick={() =>
                                            addBoundaryComments(
                                              javaStubeditorRef,
                                              "Constrained code starts here",
                                              "Constrained code ends here"
                                            )
                                          }
                                        >
                                          Add Constrained Comments
                                        </Button>
                                        <Button
                                          color="secondary"
                                          onClick={() =>
                                            addBoundaryComments(
                                              javaStubeditorRef,
                                              "Editable code starts here",
                                              "Editable code ends here"
                                            )
                                          }
                                          style={{ marginLeft: "10px" }}
                                        >
                                          Add Editable Comments
                                        </Button>
                                      </div>

                                      <Editor1
                                        height="50vh"
                                        defaultLanguage="c"
                                        value={javaEditorValue}
                                        options={options}
                                        theme={theme}
                                        onMount={handleJavaEditorStubDidMount}
                                        onChange={(newValue) => setJavaEditorValue(newValue)}
                                      />
                                    </Row>
                                  </Col>

                                </Row>
                              </TabPane>
                              <TabPane tabId="c4">
                                <Row>
                                  <Col sm="6">
                                    <Row className="mb-3">
                                      <label
                                        htmlFor="ddlCreditCardType"
                                        className="col-lg-2 col-form-label"
                                      >
                                        Python
                                      </label>
                                      {/* <input type="button" onClick={handleEditorReset} value="Reset" > */}
                                      <div className="col-lg-10 ">
                                        <button
                                          className="btn btn-light "
                                          type="button"
                                          onClick={handlePythonEditorReset}
                                        >
                                          <i className="mdi mdi-replay"></i>{" "}
                                        </button>

                                        <label
                                          htmlFor="ddlCreditCardType"
                                          className="col-form-label  ml-6"
                                        >
                                          Theme
                                        </label>
                                        <Switch
                                          uncheckedIcon={<Offsymbol />}
                                          checkedIcon={<OnSymbol />}
                                          onColor="#626ed4"
                                          onChange={toggleTheme}
                                          checked={switch1}
                                        />
                                      </div>
                                      &nbsp;
                                      <Editor1
                                        height="50vh"
                                        defaultLanguage="python"
                                        value={
                                          typeof data.python_editor_data !==
                                            "undefined"
                                            ? data.python_editor_data["python_code"]
                                            : ""
                                        }
                                        options={options}
                                        theme={theme}
                                        onMount={handlePythonEditorDidMount}
                                        ref={pythoneditorRef}
                                      />
                                      <div className="authorDivision">
                                        <div className="authorName">
                                          <label
                                            htmlFor="txtCompanyBilling"
                                            className="authorLabel"
                                          >
                                            Author
                                          </label>
                                          <Input
                                            type="select"
                                            id="author"
                                            name="python_author"
                                            className="authorOptions"
                                            onChange={authorChange}
                                            defaultValue={
                                              data.python_editor_data
                                                ? data.python_editor_data
                                                  .python_author
                                                : ""
                                            }
                                          >
                                            <option value="">
                                              --Please Select--
                                            </option>
                                            {optionGroup.map((option) =>
                                              // <option value={option.value} key={option.value}>{option.label}</option>
                                              data.python_editor_data ? (
                                                option.value ==
                                                  data.python_editor_data
                                                    .python_author ? (
                                                  <option
                                                    value={option.value}
                                                    key={option.value}
                                                    selected
                                                  >
                                                    {option.label}
                                                  </option>
                                                ) : (
                                                  <option
                                                    value={option.value}
                                                    key={option.value}
                                                  >
                                                    {option.label}
                                                  </option>
                                                )
                                              ) : (
                                                <option
                                                  value={option.value}
                                                  key={option.value}
                                                >
                                                  {option.label}
                                                </option>
                                              )
                                            )}
                                          </Input>
                                        </div>

                                        <button
                                          color="primary"
                                          className="buttonRun"
                                          type="button"
                                          onClick={() => handleRunCode("python")}
                                        >
                                          {pythonIsLoading == true ? (
                                            <Spinner size="sm">Loading...</Spinner>
                                          ) : (
                                            ""
                                          )}
                                          <span>
                                            {pythonIsLoading == true
                                              ? " Compailing"
                                              : "Run"}
                                          </span>
                                        </button>
                                      </div>
                                      {/* <button className="col-lg-1 btn btn-primary mt-4 mr-20" type="button" onClick={() => handleRunCode("python")}>Run</button> */}
                                    </Row>

                                    <Row
                                      className={
                                        pythonfinalres.length <= 0 ||
                                          pythonIsLoading == true
                                          ? "hidden-element"
                                          : ""
                                      }
                                    >
                                      <Col xl={12}>
                                        <Card>
                                          <CardBody>
                                            <CardTitle className="h4">
                                              Compiler Response
                                            </CardTitle>

                                            <div className="table-responsive">
                                              <Table className="table mb-0">
                                                <thead className="table-light">
                                                  <tr>
                                                    <th>#</th>
                                                    <th>Testcase</th>
                                                    <th>Input</th>
                                                    <th>Output</th>
                                                    <th>Your Output</th>
                                                    <th>Memory</th>
                                                    <th>CPU time</th>
                                                    <th>Result</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {pythonfinalres.map((ele) => (
                                                    <tr>
                                                      <th scope="row">{ele.id}</th>
                                                      <td>{ele.TestCase1}</td>
                                                      <td>{ele.Input}</td>
                                                      <td>{ele.Output}</td>
                                                      <td>{ele.YourOutput}</td>
                                                      <td>{ele.memory}</td>
                                                      <td>{ele.cpuTime}</td>
                                                      <td
                                                        className={
                                                          ele.Result == "fail"
                                                            ? "text-danger"
                                                            : "text-success"
                                                        }
                                                      >
                                                        {ele.Result}
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </Table>
                                            </div>
                                            <p className={pythonMsgClassName}>
                                              {hiddenTestCaseMsgPython}
                                            </p>
                                          </CardBody>
                                        </Card>
                                      </Col>
                                    </Row>
                                    <Row className="mb-3">
                                      <label
                                        htmlFor="ddlCreditCardType"
                                        className="col-lg-4 col-form-label"
                                      >
                                        Python Language- Constrained code
                                      </label>
                                      {/* <input type="button" onClick={handleEditorReset} value="Reset" > */}
                                      <div className="col-lg-2 ">
                                        <button
                                          className="btn btn-light "
                                          type="button"
                                          onClick={handleEditorReset}
                                        >
                                          <i className="mdi mdi-replay"></i>{" "}
                                        </button>

                                        {/* <div className="col-lg-9"> */}
                                        {/* <Select className="col-lg-2" options={optionGroups}
                                                                        onChange={handleThemeChange}
                                                                        placeholder="Theme" />
                                                                    </div> */}

                                        <label
                                          htmlFor="ddlCreditCardType"
                                          className="col-form-label  ml-6"
                                        >
                                          Theme
                                        </label>
                                        <Switch
                                          uncheckedIcon={<Offsymbol />}
                                          checkedIcon={<OnSymbol />}
                                          onColor="#626ed4"
                                          onChange={toggleTheme}
                                          checked={switch1}
                                        />
                                      </div>
                                      &nbsp;
                                      <div style={{ marginBottom: "10px" }}>
                                        <Button
                                          color="primary"
                                          onClick={() =>
                                            addBoundaryComments(
                                              pythonStubeditorRef,
                                              "Constrained code starts here",
                                              "Constrained code ends here"
                                            )
                                          }
                                        >
                                          Add Constrained Comments
                                        </Button>
                                        <Button
                                          color="secondary"
                                          onClick={() =>
                                            addBoundaryComments(
                                              pythonStubeditorRef,
                                              "Editable code starts here",
                                              "Editable code ends here"
                                            )
                                          }
                                          style={{ marginLeft: "10px" }}
                                        >
                                          Add Editable Comments
                                        </Button>
                                      </div>
                                      <Editor1
                                        height="50vh"
                                        defaultLanguage="c"
                                        value={pythonEditorValue}
                                        options={options}
                                        theme={theme}
                                        onMount={handlePythonEditorStubDidMount}
                                        onChange={(newValue) => setPythonEditorValue(newValue)}
                                      />
                                    </Row>
                                  </Col>

                                </Row>
                              </TabPane>
                            </TabContent>

                          </Row>
                        </TabPane>
                      </TabContent>
                    </div>
                    <div className="actions clearfix">
                      <ul>
                        <li
                          className={
                            activeTab === 1 ? "previous disabled" : "previous"
                          }
                        >
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              toggleTab(activeTab - 1);
                            }}
                          >
                            Previous
                          </button>
                        </li>
                        <li className={activeTab === 3 ? "next" : "next"}>
                          {activeTab === 3 ? (
                            <button type="button" onClick={updateProblemSubmit} className="btn btn-primary">
                              Review & Submit
                            </button>
                          ) : (
                            <input
                              type="button"
                              className="btn btn-primary"
                              onClick={() => {
                                if (activeTab === 1) {
                                  var err_res = Object.entries(
                                    validate(data)
                                  );
                                  console.log(err_res + "gfjhl;gh;ih");
                                  if (err_res.length == 0) {
                                    toggleTab(activeTab + 1);
                                    setactiveTab(2);
                                  }
                                } else if (activeTab === 2) {
                                  var err_res = Object.entries(
                                    testcase_validate(data)
                                  );
                                  console.log(err_res);
                                  if (err_res.length == 0) {
                                    toggleTab(activeTab + 1);
                                    setactiveTab(3);
                                  }
                                }
                              }}
                              value="Next"
                            />
                          )}
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Form >
        {/* </Container> */}
      </div >
      <ToastContainer />
    </React.Fragment >
  );
};

export default EditProblem;
