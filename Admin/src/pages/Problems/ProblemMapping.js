import React, { useEffect, useState } from "react";
import {
  UncontrolledAlert,
  Alert,
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  CardTitle,
  Label,
} from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select"
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom"
import { MutatingDots, Bars } from 'react-loader-spinner';

const MapProblem = (props) => {
  const navigate = useNavigate();
  document.title = "Technial Hub| Problem Mapping";
  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Users", link: "/map-problem" },
    { title: "Problem Mapping", link: "/map-problem" },
  ];
  const [data, setData] = useState({});
  const [viewProblem, setViewProblem] = useState();
  const [technologySelectedGroup, setTechnologySelectedGroup] = useState()        //selected technologies will be added into this list 
  const [technologyData, setTechnologyData] = useState([])                        //contains selected technologies data from the database
  const [moduleSelectedGroup, setModuleSelectedGroup] = useState()                //selected modules will be added into this list
  const [modulesData, setModulesData] = useState([])                              //contains selected modules info from the database
  const [tagSelectedGroup, setTagSelectedGroup] = useState()                      //selected tags will be added into this list
  const [tagsData, setTagsData] = useState([])                                    //contains selected tags info from the database
  const [problemSelectedGroup, setProblemSelectedGroup] = useState()                      //selected problems will be added into this list
  const [problemsData, setProblemsData] = useState([])
  const [mapResponse, setMapResponse] = useState();                                    //contains selected problems info from the database
  const [alreadyMappedProblemsData, setAlreadyMappedProblemsData] = useState();
  const [checkedProblems, setCheckedProblems] = useState([]);
  const [isUnMapping, setIsUnMapping] = useState(false); // For mapping/unmapping animation
  const [buttonDisabled, setButtonDisabled] = useState(false); // For disabling the button
  const [isMapping, setIsMapping] = useState(false); // For mapping/unmapping animation
  const [submitDisabled, setSubmitDisabled] = useState(false); // For disabling the button


  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' ||authUser.role == 'intern') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);


  useEffect(() => {
    props.setBreadcrumbItems('Problem Mapping', breadcrumbItems);
    fetchData();          //direclty calls the fetcgtechnolgies function
    fetchTagsData();      //direclty calls the fetchtags function
    if (technologySelectedGroup) {
      fetchModulesData();   //fetchmodules dataa will executes based on the selected technolgoies given in the dependencies
    }
    if (tagSelectedGroup) {
      fetchProblemsDataByTags();   //fetchProblems Data by tags will executes based on the selected tags given in the dependencies
    }
  }, [technologySelectedGroup, tagSelectedGroup]);

  //getting technolgies info
  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-technologies');
      if (response.status === 200) {
        let technologies_data = response.data.filter(ele => ele.technology_category === "owlground")
        setTechnologyData(technologies_data);
      }

    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  //getting Tags info
  const fetchTagsData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'tags-list');
      setTagsData(response.data['tags']);

    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  //getting modules info
  const fetchModulesData = async () => {
    let technologiesArray = technologySelectedGroup.map(ele => ele.value)
    let technologies = { "technologies": technologiesArray }


    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-modules-by-technologies', technologies);
      if (response.status === 200) {
        setModulesData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  //getting problems info
  const fetchProblemsDataByTags = async () => {
    let tagsArray = tagSelectedGroup.map(ele => ele.value)
    let tags = { "tags": tagsArray }

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-problems-by-tags', tags);

      setProblemsData(response.data);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  //Unmapping the problem from the selected course, module and technology

  const unMapProblem = async () => {
    setIsUnMapping(true); // Show mapping/unmapping animation
    setButtonDisabled(true); // Disable the button during the request

    let final_checked_problems = checkedProblems.map((ele) => {
      return { problem: ele.problem_id, course: ele.course_id, technology: ele.technology_id, module: ele.module_id }
    })
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      let deleted = await axios.post(backendUrl + "problem-unmapping", { problems_to_unmap: final_checked_problems })
      alert(deleted.data.problems_unmapped.length + " problems unmapped successfully")
      // navigate("/problems-list")
      // Refresh the page after a delay of 3 seconds
      setTimeout(function () {
        // eslint-disable-next-line no-restricted-globals
        location.reload();
      }, 3000); // 3000 milliseconds = 3 seconds
      setIsUnMapping(true); // Show mapping/unmapping animation
      setButtonDisabled(true); // Disable the button during the request
    } catch (err) {
      setIsUnMapping(true); // Show mapping/unmapping animation
      setButtonDisabled(true); // Disable the button during the request
      console.log(err)
    }



  }

  //getting options to the technolgy dropdown
  const optionGroup = technologyData.map((ele) => ({
    options: [
      { label: ele.technology_name, value: ele._id }
    ]
  }));

  //getting options to the module dropdown
  const moduleOptionGroup = modulesData.map((ele) => ({
    options: [
      { label: ele.technology_name + "=>" + ele.module_name, value: { course: ele.course_id, technology: ele.technology_id, module: ele._id } }
    ]
  }));

  //getting options to the tags dropdown
  const tagOptionGroup = tagsData.map((ele) => ({
    options: [
      { label: ele.tag_name, value: ele._id }
    ]
  }));


  const handleViewClick = async (event, problemId) => {
    event.stopPropagation();
    // Your logic to view the problem, e.g., navigate to a different page or open a modal
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      let get_problem = await axios.get(backendUrl + "get-problem/" + problemId)
      setViewProblem(get_problem.data[0])

    } catch (err) {
      console.log(err)
    }

  };



  //getting options to the Problems dropdown
  const problemOptionGroup = problemsData.map((ele) => ({
    options: [
      {
        label: (
          <div className="row">
            <div className="col-md-11">{ele.problem_name}</div>
            <div className="col-md-1">
              <a href="#" onClick={(event) => handleViewClick(event, ele._id)}>View</a>
            </div>
          </div>
        ), value: ele._id
      }
    ]
  }));


  //handles all selected modules and storing in the moduleselectedgroup
  async function handleModuleSelectGroup(e) {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    setModuleSelectedGroup(e)

    let moduleSelectedGroupArray
    moduleSelectedGroupArray = e.map(ele => ele.value)
    const mapped_problems = await axios.post(backendUrl + "get-problems-by-technology-and-module", { mapped_to: moduleSelectedGroupArray })
    if (mapped_problems) {
      setAlreadyMappedProblemsData(mapped_problems.data)
    }
  }

  //handles all selected technologies and storing in the technologiesselectedgroup
  function handleTechnologySelectGroup(e) {
    setTechnologySelectedGroup(e)
  }

  //handles all selected tags and storing in the tagselectedgroup
  function handleTagSelectGroup(e) {
    setTagSelectedGroup(e)
  }

  //handles all selected tags and storing in the tagselectedgroup
  function handleProblemSelectGroup(e) {
    setProblemSelectedGroup(e)
  }

  //handles


  const handleCheckboxChange = (event, problemId, courseId, technologyId, moduleId) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      // Add problem to checkedProblems
      setCheckedProblems(prevChecked => [...prevChecked, { problem_id: problemId, course_id: courseId, technology_id: technologyId, module_id: moduleId }]);
    } else {
      // Remove problem from checkedProblems
      setCheckedProblems(prevChecked => prevChecked.filter(p => p.problem_id !== problemId));
    }

  };

  const mapProblem = async () => {
    setIsMapping(true); // Show mapping/unmapping animation
    setSubmitDisabled(true); // Disable the button during the request
    try {
      let moduleSelectedGroupArray
      let problemSelectedGroupArray
      if (typeof (moduleSelectedGroup) != 'undefined' && typeof (problemSelectedGroup) != 'undefined') {
        moduleSelectedGroupArray = moduleSelectedGroup.map(ele => ele.value)
        problemSelectedGroupArray = problemSelectedGroup.map(ele => ele.value)
      }

      data.problems = problemSelectedGroupArray
      data.mapped_to = moduleSelectedGroupArray
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.post(backendUrl + 'problem-mapping', data);
      if (response.status == 200) {
        setMapResponse(response.data)
        alert("Program Mapping Success");
        toast('Mapped successfully', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        // Refresh the page after a delay of 3 seconds
        setTimeout(function () {
          // eslint-disable-next-line no-restricted-globals
          location.reload();
        }, 3000); // 3000 milliseconds = 3 seconds
        setIsMapping(false); // Show mapping/unmapping animation
        setSubmitDisabled(false); // Disable the button during the request
      }

    } catch (error) {
      console.log(error)
      setIsMapping(true); // Show mapping/unmapping animation
      setSubmitDisabled(true); // Disable the button during the request
    }
  };

  const dataa = {
    columns: [
      { label: "Problem name", field: "problem_name", sort: "asc", width: 150 },
      { label: "Module", field: "module", sort: "asc", width: 150 },
      { label: "Technology", field: "technology", sort: "asc", width: 150 },
      { label: "Check to Unmap", field: "actions", sort: "asc", width: 30 }
    ],

    rows: typeof (alreadyMappedProblemsData) != "undefined" ? alreadyMappedProblemsData.map((problem, ind) => ({
      problem_name: problem.problem_name,
      module: problem.module_name,
      technology: problem.technology_name,
      actions: (
        <div>
          <input
            style={{ width: "20px", height: "20px" }}
            className="form-check-input"
            type="checkbox"
            id={`problem-${problem.problem_id}`}
            onChange={e => handleCheckboxChange(e, problem.problem_id, problem.course_id, problem.technology_id, problem.module_id)}

          />

        </div>
      ),
    })) : "",
  };



  return (
    <React.Fragment>
      <Row>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}  // Corrected this line
        />

        {/* Same as */}
        <ToastContainer />

        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Problem Mapping</h4>

              <AvForm className="needs-validation">



                <Row>
                  {/* Technologies list */}
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select technology</Label>
                      <Select
                        onChange={handleTechnologySelectGroup}
                        options={optionGroup}
                        isMulti={true}

                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>

                  {/* getting modules from the selected technolgies */}
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Modules</Label>
                      <Select
                        onChange={handleModuleSelectGroup}
                        isMulti={true}
                        options={moduleOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  {/* getting tags to filter the problems based on the tags */}
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Filter Problems by Tag</Label>
                      <Select
                        onChange={handleTagSelectGroup}
                        isMulti={true}
                        options={tagOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                    <span className="mb-3" style={{ color: "red" }}>{tagSelectedGroup != undefined && tagSelectedGroup.length > 0 ? problemsData.length + " problems avalilable with the selected tags" : tagSelectedGroup == undefined ? "" : ""}</span>
                  </Col>
                </Row>

                <Row>
                  {/* getting tags to filter the problems based on the tags */}
                  <Col md="12">
                    <div className="mb-3">
                      <Label>Problems List</Label>
                      <Select
                        onChange={handleProblemSelectGroup}
                        isMulti={true}
                        options={problemOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>

                <Button color="primary" type="button" onClick={mapProblem} disabled={submitDisabled}>
                  Submit
                  {isMapping && (
                    <Bars
                      style={{ display: "inline" }}
                      height="20"
                      width="20"
                      color="white"
                      ariaLabel="bars-loading"
                      wrapperStyle={{}}
                      wrapperClass=""
                    />
                  )}
                </Button>
              </AvForm>
            </CardBody>
          </Card>

          <Row>
            <Col>
              <Card>
                <CardBody>
                  {
                    alreadyMappedProblemsData != undefined ?
                      <>
                        <MDBDataTable responsive bordered data={dataa} noBottomColumns />
                        <button className="btn bg-danger color-white" style={{ background: "transparent" }} onClick={unMapProblem} disabled={buttonDisabled}>
                          Unmap
                          {isUnMapping && (
                            <Bars
                              style={{ display: "inline" }}
                              height="20"
                              width="20"
                              color="white"
                              ariaLabel="bars-loading"
                              wrapperStyle={{}}
                              wrapperClass=""
                            />
                          )}
                        </button>

                      </>

                      : (<></>)
                  }
                </CardBody>
              </Card>

              {mapResponse != undefined ?
                mapResponse.already_mapped.map((ele, ind) => {
                  return (
                    <Alert key={ind} color="danger" className="mb-0">
                      {/* <h4 className="card-title">Already Mapped</h4> */}
                      <p><strong>{ele.problem}</strong> is already mapped to <strong>{ele.module}</strong> technology <strong>{ele.technology}</strong> module </p>
                    </Alert>

                  )
                })
                : (<></>)}

              {mapResponse != undefined ?
                mapResponse.mapped.map((ele, ind) => {
                  return (
                    <Alert key={ind} color="success" className="mb-0">
                      {/* <h4 className="card-title">Already Mapped</h4> */}
                      <p><strong>{ele.problem}</strong> is now mapped to  <strong>{ele.module}</strong> in <strong>{ele.technology}</strong> module </p>
                    </Alert>
                  )

                })
                : (<></>)}




            </Col>
          </Row>
        </Col>

        <Col xl={6}>
          {viewProblem ? (
            <Card>
              <CardBody>
                <CardTitle as="h3"></CardTitle>
                <h4>{viewProblem.problem_name}</h4>
                <h5>Description</h5>
                <p className="card-title-desc" dangerouslySetInnerHTML={{ __html: viewProblem.problem_data.problem_desc }}></p>
                <h5>Input Format</h5>
                <p className="card-title-desc" dangerouslySetInnerHTML={{ __html: viewProblem.problem_data.input_format }}></p>
                <h5>Output Format</h5>
                <p className="card-title-desc" dangerouslySetInnerHTML={{ __html: viewProblem.problem_data.output_format }}></p>
                <h5>Input</h5>
                <p className="card-title-desc" dangerouslySetInnerHTML={{ __html: viewProblem.problem_data.input }}></p>
                <h5>Output</h5>
                <p className="card-title-desc" dangerouslySetInnerHTML={{ __html: viewProblem.problem_data.output }}></p>
                <h5>Constraints</h5>
                <p className="card-title-desc" dangerouslySetInnerHTML={{ __html: viewProblem.problem_data.constraints }}></p>
                <h5>C Code</h5>
                {viewProblem.c_editor_data.c_code != "" ? (<p className="card-title-desc p-2 mb-2 bg-dark text-white"><pre><code>{viewProblem.c_editor_data.c_code}</code></pre></p>) : (<p>no C Code</p>)}
                <h5>Cpp Code</h5>
                {viewProblem.cpp_editor_data.cpp_code != "" ? (<p className="card-title-desc p-2 mb-2 bg-dark text-white"><pre><code>{viewProblem.cpp_editor_data.cpp_code}</code></pre></p>) : (<p>no CPP Code</p>)}
                <h5>Java Code</h5>
                {viewProblem.java_editor_data.java_code != "" ? (<p className="card-title-desc p-2 mb-2 bg-dark text-white"><pre><code>{viewProblem.java_editor_data.java_code}</code></pre></p>) : (<p>no Java Code</p>)}
                <h5>Python Code</h5>
                {viewProblem.python_editor_data.python_code != "" ? (<p className="card-title-desc p-2 mb-2 bg-dark text-white"><pre><code>{viewProblem.python_editor_data.python_code}</code></pre></p>) : (<p>no Python Code</p>)}

                {/* 
            <div>
              <div className="p-2 mb-2 bg-primary text-white">bg-primary</div>
              <div className="p-2 mb-2 bg-secondary text-white">bg-secondary</div>
              <div className="p-2 mb-2 bg-success text-white">bg-success</div>
              <div className="p-2 mb-2 bg-danger text-white">bg-danger</div>
              <div className="p-2 mb-2 bg-warning text-white">bg-warning</div>
              <div className="p-2 mb-2 bg-info text-white">bg-info</div>
              <div className="p-2 mb-2 bg-light text-reset">bg-light</div>
              <div className="p-2 mb-2 bg-dark text-white">bg-dark</div>
              <div className="p-2 mb-2 bg-body text-reset">bg-body</div>
              <div className="p-2 mb-2 bg-white text-reset">bg-white</div>
              <div className="p-2 mb-2 bg-transparent text-reset">bg-transparent</div>
            </div> */}
              </CardBody>
            </Card>
          ) : <></>}

        </Col>
      </Row >
    </React.Fragment >
  );
};

export default connect(null, { setBreadcrumbItems })(MapProblem);
