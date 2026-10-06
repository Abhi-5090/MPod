import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
} from "reactstrap";
import { AvForm } from "availity-reactstrap-validation";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { MutatingDots } from 'react-loader-spinner';
import { useNavigate } from "react-router-dom";

const UploadSeatHall = () => {
  document.title = "Technical Hub| Update Seat and Venue";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Bulk Update Seatno and Venue", link: "/update-seat-venue" },
    { title: "Update Seatno and Venue", link: "/update-seat-venue" },
  ];

  const [file, setFile] = useState(null);
  const [showButton, setShowButton] = useState(true); // State for button visibility
  const [isLoading, setIsLoading] = useState(false); // State for loading animation visibility
  const navigate = useNavigate();

  const addData = async () => {
    const formData = new FormData();
    formData.append('file', file);

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    setShowButton(false); // Hide the button
    setIsLoading(true); // Show loading animation

    try {
      const response = await axios.post(backendUrl + 'update-seat-and-venue', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 200) {
        console.log(response.data)
        alert(response.data.message)
        navigate(`/dashboard`)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false); // Hide loading animation
      setShowButton(true); // Show the button again
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    console.log(event.target.files[0])
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Update Seat Position</h4>
              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <div className="mb-3">
                        <label className="form-lable">Upload Data</label><br />
                        <input type="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleFileChange} />
                      </div>
                    </div>
                  </Col>
                </Row>
                {showButton && (
                  <Button color="primary" type="button" onClick={addData}>
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

export default connect(null, { setBreadcrumbItems })(UploadSeatHall);
