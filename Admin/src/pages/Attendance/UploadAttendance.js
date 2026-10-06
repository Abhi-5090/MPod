import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
} from "reactstrap";
import { AvForm } from "availity-reactstrap-validation";
import Select from "react-select";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { MutatingDots } from 'react-loader-spinner';
import { useNavigate } from "react-router-dom";

const UploadAttendance = (props) => {
  document.title = "Technial Hub | Upload Attendance";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Attendance", link: "/upload-attendance" },
    { title: "Upload Attendance", link: "/upload-attendance" },
  ];

  const [data, setData] = useState({});
  const [technologyData, setTechnologyData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [selectedGroup, setselectedGroup] = useState(null);
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null);
  const [selectedCourseGroup, setselectedCourseGroup] = useState(null);
  const [selectedBatchGroup, setselectedBatchGroup] = useState(null);
  const [selectedModeGroup, setselectedModeGroup] = useState(null);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState("");
  // const [isDisable, setIsDisable] = useState(false); // State to disable button
  const [showButton, setShowButton] = useState(true); // State for button visibility
  const [isLoading, setIsLoading] = useState(false); // State for loading animation visibility


  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' ||authUser.role == 'operations' || authUser.role == 'coding') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);
 
  useEffect(() => {
    props.setBreadcrumbItems('Upload Attendance', breadcrumbItems);
    fetchTechnologyData();
    fetchCourseData();
  }, []);

  useEffect(() => {
    if (selectedTechnologyGroup) {
      fetchBatchData();
    }
    // Removed unnecessary fetchTechnologyData() call here
  }, [selectedTechnologyGroup, selectedCourseGroup]);

  const fetchTechnologyData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-technology-by-course-id/', { course_id: selectedCourseGroup.value });
      if (response.status === 200) {
        setTechnologyData(response.data);
      }
    } catch (error) {
      console.log("Error fetching technology data:", error);
    }
  };

  const fetchBatchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-batch-by-technology/', { technology_id: selectedTechnologyGroup.value });
      if (response.status === 200) {
        setBatchData(response.data);
      }
    } catch (error) {
      console.log("Error fetching batch data:", error);
    }
  };

  const fetchCourseData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-courses');
      if (response.status === 200) {
        setCourseData(response.data);
      }
    } catch (error) {
      console.log("Error fetching course data:", error);
    }
  };

  const modeOptionGroup = [
    {
      options: [
        { label: "Lightmode", value: "lightmode" },
        { label: "Brightmode", value: "brightmode" },
        { label: "Shinemode", value: "shinemode" },
        { label: "Darkmode", value: "darkmode" },
        { label: "Moonmode", value: "moonmode" },
      ]
    },
  ];

  const handleSelectModeGroup = (selectedGroup) => {
    setselectedModeGroup(selectedGroup);
  };

  const addTopic = async () => {
    const formData = new FormData();
    formData.append('file', file);

    if (selectedModeGroup) {
      formData.append('batch_mode', selectedModeGroup.value);
    } else {
      alert("Please select mode");
      return; // Prevent further execution if mode is not selected
    }

    formData.append('attendance_date', data.attendance_date);

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    setShowButton(false); // Hide the button
    setIsLoading(true); // Show loading animation

    try {
      if(file){

        const response = await axios.post(backendUrl + 'bulk-attendance-upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.status === 200) {
          let not_uploaded = response.data.filter(ele => ele.remarks === "User not exists in batch");
          const rollNos = not_uploaded.map(obj => obj.roll_no);
          const rollNosString = rollNos.join('\n');
          alert(rollNosString + "\n No Batch assigned to these trainees");
          // Navigate or perform other actions upon successful upload
          navigate(`/attendance`);
        }
      }else{
        alert("Please select the file to upload")
      }
    } catch (error) {
      console.error('Error uploading attendance:', error);
    } finally {
      
      setShowButton(true); // Show the button
      setIsLoading(false); // Hide loading animation
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleChange = (event) => {
    if (event.target.name === "attendance_date") {
      let date = event.target.value;
      let formattedDate = date.split("-").reverse().join("-");
      setData({ ...data, [event.target.name]: formattedDate });
    } else {
      setData({ ...data, [event.target.name]: event.target.value });
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Upload Attendance</h4>

              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <div className="mb-3">
                        <label className="form-lable">Attendance date</label><br />
                        <input type="date" onChange={handleChange} name="attendance_date" className="form-control" data-buttonname="btn-secondary" />
                      </div>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Mode</Label>
                      <Select
                        value={selectedModeGroup}
                        onChange={handleSelectModeGroup}
                        options={modeOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <div className="mb-3">
                        <label className="form-lable">Upload topics</label><br />
                        <input type="file" className="form-control form-control-file" required data-buttonname="btn-secondary" onChange={handleFileChange} />
                      </div>
                    </div>
                  </Col>
                </Row>

                {showButton && (
                  <Button color="primary" type="button" onClick={addTopic}>
                    Submit
                  </Button>
                )}
                {isLoading && (
                  <div className="text-center mt-4">
                    <MutatingDots
                      height={100}
                      width={100}
                      color="#2B3A4A"
                      secondaryColor="#2B3A4A"
                      radius={12.5}
                      ariaLabel="mutating-dots-loading"
                    />
                  </div>
                )}
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(UploadAttendance);
