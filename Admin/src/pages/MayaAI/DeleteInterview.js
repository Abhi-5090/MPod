import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const DeleteInterview = () => {

  const { id } = useParams(); // Get interview ID from URL
  console.log(id)
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    // Fetch interview details
    axios.get(backendUrl+`get-interviewee-details/${id}`)
      .then(response => setInterview(response.data))
      .catch(error => console.error("Error fetching interview:", error));
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(backendUrl+`delete-interviewee-details/${id}`);
      alert("Interview deleted successfully!");
      navigate("/ai-interviews-list"); // Redirect to the list
    } catch (error) {
      console.error("Error deleting interview:", error);
      alert("Failed to delete interview.");
    }
  };

  console.log(interview)

  return (
    <div>
      <h2>Confirm Delete</h2>
      <p>Are you sure you want to delete this interview?</p>
      {/* <p><strong>Interviewee:</strong> {interview.first_name?interview.first_name:"No First Name Found from database"}</p> */}
      {/* <p><strong>Technology:</strong> {interview.technology_name?interview.technology_name:""}</p> */}
      <button className="btn btn-danger btn-sm me-2" onClick={handleDelete}>Delete</button>
      <button className="btn btn-success btn-sm me-2" onClick={() => navigate("/ai-interviews-list")}>Cancel</button>
    </div>
  );
};

export default DeleteInterview;
