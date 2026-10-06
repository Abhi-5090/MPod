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
  Nav
} from "reactstrap";

import Select from "react-select";
import classnames from "classnames";
import { Modal, Button as BUTTON } from 'react-bootstrap';
import { AvForm, AvField } from "availity-reactstrap-validation";
import { Link } from "react-router-dom";

// import { axios } from "components/VerticalLayout/SidebarContent";
// Form Editor
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import { EditorState, convertToRaw } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";
import FormData from "form-data";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { Resizable } from "react-resizable";
import Editor1 from "@monaco-editor/react";
import Switch from "react-switch";
// import LocalStorageContext from "../Common/localStorageContext";
import { useNavigate } from "react-router-dom";
//css file importing
import "./AddProblem-SqlImage.css"
import axios from "axios";
const baseURL = process.env.REACT_APP_BACKEND_URL;

const baseImageURL = process.env.REACT_APP_BACKEND_IMAGE_URL;

const AddLevelProblem = () => {
  // const added_by = useContext(LocalStorageContext);


  const navigate = useNavigate();
  const [activeTab, setactiveTab] = useState(1);
  const [activeTabProgress, setactiveTabProgress] = useState(1);
  const [progressValue, setprogressValue] = useState(25);
  const [activeTabVartical, setoggleTabVertical] = useState(1);
  const [users, setUsers] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editor, setEditor] = useState();
  const [theme, setEditorTheme] = useState("vs-dark");
  const [switch1, setswitch1] = useState(false);
  const [switchvalue, setSwitchValue] = useState();
  const [temp1, setTemp] = useState({});
  const [problemData, setProblemData] = useState();
  const [companies, setCompanies] = useState([]);
  const [selectedTechnology, setSelectedTechnology] = useState('');
  const [modulesOptions, setModulesOptions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [tags, setTags] = useState([]);
  const [mandatoryTags, setMandatoryTags] = useState([]);

  const [selectedTag, setSelectedTag] = useState();
  const [selectedMandatoryTag, setSelectedMandatoryTag] = useState();

  const [testcaseinput, setTestcaseInput] = useState([]);
  const [testcaseoutput, setTestcaseOutput] = useState([]);
  const [hiddentestcaseinput, setHiddenTestcaseInput] = useState([]);
  const [hiddentestcaseoutput, setHiddenTestcaseOutput] = useState([]);
  const [hiddenTestCaseMsgC, setHiddenTestCaseMsgC] = useState("");
  const [hiddenTestCaseMsgCpp, setHiddenTestCaseMsgCpp] = useState("");
  const [hiddenTestCaseMsgJava, setHiddenTestCaseMsgJava] = useState("");
  const [hiddenTestCaseMsgPython, setHiddenTestCaseMsgPython] = useState("");
  const [hiddenTestCaseMsgVerilog, setHiddenTestCaseMsgVerilog] = useState("");
  const [cMsgClassName, setCMsgClassName] = useState("");
  const [cppMsgClassName, setCppMsgClassName] = useState("");
  const [javaMsgClassName, setJavaMsgClassName] = useState("");
  const [pythonMsgClassName, setPythonMsgClassName] = useState("");
  const [verilogMsgClassName, setVerilogMsgClassName] = useState("");
  const [cIsLoading, setCIsLoading] = useState(false);
  const [cppIsLoading, setCppIsLoading] = useState(false);
  const [javaIsLoading, setJavaIsLoading] = useState(false);
  const [pythonIsLoading, setPythonIsLoading] = useState(false);
  const [verilogIsLoading, setVerilogIsLoading] = useState(false);

  const axiosAPI = axios.create();

  var temp = 0;
  const [data, setData] = useState({
    problem_name: "",
    level: "",
    complexity: "",
    author: "",
    tags: "",
    manda_tags: "",
    problem_data: "",
    added_by: "",
    created_date: "",
    updated_date: "",
    // "status": ""
  });
  const [stc, setStc] = useState([]);
  const [rows1, setRows1] = useState([
    { hidden_testcase_input: "", hidden_testcase_output: "" },
  ]);
  const [rows2, setRows2] = useState([
    { testcase_input: "", testcase_output: "" },
  ]);

  const editorRef = useRef(null);

  const [clangfinalres, setClangFinal] = useState([]);
  const [cppfinalres, setCppFinal] = useState([]);
  const [javafinalres, setJavaFinal] = useState([]);
  const [pythonfinalres, setPythonFinal] = useState([]);
  const [verilogfinalres, setVerilogFinal] = useState([]);

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [hintFormatState, setHintFormatState] = useState(EditorState.createEmpty());
  const [editorialFormatState, setEditorialFormatState] = useState(EditorState.createEmpty());
  const [inputFormatState, setInputFormatState] = useState(EditorState.createEmpty());
  const [outputFormatState, setOutputFormatState] = useState(EditorState.createEmpty());
  const [inputState, setInputState] = useState(EditorState.createEmpty());
  const [input2State, setInput2State] = useState(EditorState.createEmpty());
  const [input3State, setInput3State] = useState(EditorState.createEmpty());
  const [input4State, setInput4State] = useState(EditorState.createEmpty());
  const [outputState, setOutputState] = useState(EditorState.createEmpty());
  const [output2State, setOutput2State] = useState(EditorState.createEmpty());
  const [output3State, setOutput3State] = useState(EditorState.createEmpty());
  const [output4State, setOutput4State] = useState(EditorState.createEmpty());
  const [explainationState, setExplainationState] = useState(EditorState.createEmpty());
  const [constraintsState, setConstraintsState] = useState(EditorState.createEmpty());

  const [plainText, setPlainText] = useState("");
  const [c_editor_data, setCEditorData] = useState("");
  const [cpp_editor_data, setCppEditorData] = useState("");
  const [java_editor_data, setJavaEditorData] = useState("");
  const [python_editor_data, setPythonEditorData] = useState("");
  const [verilog_editor_data, setVerilogEditorData] = useState("");

  const [selectedMulti, setselectedMulti] = useState(null);
  const [selectedMultiTags, setselectedMultiTags] = useState(null);
  const [selectedMultiMandatoryTags, setselectedMultiMandatoryTags] = useState(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    // console.log(editor)
  }
  function handleEditorReset(editor, monaco) {
    editorRef.current.setValue("");
  }

  const cppeditorRef = useRef(null);

  function handleCppEditorDidMount(editor, monaco) {
    cppeditorRef.current = editor;
    // console.log(cppeditorRef.current)
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
  const verilogeditorRef = useRef(null);

  function handleVerilogEditorDidMount(editor, monaco) {
    verilogeditorRef.current = editor;
  }

  function handleVeriEditorReset(editor, monaco) {
    verilogeditorRef.current.setValue("");
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

  function handleAddRowNested1() {
    setRows2([...rows2, { testcase_input: "", testcase_output: "" }]);
  }

  function handleRemoveRow(e, index) {
    const rows = [...rows1];
    rows.splice(index, 1);
    setRows1(rows);
  }
  function handleRemoveRows(e, index) {
    const rows = [...rows2];
    rows.splice(index, 1);
    setRows2(rows);
  }

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' ||authUser.role == 'coding'||authUser.role == 'intern') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);
  const [user, setUser] = useState([]);
  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("authUser")));
  }, []);
  useEffect(() => {
    setLoading(true);

    axiosAPI
      .get(baseURL + `get-users`)
      .then((response) => {
        setUsers(response.data);
        // console.log(response.data)
      })
      .finally(() => {
        setLoading(false);
      });

    axiosAPI.get(baseURL + "get-technologies")
      .then((response) => {
        setTechnologies(response.data);
      })
      .finally(() => {
        setLoading(false);
      });

    axiosAPI
      .get(baseURL + "companies-list")
      .then((response) => {
        setCompanies(response.data);
      })
      .finally(() => {
        setLoading(false);
      });
    axiosAPI
      .get(baseURL + "tags-list")
      .then((response) => {

        setTags(response.data["tags"]);
      })
      .finally(() => {
        setLoading(false);
      });
    axiosAPI
      .get(baseURL + "mandatory-tags-list")
      .then((response) => {

        setMandatoryTags(response.data["tags"]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const updateData = (e) => {
    temp = e.target.value;
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    // console.log(data)
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
  const addProblemSubmit = () => {

    // console.log(user)
    data.author = user["student_id"];
    data.problem_data = problemData;
    data.testcase_input = testcaseinput;
    data.testcase_output = testcaseoutput;
    data.hidden_testcase_input = hiddentestcaseinput;
    data.hidden_testcase_output = hiddentestcaseoutput;
    data.c_editor_data = {
      c_author: data.c_author,
      c_code: editorRef.current.getValue(),
    };
    data.cpp_editor_data = {
      cpp_author: data.cpp_author,
      cpp_code: cppeditorRef.current.getValue(),
    };
    data.java_editor_data = {
      java_author: data.java_author,
      java_code: javaeditorRef.current.getValue(),
    };
    data.python_editor_data = {
      python_author: data.python_author,
      python_code: pythoneditorRef.current.getValue(),
    };

    data.verilog_editor_data = {
      verilog_author: data.verilog_author,
      verilog_code: verilogeditorRef.current.getValue(),
    };
    data.added_by = user['student_id'];
    data.created_date = new Date();
    // data.updated_date = new Date();
    console.log(data)
    try {
      let problem_added = axios.post(baseURL + "add-problem", data)
      // console.log(problem_added)
      alert("Problem added successfully");
      navigate("/problems-list")
    } catch (err) {
      // console.log(err)
    }

  };
  const optionGroup = users.map((ele) => {
    return { label: ele.first_name, value: ele._id };
  });

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleOptionChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const companyOptionGroup = companies.map((ele) => {
    return { label: ele.company_name, value: ele._id };
  });

  const tagOptionGroup = tags.map((ele) => {
    return { label: ele.tag_name, value: ele._id };
  });
  const mandatoryTagOptionGroup = mandatoryTags.map((ele) => {
    return { label: ele.tag_name + `-(${ele.technology_name})`, value: ele._id };
  });
  function handleMultipleCompany(selectedOptions) {
    setselectedMulti(selectedOptions);
    const objj = selectedOptions.map((ele) => {
      return ele.value;
    });
    setData({
      ...data,
      ["companies"]: objj,
    });
  }

  function handleMultipleTag(selectedOptions) {
    setselectedMultiTags(selectedOptions);
    const objj = selectedOptions.map((ele) => {
      return ele.value;
    });
    setData({
      ...data,
      ["tags"]: objj,
    });
  }

  function handleMultipleMandatoryTag(selectedOptions) {
    setselectedMultiMandatoryTags(selectedOptions);
    const objj = selectedOptions.map((ele) => {
      return ele.value;
    });
    setData({
      ...data,
      ["mandatory_tags"]: objj,
    });
  }

  const handleTestcaseChange = (e, index) => {
    const { name, value } = e.target;
    const testcases = [...rows2];

    testcases[index][name] = value;
    setRows2(testcases);
    let testcases_input = [];
    let testcases_output = [];

    rows2.map((ele) => {
      testcases_input.push(ele.testcase_input);
      testcases_output.push(ele.testcase_output);
    });
    setTestcaseInput(testcases_input);
    setTestcaseOutput(testcases_output);
    // console.log(testcases_input)
    // console.log(testcases_output)
  };
  const handleHiddenTestcaseChange = (e, index) => {
    const { name, value } = e.target;
    const hidden_testcases = [...rows1];

    hidden_testcases[index][name] = value;

    setRows1(hidden_testcases);
    let hidden_testcases_input = [];
    let hidden_testcases_output = [];
    rows1.map((ele) => {
      hidden_testcases_input.push(ele.hidden_testcase_input);
      hidden_testcases_output.push(ele.hidden_testcase_output);
    });
    setHiddenTestcaseInput(hidden_testcases_input);
    setHiddenTestcaseOutput(hidden_testcases_output);
  };
  const technologyOptionGroup = technologies.map((ele) => {
    return { label: ele.technology_name, value: ele._id };
  });
  const tagsOptionGroup = tags.map((ele) => {
    return { label: ele.tag_name, value: ele._id };
  });
  const mandatoryTagsOptionGroup = mandatoryTags.map((ele) => {
    return { label: ele.tag_name, value: ele._id };
  });
  const handleLevelOptionChange = (e) => {

    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    setSelectedTechnology(e.target.value)
  };

  const handleTopicOptionChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };
  const handleTagsOptionChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
    setSelectedTag(e.target.value)
  }
  const handleMandatoryTagsOptionChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
    setSelectedMandatoryTag(e.target.value)
  }
  const handleDateInputChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
  }
  const handleModuleOptionChange = (selectedTechnology) => {
    if (selectedTechnology) {
      axiosAPI.post(baseURL + "get-modules-by-technology", { "technology_id": selectedTechnology })
        .then((response) => {
          if (response.status == 200) {

            const moduleOptions = response.data.map((ele) => ({
              label: ele.module_name,
              value: ele._id,
            }));
            setModulesOptions(moduleOptions);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      setModulesOptions([]);
    }
  };
  useEffect(() => {
    handleModuleOptionChange(selectedTechnology);
  }, [selectedTechnology]);

  const validateEditorContent = (editorState) => {
    const contentState = editorState.getCurrentContent();
    return !contentState.hasText(); // Simple validation: check if the editor is not empty
  };

  const onEditorStateChangeHint = (editorState) => {
    setHintFormatState(editorState);
    setPlainText(draftToHtml(convertToRaw(editorState.getCurrentContent())));
    // console.log(plainText)
    setProblemData({
      ...problemData,
      ["hint"]: plainText,
    });
  };

  const onEditorStateChangeEditorial = (editorState) => {
    setEditorialFormatState(editorState);
    setPlainText(draftToHtml(convertToRaw(editorState.getCurrentContent())));
    // console.log(plainText)
    setProblemData({
      ...problemData,
      ["editorial"]: plainText,
    });
  };

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    setPlainText(draftToHtml(convertToRaw(editorState.getCurrentContent())));
    // console.log(plainText)
    setProblemData({
      ...problemData,
      ["problem_desc"]: plainText,
    });
  };


  const onEditorStateChange1 = (inputFormatState) => {
    setInputFormatState(inputFormatState);
    setPlainText(draftToHtml(convertToRaw(inputFormatState.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["input_format"]: plainText,
    });
    // console.log(problemData)
  };
  const onEditorStateChange2 = (outputFormatState) => {
    setOutputFormatState(outputFormatState);
    setPlainText(draftToHtml(convertToRaw(outputFormatState.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["output_format"]: plainText,
    });
    // console.log(problemData)
  };
  const onEditorStateChange3 = (inputState) => {
    setInputState(inputState);
    setPlainText(draftToHtml(convertToRaw(inputState.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["input"]: plainText,
    });
    // console.log(problemData)
  };

  const onEditorInput2StateChange3 = (input2State) => {
    setInput2State(input2State);
    setPlainText(draftToHtml(convertToRaw(input2State.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["input2"]: plainText,
    });
    // console.log(problemData)
  };

  const onEditorInput3StateChange3 = (input3State) => {
    setInput3State(input3State);
    setPlainText(draftToHtml(convertToRaw(input3State.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["input3"]: plainText,
    });
    // console.log(problemData)
  };

  const onEditorInput4StateChange3 = (input4State) => {
    setInput4State(input4State);
    setPlainText(draftToHtml(convertToRaw(input4State.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["input4"]: plainText,
    });
    // console.log(problemData)
  };


  const onEditorStateChange4 = (outputState) => {
    setOutputState(outputState);
    setPlainText(draftToHtml(convertToRaw(outputState.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["output"]: plainText,
    });
    // console.log(problemData)
  };

  const onEditorOutput2StateChange4 = (output2State) => {
    setOutput2State(output2State);
    setPlainText(draftToHtml(convertToRaw(output2State.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["output2"]: plainText,
    });
    // console.log(problemData)
  };

  const onEditorOutput3StateChange4 = (output3State) => {
    setOutput3State(output3State);
    setPlainText(draftToHtml(convertToRaw(output3State.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["output3"]: plainText,
    });
    // console.log(problemData)
  };

  const onEditorOutput4StateChange4 = (output4State) => {
    setOutput4State(output4State);
    setPlainText(draftToHtml(convertToRaw(output4State.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["output4"]: plainText,
    });
    // console.log(problemData)
  };

  const onEditorExplainationStateChange4 = (explainationState) => {
    setExplainationState(explainationState);
    setPlainText(draftToHtml(convertToRaw(explainationState.getCurrentContent())));
    setProblemData({
      ...problemData,
      ["explaination"]: plainText,
    });
    // console.log(problemData)
  };



  const onEditorStateChange5 = (constraintsState) => {
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
    // console.log("hi")
    let temp = theme === "light" ? "vs-dark" : "light";
    setEditorTheme(temp);
  }
  useEffect(() => {
    switch1 == true
      ? setSwitchValue((prevstate) => !prevstate)
      : setSwitchValue((prevstate) => !prevstate);
  }, [switch1]);

  const handleRunCode = (lang) => {
    // console.log(lang);
    let code_editor_data;
    if (lang == "c") {
      setCIsLoading(true);
      code_editor_data = editorRef.current.getValue();
      // console.log(code_editor_data)
      setCEditorData(code_editor_data);
    } else if (lang == "cpp") {
      setCppIsLoading(true);
      code_editor_data = cppeditorRef.current.getValue();
      setCppEditorData(code_editor_data);
    } else if (lang == "java") {
      setJavaIsLoading(true);
      code_editor_data = javaeditorRef.current.getValue();
      setJavaEditorData(code_editor_data);
    } else if (lang == "python") {
      setPythonIsLoading(true);
      code_editor_data = pythoneditorRef.current.getValue();
      setPythonEditorData(code_editor_data);
    }
    else if (lang == "verilog") {
      setVerilogIsLoading(true);
      code_editor_data = verilogeditorRef.current.getValue();
      setVerilogEditorData(code_editor_data);
    }

    const data = {
      lang,
      code_editor_data,
      testcases_input: testcaseinput,
      testcases_output: testcaseoutput,
      hidden_testcases_input: hiddentestcaseinput,
      hidden_testcases_output: hiddentestcaseoutput,
    };
    // console.log(data)

    axios
      .post(baseURL + "run-compiler", data)
      .then((res) => {
        setTemp(res.data);
        setCIsLoading(false);
        setCppIsLoading(false);
        setJavaIsLoading(false);
        setPythonIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
    //    console.log(temp1)
  };
  useEffect(() => {
    let cur_hidden_output = temp1["hidden_testcases_response"];
    if (typeof cur_hidden_output != "undefined") {
      cur_hidden_output = cur_hidden_output.map((ele) => ele.output.trim());
      if (
        JSON.stringify(hiddentestcaseoutput) ===
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
        } else if (temp1["lang"] == "verilog") {
          setHiddenTestCaseMsgVerilog("All Hidden testcases passed");
          setVerilogMsgClassName("text-success");
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
        } else if (temp1["lang"] == "verilog") {
          setHiddenTestCaseMsgVerilog("Some hidden testcases are failed");
          setVerilogMsgClassName("text-warning");
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
        if (cur_sample_output1[i].trim() == testcaseoutput[i]) {
          resultObj.push({
            id: i + 1,
            TestCase1: "TestCase-" + (i + 1),
            Input: testcaseinput[i],
            Output: testcaseoutput[i],
            YourOutput: cur_sample_output1[i],
            memory: cur_sample_output[i]["memory"],
            cpuTime: cur_sample_output[i]["cpuTime"],
            Result: "pass",
          });
        } else {
          resultObj.push({
            id: i + 1,
            TestCase1: "TestCase-" + (i + 1),
            Input: testcaseinput[i],
            Output: testcaseoutput[i],
            YourOutput: cur_sample_output1[i],
            memory: cur_sample_output[i]["memory"],
            cpuTime: cur_sample_output[i]["cpuTime"],
            Result: "fail",
          });
        }
      }
      if (temp1.lang == "c") {
        setClangFinal(resultObj);
      } else if (temp1.lang == "cpp") {
        setCppFinal(resultObj);
      } else if (temp1.lang == "java") {
        setJavaFinal(resultObj);
      } else if (temp1.lang == "python") {
        setPythonFinal(resultObj);
      } else if (temp1.lang == "verilog") {
        setVerilogFinal(resultObj);
      }


      // if(JSON.stringify(testcaseoutput)===JSON.stringify(cur_sample_output)){
      //     console.log("sample test cases matched")
      // }else{
      //     console.log('sample test cases not matched')
      // }
    }
  }, [temp1]);
  const validate = (values) => {
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
    // else if (!values.course) {
    //   errors.level = "Required course";
    //   toast.error("Required course!", {
    //     position: "top-right",
    //     hideProgressBar: false,
    //     closeOnClick: true,
    //     pauseOnHover: true,
    //   });
    // }
    //Toast validation for author
    // else if (!values.author) {
    //     errors.author = "Required author";
    //     toast.error('Required author!', {
    //         position: "top-right",
    //         hideProgressBar: false,
    //         closeOnClick: true,
    //         pauseOnHover: true,
    //     });
    // }
    else {
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
        if (isValidContent) {
          errors.problem_des = "Required input format";
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
          errors.problem_des = "Required output format";
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
          errors.problem_des = "Required input";
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
          errors.problem_des = "Required output";
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
          errors.problem_des = "Required Constraints";
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
    //Toast validation for testcase_input
    if (testcaseinput.length == 0) {
      errors.problem_des = "Required sample testcase input-1";
      toast.error("Required sample testcase input-1", {
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
    testcaseinput.map((ele, i) => {
      if (ele == "") {
        errors.problem_des = "Required sample testcase input-" + (i + 1);
        toast.error("Required sample testcase input-" + (i + 1) + "!", {
          position: "top-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      }
    });

    return errors;
  };
  document.title = "Add Problems | Owlcoder";


  //File Upload 
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


  // sql - code
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [Sqlimages, setSqlimages] = useState([])
  const [Sqlgetimages, setSqlgetimages] = useState(true)

  useEffect(() => {
    try {
      axios.get(`${baseURL}get-sql-images`)
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
        const response = await axios.post(baseURL + "sql-image-upload", MyFormData);
        // console.log(response.status)
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
  const [currentActiveTab, setCurrentActiveTab] = useState('1');

  // Toggle active state for Tab
  const toggle = tab => {
    if (currentActiveTab !== tab) setCurrentActiveTab(tab);
  }
  return (
    <React.Fragment>
      <div className="page-content">
        {/* <Container fluid={true}> */}
        {/* <Breadcrumbs
            maintitle="Owlcoder Problems"
            title="Problems"
            breadcrumbItem="Add Problem"
          /> */}

        <Form>
          <AvForm className="needs-validation">
            <Row>
              <Col sm="8">
                <Card>
                  <CardBody>
                    <h4 className="card-title mb-4">Add Problem</h4>
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
                              <span className="number">1.</span> Add new problem
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
                                if (activeTab === 1) {
                                  var err_res = Object.entries(validate(data));
                                  if (err_res.length == 0) {
                                    toggleTab(activeTab + 1);
                                    setactiveTab(2);
                                  }
                                }
                                if (activeTab === 3) {
                                  setactiveTab(2);
                                }
                              }}
                            >
                              <span className="number">2.</span> Add Test Cases
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
                                if (activeTab === 2) {
                                  var err_res = Object.entries(
                                    testcase_validate(data)
                                  );
                                  if (err_res.length == 0) {
                                    toggleTab(activeTab + 1);
                                    setactiveTab(3);
                                  }
                                }
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
                            {/* <Row>
                            <Col className="input_label_row">
                              <Row className="label_row">
                                <label
                                  htmlFor="level"
                                  className="label_division"
                                >
                                  Technology
                                </label>
                                <div className="input_division">
                                  <Input
                                    type="select"
                                    id="course"
                                    name="course"
                                    onChange={handleLevelOptionChange}
                                  // value={userType}
                                  >
                                    <option value="">
                                      --Please Select--
                                    </option>
                                    {technologyOptionGroup.map((option) => (
                                      <option
                                        value={option.value}
                                        key={option.value}
                                      >
                                        {option.label}
                                      </option>
                                    ))}
                                  </Input>
                                </div>
                              </Row>
                            </Col>
                          </Row> */}
                            {/* <Row>
                            <Col className="input_label_row">
                              <Row className="label_row">
                                <label
                                  htmlFor="level"
                                  className="label_division"
                                >
                                  Module
                                </label>
                                <div className="input_division">
                                  <Input
                                    type="select"
                                    id="topic"
                                    name="topic"
                                    onChange={handleModuleOptionChange}
                                  // value={userType}
                                  >
                                    <option value="">
                                      --Please Select--
                                    </option>
                                    {modulesOptions.length != 0 && modulesOptions?.map((option) => (
                                      <option
                                        value={option.value}
                                        key={option.value}
                                      >
                                        {option.label}
                                      </option>
                                    ))}
                                  </Input>
                                </div>
                              </Row>
                            </Col>
                          </Row> */}
                            <Row>
                              <Col className="input_label_row mb-4">
                                <Row className="label_row">
                                  <label
                                    htmlFor="problem_name"
                                    className="label_division"
                                  >
                                    Problem Name
                                  </label>
                                  <div className="input_division">
                                    <Input
                                      id=""
                                      name="problem_name"
                                      type="text"
                                      placeholder="Enter your problem name"
                                      onChange={updateData}
                                      value={updateData["problem_name"]}
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
                              <Col className="input_label_row mb-4">
                                <Row className="label_row">
                                  <label
                                    htmlFor="complexity"
                                    className="label_division"
                                  >
                                    Problem Complexity
                                  </label>
                                  <div className="input_division">
                                    <div className="form-check form-check-inline">
                                      <Input
                                        type="radio"
                                        id="complexity"
                                        name="complexity"
                                        className="form-check-input"
                                        onChange={handleOptionChange}
                                        value="easy"
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
                              {/* <Col md={6}>
                                                                <Row className="mb-3">
                                                                    <label htmlFor="txtCompanyBilling"
                                                                        className="col-lg-3 col-form-label">Author</label>
                                                                    <div className="col-lg-9">
                                                                        <Input type="select" id="author" name="author"
                                                                            className="form-select"
                                                                            onChange={handleChange}
                                                                        // value={userType}
                                                                        >
                                                                            <option value="">--Please Select--</option>
                                                                            {
                                                                                optionGroup.map(option => (
                                                                                    <option value={option.value} key={option.value}>{option.label}</option>
                                                                                ))
                                                                            }

                                                                        </Input>
                                                                    </div>
                                                                </Row>
                                                            </Col> */}
                            </Row>
                            {/* <Row>
                              <Col className="input_label_row">
                                <Row className="label_row">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division"
                                  >
                                    Tags
                                  </label>
                                  <div className="input_division">
                                    <Input
                                      name="tags"
                                      type="text"
                                      className="form-control"
                                      placeholder="Owlcoder"
                                      disabled
                                      onChange={updateData}
                                      value={"Owlcoder"}
                                    />
                                  </div>
                                </Row>
                              </Col>
                            </Row> */}
                            <Row>
                              <Col className="input_label_row mb-4" >
                                <Row className="label_row">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division"
                                  >
                                    Tags
                                  </label>
                                  <div className="input_division">
                                    <Select
                                      name="mapped_to"
                                      value={selectedMultiTags}
                                      isMulti={true}
                                      onChange={handleMultipleTag}
                                      options={tagOptionGroup}
                                      classNamePrefix="select2-selection"
                                      className="select_options"
                                    />
                                  </div>
                                </Row>
                              </Col>
                            </Row>
                            <Row>
                              <Col className="input_label_row mb-4" >
                                <Row className="label_row">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division"
                                  >
                                    Mandatory Tags
                                  </label>
                                  <div className="input_division">
                                    <Select
                                      name="mapped_to"
                                      value={selectedMultiMandatoryTags}
                                      isMulti={true}
                                      onChange={handleMultipleMandatoryTag}
                                      options={mandatoryTagOptionGroup}
                                      classNamePrefix="select2-selection"
                                      className="select_options"
                                    />
                                  </div>
                                </Row>
                              </Col>
                            </Row>
                            {selectedTag === "65487238bc8a4296f72868dd" && (
                              <Row>
                                <Col className="input_label_row mb-4">
                                  <Row className="label_row">
                                    <label
                                      htmlFor="problem_name"
                                      className="label_division"
                                    >
                                      Establish date
                                    </label>
                                    <div className="input_division">
                                      <Input
                                        type="date"
                                        id="dateInput"
                                        name="establish_date"
                                        onChange={handleDateInputChange}
                                      />
                                    </div>
                                  </Row>
                                </Col>
                              </Row>


                            )}
                            <Row>
                              <Col className="input_label_row mb-4">
                                <Row className="label_row">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division"
                                  >
                                    Previously asked Company
                                  </label>
                                  <div className="input_division">
                                    <Select
                                      name="mapped_to"
                                      value={selectedMulti}
                                      isMulti={true}
                                      onChange={handleMultipleCompany}
                                      options={companyOptionGroup}
                                      classNamePrefix="select2-selection"
                                      className="select_options"
                                    />
                                  </div>
                                </Row>
                              </Col>
                            </Row>

                            <Row>
                              <Col className="input_label_row mb-4">
                                <Row className="label_row">
                                  <label
                                    htmlFor="video_url"
                                    className="label_division"
                                  >
                                    Video Url
                                  </label>
                                  <div className="input_division">
                                    <Input
                                      id=""
                                      name="video_url"
                                      type="text"
                                      placeholder="Paste video link here"
                                      onChange={updateData}
                                      value={updateData["video_url"]}
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
                              <Col >
                                <Row >
                                  <label
                                    htmlFor="txtCompanyBilling"

                                  >
                                    Choose Images
                                  </label>
                                  <div>
                                    <BUTTON variant="primary" onClick={handleShow} className="w-25 mb-4">
                                      Show Images
                                    </BUTTON>
                                  </div>
                                </Row>
                              </Col>
                            </Row>

                            <Row>
                              {/* <button className="btn btn-primary" onClick={handleOpenModal}>
                                Open Modal
                              </button> */}

                              {/* Modal */}


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


                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Problem Description
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="problem_des"
                                          defaultEditorState={editorState}
                                          onEditorStateChange={(
                                            editorState
                                          ) => {
                                            setEditorState(editorState);
                                            onEditorStateChange(editorState);
                                          }}
                                          editorState={editorState}
                                          toolbarClassName="toolbarClassName"
                                          wrapperClassName="wrapperClassName"
                                          editorClassName="editorClassName"
                                          toolbar={{
                                            image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                          }}
                                        // onEditorStateChange={onEditorStateChange}
                                        />
                                        <textarea
                                          hidden={true}
                                          name="problem_desc"
                                          className="text-area "
                                          value={draftToHtml(
                                            convertToRaw(
                                              editorState.getCurrentContent()
                                            )
                                          )}
                                          onChange={updateData}
                                        />
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>

                            <Row>
                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Problem Hint
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="hint"
                                          defaultEditorState={hintFormatState}
                                          onEditorStateChange={(
                                            hintFormatState
                                          ) => {
                                            setHintFormatState(hintFormatState);
                                            onEditorStateChangeHint(hintFormatState);
                                          }}
                                          editorState={hintFormatState}
                                          toolbarClassName="toolbarClassName"
                                          wrapperClassName="wrapperClassName"
                                          editorClassName="editorClassName"
                                          toolbar={{
                                            image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                          }}
                                        // onEditorStateChange={onEditorStateChange}
                                        />
                                        <textarea
                                          hidden={true}
                                          name="hint"
                                          className="text-area "
                                          value={draftToHtml(
                                            convertToRaw(
                                              hintFormatState.getCurrentContent()
                                            )
                                          )}
                                          onChange={updateData}
                                        />
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>

                            <Row>
                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Problem Editorial
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="editorial"
                                          defaultEditorState={editorialFormatState}
                                          onEditorStateChange={(
                                            editorialFormatState
                                          ) => {
                                            setEditorialFormatState(editorialFormatState);
                                            onEditorStateChangeEditorial(editorialFormatState);
                                          }}
                                          editorState={editorialFormatState}
                                          toolbarClassName="toolbarClassName"
                                          wrapperClassName="wrapperClassName"
                                          editorClassName="editorClassName"
                                          toolbar={{
                                            image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                          }}
                                        // onEditorStateChange={onEditorStateChange}
                                        />
                                        <textarea
                                          hidden={true}
                                          name="editorial"
                                          className="text-area "
                                          value={draftToHtml(
                                            convertToRaw(
                                              editorialFormatState.getCurrentContent()
                                            )
                                          )}
                                          onChange={updateData}
                                        />
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>

                            <Row>
                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Input Format
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="input_format"
                                          defaultEditorState={inputFormatState}
                                          onEditorStateChange={(
                                            inputFormatState
                                          ) => {
                                            setInputFormatState(inputFormatState);
                                            onEditorStateChange1(inputFormatState);
                                          }}
                                          inputFormatState={inputFormatState}
                                          toolbarClassName="toolbarClassName"
                                          wrapperClassName="wrapperClassName"
                                          editorClassName="editorClassName"
                                          toolbar={{
                                            image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                          }}
                                        // onEditorStateChange={onEditorStateChange}
                                        />
                                        <textarea
                                          hidden={true}
                                          name="input_format"
                                          className="text-area "
                                          value={draftToHtml(
                                            convertToRaw(
                                              inputFormatState.getCurrentContent()
                                            )
                                          )}
                                          onChange={updateData}
                                        />
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                            <Row>
                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Output Format
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="output_format"
                                          defaultEditorState={outputFormatState}
                                          onEditorStateChange={(
                                            outputFormatState
                                          ) => {
                                            setOutputFormatState(outputFormatState);
                                            onEditorStateChange2(outputFormatState);
                                          }}
                                          editorState={outputFormatState}
                                          toolbarClassName="toolbarClassName"
                                          wrapperClassName="wrapperClassName"
                                          editorClassName="editorClassName"
                                          toolbar={{
                                            image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                          }}
                                        // onEditorStateChange={onEditorStateChange}
                                        />
                                        <textarea
                                          hidden={true}
                                          name="output_format"
                                          className="text-area "
                                          value={draftToHtml(
                                            convertToRaw(
                                              outputFormatState.getCurrentContent()
                                            )
                                          )}
                                          onChange={updateData}
                                        />
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                            <Row>
                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Input -1
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="input"
                                          defaultEditorState={inputState}
                                          onEditorStateChange={(
                                            inputState
                                          ) => {
                                            setInputState(inputState);
                                            onEditorStateChange3(inputState);
                                          }}
                                          editorState={inputState}
                                          toolbarClassName="toolbarClassName"
                                          wrapperClassName="wrapperClassName"
                                          editorClassName="editorClassName"
                                          toolbar={{
                                            image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                          }}
                                        // onEditorStateChange={onEditorStateChange}
                                        />
                                        <textarea
                                          hidden={true}
                                          name="input"
                                          className="text-area "
                                          value={draftToHtml(
                                            convertToRaw(
                                              inputState.getCurrentContent()
                                            )
                                          )}
                                          onChange={updateData}
                                        />
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                            <Row>
                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Output-1{" "}
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="output"
                                          defaultEditorState={outputState}
                                          onEditorStateChange={(
                                            outputState
                                          ) => {
                                            setOutputState(outputState);
                                            onEditorStateChange4(outputState);
                                          }}
                                          editorState={outputState}
                                          toolbarClassName="toolbarClassName"
                                          wrapperClassName="wrapperClassName"
                                          editorClassName="editorClassName"
                                          toolbar={{
                                            image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                          }}
                                        // onEditorStateChange={onEditorStateChange}
                                        />
                                        <textarea
                                          hidden={true}
                                          name="output"
                                          className="text-area "
                                          value={draftToHtml(
                                            convertToRaw(
                                              outputState.getCurrentContent()
                                            )
                                          )}
                                          onChange={updateData}
                                        />
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>

                            {/* Input 2 and output 2 */}

                            <Row>
                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Input-2
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="input2"
                                          defaultEditorState={input2State}
                                          onEditorStateChange={(
                                            input2State
                                          ) => {
                                            setInput2State(input2State);
                                            onEditorInput2StateChange3(input2State);
                                          }}
                                          editorState={input2State}
                                          toolbarClassName="toolbarClassName"
                                          wrapperClassName="wrapperClassName"
                                          editorClassName="editorClassName"
                                          toolbar={{
                                            image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                          }}
                                        // onEditorStateChange={onEditorStateChange}
                                        />
                                        <textarea
                                          hidden={true}
                                          name="input2"
                                          className="text-area "
                                          value={draftToHtml(
                                            convertToRaw(
                                              input2State.getCurrentContent()
                                            )
                                          )}
                                          onChange={updateData}
                                        />
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                            <Row>
                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Output-2{" "}
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="output2"
                                          defaultEditorState={output2State}
                                          onEditorStateChange={(
                                            output2State
                                          ) => {
                                            setOutput2State(output2State);
                                            onEditorOutput2StateChange4(output2State);
                                          }}
                                          editorState={output2State}
                                          toolbarClassName="toolbarClassName"
                                          wrapperClassName="wrapperClassName"
                                          editorClassName="editorClassName"
                                          toolbar={{
                                            image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                          }}
                                        // onEditorStateChange={onEditorStateChange}
                                        />
                                        <textarea
                                          hidden={true}
                                          name="output2"
                                          className="text-area "
                                          value={draftToHtml(
                                            convertToRaw(
                                              output2State.getCurrentContent()
                                            )
                                          )}
                                          onChange={updateData}
                                        />
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>

                            {/* Input 3 and output 3 */}

                            <Row>
                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Input-3
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="input3"
                                          defaultEditorState={input3State}
                                          onEditorStateChange={(
                                            input3State
                                          ) => {
                                            setInput3State(input3State);
                                            onEditorInput3StateChange3(input3State);
                                          }}
                                          editorState={input3State}
                                          toolbarClassName="toolbarClassName"
                                          wrapperClassName="wrapperClassName"
                                          editorClassName="editorClassName"
                                          toolbar={{
                                            image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                          }}
                                        // onEditorStateChange={onEditorStateChange}
                                        />
                                        <textarea
                                          hidden={true}
                                          name="input3"
                                          className="text-area "
                                          value={draftToHtml(
                                            convertToRaw(
                                              input3State.getCurrentContent()
                                            )
                                          )}
                                          onChange={updateData}
                                        />
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                            <Row>
                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Output-3{" "}
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="output3"
                                          defaultEditorState={output3State}
                                          onEditorStateChange={(
                                            output3State
                                          ) => {
                                            setOutput3State(output3State);
                                            onEditorOutput3StateChange4(output3State);
                                          }}
                                          editorState={output3State}
                                          toolbarClassName="toolbarClassName"
                                          wrapperClassName="wrapperClassName"
                                          editorClassName="editorClassName"
                                          toolbar={{
                                            image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                          }}
                                        // onEditorStateChange={onEditorStateChange}
                                        />
                                        <textarea
                                          hidden={true}
                                          name="output3"
                                          className="text-area "
                                          value={draftToHtml(
                                            convertToRaw(
                                              output3State.getCurrentContent()
                                            )
                                          )}
                                          onChange={updateData}
                                        />
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>


                            {/* Input 4 and output 4 */}

                            <Row>
                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Input-4
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="input4"
                                          defaultEditorState={input4State}
                                          onEditorStateChange={(
                                            input4State
                                          ) => {
                                            setInput4State(input4State);
                                            onEditorInput4StateChange3(input4State);
                                          }}
                                          editorState={input4State}
                                          toolbarClassName="toolbarClassName"
                                          wrapperClassName="wrapperClassName"
                                          editorClassName="editorClassName"
                                          toolbar={{
                                            image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                          }}
                                        // onEditorStateChange={onEditorStateChange}
                                        />
                                        <textarea
                                          hidden={true}
                                          name="input4"
                                          className="text-area "
                                          value={draftToHtml(
                                            convertToRaw(
                                              input4State.getCurrentContent()
                                            )
                                          )}
                                          onChange={updateData}
                                        />
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                            <Row>
                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Output-4{" "}
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="output4"
                                          defaultEditorState={output4State}
                                          onEditorStateChange={(
                                            output4State
                                          ) => {
                                            setOutput4State(output4State);
                                            onEditorOutput4StateChange4(output4State);
                                          }}
                                          editorState={output4State}
                                          toolbarClassName="toolbarClassName"
                                          wrapperClassName="wrapperClassName"
                                          editorClassName="editorClassName"
                                          toolbar={{
                                            image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                          }}
                                        // onEditorStateChange={onEditorStateChange}
                                        />
                                        <textarea
                                          hidden={true}
                                          name="output4"
                                          className="text-area "
                                          value={draftToHtml(
                                            convertToRaw(
                                              output4State.getCurrentContent()
                                            )
                                          )}
                                          onChange={updateData}
                                        />
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>

                            {/* Input 4 and output 4 */}

                            <Row>
                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Explaination
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="explaination"
                                          defaultEditorState={explainationState}
                                          onEditorStateChange={(
                                            explainationState
                                          ) => {
                                            setExplainationState(explainationState);
                                            onEditorExplainationStateChange4(explainationState);
                                          }}
                                          editorState={explainationState}
                                          toolbarClassName="toolbarClassName"
                                          wrapperClassName="wrapperClassName"
                                          editorClassName="editorClassName"
                                          toolbar={{
                                            image: { uploadCallback: imageUploadCallback, alt: { present: true, mandatory: false } }
                                          }}
                                        // onEditorStateChange={onEditorStateChange}
                                        />
                                        <textarea
                                          hidden={true}
                                          name="explaination"
                                          className="text-area "
                                          value={draftToHtml(
                                            convertToRaw(
                                              explainationState.getCurrentContent()
                                            )
                                          )}
                                          onChange={updateData}
                                        />
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>





                            <Row>
                              <Col className="input_label_row">
                                <Row className="label_row_editor">
                                  <label
                                    htmlFor="txtCompanyBilling"
                                    className="label_division_editor"
                                  >
                                    Constraints{" "}
                                  </label>

                                  <Col>
                                    <Card>
                                      <CardBody>
                                        <Editor
                                          name="constraints"
                                          defaultEditorState={constraintsState}
                                          onEditorStateChange={(
                                            constraintsState
                                          ) => {
                                            setConstraintsState(constraintsState);
                                            onEditorStateChange5(constraintsState);
                                          }}
                                          editorState={constraintsState}
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
                                          value={draftToHtml(
                                            convertToRaw(
                                              constraintsState.getCurrentContent()
                                            )
                                          )}
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

                                    {rows2.map((item2, idx) => (
                                      <React.Fragment key={idx}>
                                        <div
                                          data-repeater-list="group-a"
                                          id={"addr" + idx}
                                        >
                                          <div
                                            data-repeater-item
                                            className="row"
                                          >
                                            <h1 className="card-title mb-4">
                                              Test case-{idx + 1}
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
                                                value={item2.testcase_input}
                                                onChange={(e) =>
                                                  handleTestcaseChange(e, idx)
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
                                                value={item2.testcase_output}
                                                onChange={(e) =>
                                                  handleTestcaseChange(e, idx)
                                                }
                                              />
                                            </div>
                                            {idx >= 2 ? (
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
                                                    handleRemoveRows(e, idx);
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
                                        </div>
                                      </React.Fragment>
                                    ))}
                                    <Button
                                      onClick={() => {
                                        handleAddRowNested1();
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

                                    {rows1.map((item1, idx) => (
                                      <React.Fragment key={idx}>
                                        <div
                                          data-repeater-list="group-a"
                                          id={"addr" + idx}
                                        >
                                          <div
                                            data-repeater-item
                                            className="row"
                                          >
                                            <h1 className="card-title mb-4">
                                              Test case-{idx + 1}
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
                                                  item1.hidden_testcase_input
                                                }
                                                onChange={(e) =>
                                                  handleHiddenTestcaseChange(
                                                    e,
                                                    idx
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
                                                  item1.hidden_testcase_output
                                                }
                                                onChange={(e) =>
                                                  handleHiddenTestcaseChange(
                                                    e,
                                                    idx
                                                  )
                                                }
                                              ></textarea>
                                            </div>

                                            {idx >= 2 ? (
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
                                                    handleRemoveRow(e, idx);
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
                                        </div>
                                      </React.Fragment>
                                    ))}
                                    <Button
                                      onClick={() => {
                                        handleAddRowNested();
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
                                    className={classnames({
                                      active:
                                        currentActiveTab === '1'
                                    })}
                                    onClick={() => { toggle('1'); }}
                                  >
                                    C
                                  </NavLink>
                                </NavItem>
                                <NavItem>
                                  <NavLink
                                    className={classnames({
                                      active:
                                        currentActiveTab === '2'
                                    })}
                                    onClick={() => { toggle('2'); }}
                                  >
                                    C++
                                  </NavLink>
                                </NavItem>
                                <NavItem>
                                  <NavLink
                                    className={classnames({
                                      active:
                                        currentActiveTab === '3'
                                    })}
                                    onClick={() => { toggle('3'); }}
                                  >
                                    Java
                                  </NavLink>
                                </NavItem>
                                <NavItem>
                                  <NavLink
                                    className={classnames({
                                      active:
                                        currentActiveTab === '4'
                                    })}
                                    onClick={() => { toggle('4'); }}
                                  >
                                    Python
                                  </NavLink>
                                </NavItem>
                              </Nav>
                              <TabContent activeTab={currentActiveTab}>
                                <TabPane tabId="1">
                                  <Col md={12}>
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
                                        defaultValue=""
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
                                            onChange={handleChange}
                                          // value={userType}
                                          >
                                            <option value="">
                                              --Please Select--
                                            </option>
                                            {optionGroup.map((option) => (
                                              <option
                                                value={option.value}
                                                key={option.value}
                                              >
                                                {option.label}
                                              </option>
                                            ))}
                                          </Input>
                                        </div>
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

                                    <Row
                                      className={
                                        clangfinalres.length <= 0 ||
                                          cIsLoading == true
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
                                                  {clangfinalres.map((ele) => (
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
                                            <p className={cMsgClassName}>
                                              {hiddenTestCaseMsgC}
                                            </p>
                                          </CardBody>
                                        </Card>
                                      </Col>
                                    </Row>
                                  </Col>
                                </TabPane>
                                <TabPane tabId="2">
                                  <Col md={12}>
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
                                        defaultLanguage="c"
                                        defaultValue=""
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
                                            onChange={handleChange}
                                          // value={userType}
                                          >
                                            <option value="">
                                              --Please Select--
                                            </option>
                                            {optionGroup.map((option) => (
                                              <option
                                                value={option.value}
                                                key={option.value}
                                              >
                                                {option.label}
                                              </option>
                                            ))}
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
                                  </Col>
                                </TabPane>
                                <TabPane tabId="3">
                                  <Col md={12}>
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
                                        defaultValue=""
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
                                            onChange={handleChange}
                                          // value={userType}
                                          >
                                            <option value="">
                                              --Please Select--
                                            </option>
                                            {optionGroup.map((option) => (
                                              <option
                                                value={option.value}
                                                key={option.value}
                                              >
                                                {option.label}
                                              </option>
                                            ))}
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
                                  </Col>
                                </TabPane>
                                <TabPane tabId="4">
                                  <Col md={12}>
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
                                        defaultValue=""
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
                                            onChange={handleChange}
                                          // value={userType}
                                          >
                                            <option value="">
                                              --Please Select--
                                            </option>
                                            {optionGroup.map((option) => (
                                              <option
                                                value={option.value}
                                                key={option.value}
                                              >
                                                {option.label}
                                              </option>
                                            ))}
                                          </Input>
                                        </div>
                                        <button
                                          color="success"
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
                                  </Col>
                                </TabPane>
                                <TabPane tabId="4">
                                  <Col md={12}>
                                <Row className="mb-3">
                                  <label
                                    htmlFor="ddlCreditCardType"
                                    className="col-lg-2 col-form-label"
                                  >
                                    VeriLog
                                  </label>
                                  {/* <input type="button" onClick={handleEditorReset} value="Reset" > */}
                                  <div className="col-lg-10 ">
                                    <button
                                      className="btn btn-light "
                                      type="button"
                                      onClick={handleVeriEditorReset}
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
                                    defaultValue=""
                                    options={options}
                                    theme={theme}
                                    onMount={handleVerilogEditorDidMount}
                                    ref={verilogeditorRef}
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
                                        name="verilog_author"
                                        className="authorOptions"
                                        onChange={handleChange}
                                      // value={userType}
                                      >
                                        <option value="">
                                          --Please Select--
                                        </option>
                                        {optionGroup.map((option) => (
                                          <option
                                            value={option.value}
                                            key={option.value}
                                          >
                                            {option.label}
                                          </option>
                                        ))}
                                      </Input>
                                    </div>
                                    <button
                                      color="success"
                                      className="buttonRun"
                                      type="button"
                                      onClick={() => handleRunCode("verilog")}
                                    >
                                      {verilogIsLoading == true ? (
                                        <Spinner size="sm">Loading...</Spinner>
                                      ) : (
                                        ""
                                      )}
                                      <span>
                                        {verilogIsLoading == true
                                          ? " Compailing"
                                          : "Run"}
                                      </span>
                                    </button>
                                  </div>
                                </Row>
                                <Row
                                  className={
                                    verilogfinalres.length <= 0 ||
                                      verilogIsLoading == true
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
                                              {verilogfinalres.map((ele) => (
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
                                        <p className={verilogMsgClassName}>
                                          {hiddenTestCaseMsgVerilog}
                                        </p>
                                      </CardBody>
                                    </Card>
                                  </Col>
                                </Row>
                                </Col>
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
                            <input
                              value={"Previous"}
                              type="button"
                              className="btn btn-primary"
                              onClick={() => {
                                toggleTab(activeTab - 1);
                              }}
                            />
                          </li>
                          <li className={activeTab === 3 ? "next" : "next"}>
                            {activeTab === 3 ? (
                              <button type="button" onClick={addProblemSubmit} className="btn btn-primary">
                                Submit
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
                                    if (err_res.length == 0) {
                                      toggleTab(activeTab + 1);
                                      setactiveTab(2);
                                    }
                                  } else if (activeTab === 2) {
                                    var err_res = Object.entries(
                                      testcase_validate(data)
                                    );
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
          </AvForm>
        </Form>
        {/* </Container> */}
      </div>
      <ToastContainer />
    </React.Fragment>
  );
};

export default AddLevelProblem;
