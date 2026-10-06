import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Label } from "reactstrap";
import { MutatingDots } from 'react-loader-spinner';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import * as XLSX from 'xlsx'; 
import { saveAs } from 'file-saver';
import Flatpickr from "react-flatpickr";
import cpp  from "../../assets/images/student-explore-images/C++.png"
import python  from "../../assets/images/student-explore-images/Python.png"
import java  from "../../assets/images/student-explore-images/Java.png"
// import leetCode  from "../../assets/images/student-explore-images/LeetCode_logo_black"


const StudentExplore = (props) => {
// console.log(props)
const roll_no = props.searchTerm;


  const sectionTitleStyle = {
    color: '#008738',
    // fontWeight: 'bold',
  }; 

  const dashboardContainerStyle = {
    padding: '10px',
    width: '100%',
    borderRadius: '10px',
    border: '1px solid #008738',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  };
  const cardStyle = {
    borderRadius: '10px',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.3)',
  };

  const textAlign = {
    textAlign:'right',
    color:"#008738",
  }
  
  const problems = {
    color: '#4caf50',
    fontSize: '0.9rem',
    marginBottom: 0,
    textAlign: 'center'
  };
  
  const problemsCount = {
    fontSize: '1.5rem',
    color: '#5a5a5a',
    fontWeight: 600,
    textAlign: 'center'
  };

  const easy = {
    color: '#4caf50',
    margin: 0,
    fontSize: '0.85rem',
    fontWeight: 'bold'
  };

  const medium = {
    color: '#ff9800',
    margin: 0,
    fontSize: '0.85rem',
    fontWeight: 'bold'
  };

  const hard = {
    color: '#f44336',
    margin: 0,
    fontSize: '0.85rem',
    fontWeight: 'bold'
  };


  const horizontalLine = {
    borderTop: '3px solid #4caf50',
    margin: '1rem 0'
  };

  
  // console.log(roll_no)

  const [cData, setCData] = useState();
  const [cppData, setCppData] = useState();
  const [javaData, setJavaData] = useState();
  const [pythonData, setPythonData] = useState();
  const [leetcodeTotal, setLeetcodeTotal] = useState();
  const [leetcodeEasy, setLeetcodeEasy] = useState();
  const [leetcodeMedium, setLeetcodeMedium] = useState();
  const [leetcodeHard, setLeetcodeHard] = useState();
  const [gfgTotal, setGfgTotal] = useState();
  const [gfgEasy, setGfgEasy] = useState();
  const [gfgMedium, setGfgMedium] = useState();
  const [gfgHard, setGfgHard] = useState();
  const [codechefTotal, setCodechefTotal] = useState();
  const [codechefContests, setCodechefContests] = useState();
  const [codechefRank, setCodechefRank]= useState();
  const [codechefStarRating, setCodechefStarRating] = useState();
  const [hackerRankTotalStars, setHackerRankTotalStars] = useState();
  const [hackerRankBadges, setHackerRankBadges] = useState();
  const[hackerRankCertificationsCount, setHackerRankCertificationsCount] = useState();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;


//fetching Coding Data
useEffect(()=> {
  const fetchCodingStatistics = async() => {
    try{
      const response = await axios.post(backendUrl+'coding-statistics-for-app', {roll_no : roll_no});
      if(response.status == 200){
        // console.log(response.data);
        setCData(response.data.programmingLanguages.c);
        setCppData(response.data.programmingLanguages.cpp);
        setJavaData(response.data.programmingLanguages.java);
        setPythonData(response.data.programmingLanguages.python);
      }
    }
    catch(error){
      console.log(error)
    }
  }
  fetchCodingStatistics();
},[])

// console.log(programmingLanguages);
  




//fetch Leetcode Data
useEffect(() => {
  const fetchLeetcodeData = async() => {
    try{
      const response = await axios.post(backendUrl+'get-leetcode-details-by-rollno', {roll_no : roll_no});
      if(response.status == 200){
        // console.log(response.data)
        setLeetcodeTotal(response.data.lc_total_progarms);
        setLeetcodeEasy(response.data.lc_easy);
        setLeetcodeMedium(response.data.lc_medium);
        setLeetcodeHard(response.data.lc_hard)
      }
    }
    catch(error){
      console.log(error)
    }
  }
  fetchLeetcodeData();
},[])



//fetch GFG Data
useEffect(() => {
  const fetchGfgData = async() => {
    try{
      const response = await axios.post(backendUrl+'get-geeksforgeeks-details-by-rollno', {roll_no : roll_no});
      if(response.status == 200){
        console.log(response.data)
        setGfgTotal(response.data.gfg_total_problems);
        setGfgEasy(response.data.gfg_easy);
        setGfgMedium(response.data.gfg_medium);
        setGfgHard(response.data.gfg_hard);
      }
    }
    catch(error){
      console.log(error)
    }
  }
  fetchGfgData();
},[])



//fetch codechef  Data
useEffect(() => {
  const fetchCodechefData = async() => {
    try{
      const response = await axios.post(backendUrl+'get-codechef-details-by-rollno', {roll_no : roll_no});
      if(response.status == 200){
        // console.log(response.data)
        setCodechefTotal(response.data.total_problems);
        setCodechefRank(response.data.rating);
        setCodechefContests(response.data.contests);
        setCodechefStarRating(response.data.star_rating);
      }
    }
    catch(error){
      console.log(error)
    }
  }
  fetchCodechefData();
},[])




//fetch Hackerrank  Data
useEffect(() => {
  const fetchHackerRankData = async() => {
    try{
      const response = await axios.post(backendUrl+'get-hackerrank-details-by-rollno', {roll_no : roll_no});
      if(response.status == 200){
        // console.log(response.data);
        setHackerRankTotalStars(response.data.hr_total_stars);
        setHackerRankBadges(response.data.hr_badges);
        setHackerRankCertificationsCount(response.data.hr_certification_count);
      }
    }
    catch(error){
      console.log(error)
    }
  }
  fetchHackerRankData();
},[])


  return (
      <React.Fragment>
          <Row className="Programming hoot-dark-test mt-4" style={dashboardContainerStyle}>
              <Row className="mt-2">
                <h3 style={sectionTitleStyle}>Programming</h3>
              </Row>
              <Row className="mt-2">
                <Col md="3" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      {/* <Row>
                        <Col><img src="https://maya.technicalhub.io/assets/icons/coding-icons/leetcode.png" alt="C Icon" /></Col> 
                        <Col><h5>Leetcode</h5></Col>
                        <Col><h5 style={textAlign}>Problems {leetcodeTotal?leetcodeTotal:0}</h5></Col>
                      </Row> */}
                       <Row className="align-items-center">
                        <Col md={6} className="text-center" style={{display:'flex', justifyContent:'center', alignItems: 'center'}}>
                          <img src='https://maya.technicalhub.io/assets/icons/coding-icons/leetcode.png' alt="C Icon" style={{maxWidth: '100%',maxHeight:'100%',height: 'auto',width: '120px'  }}/>
                        </Col>
                        <Col md={2}><div></div></Col>
                        <Col md={4}>
                          <p className="problems-text" style={problems}>Problems</p>
                          <h6 className="problems-count" style={problemsCount}>{leetcodeTotal?leetcodeTotal:0}</h6>
                        </Col>
                      </Row>
                      <hr style={horizontalLine} />
                        <Row className="text-center">
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{leetcodeEasy?leetcodeEasy:0}</h6>
                            <p style={easy}>Easy</p>
                          </Col>
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{leetcodeMedium?leetcodeMedium:0}</h6>
                            <p style={medium}>Medium</p>
                          </Col>
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{leetcodeHard?leetcodeHard:0}</h6>
                            <p style={hard}>Hard</p>
                          </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col md="3" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      {/* <Row>
                        <Col><h5>Geekforgeeks</h5></Col>
                        <Col><h5 style={textAlign}>Problems {gfgTotal?gfgTotal:0}</h5></Col>
                      </Row> */}
                       <Row className="align-items-center">
                        <Col md={6} className="text-center"
                            style={{display: 'flex', justifyContent: 'center',alignItems: 'center' }}>
                            <img
                              src="https://media.geeksforgeeks.org/wp-content/cdn-uploads/20210420155809/gfg-new-logo.png" alt="C Icon" style={{maxWidth: '100%',height: '50px',width: '200px'  }} />
                          </Col>
                          <Col md={2}><div></div></Col>
                          <Col md={4}>
                            <p className="problems-text" style={problems}>Problems</p>
                            <h6 className="problems-count" style={problemsCount}>{gfgTotal?gfgTotal:0}</h6>
                          </Col>
                      </Row>
                      <hr style={horizontalLine} />
                        <Row className="text-center">
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{gfgEasy?gfgEasy:0}</h6>
                            <p style={easy}>Easy</p>
                          </Col>
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{gfgMedium?gfgMedium:0}</h6>
                            <p style={medium}>Medium</p>
                          </Col>
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{gfgHard?gfgHard:0}</h6>
                            <p style={hard}>Hard</p>
                          </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col md="3" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      {/* <Row>
                        <Col><h5>Codechef</h5></Col>
                        <Col><h5 style={textAlign}>Problems {codechefTotal?codechefTotal:0}</h5></Col>
                      </Row> */}
                      <Row className="align-items-center">
                        <Col md={6} className="text-center" style={{display:'flex', justifyContent:'center', alignItems: 'center'}}>
                          <img src='https://maya.technicalhub.io/assets/icons/coding-icons/codechef.png' alt="C Icon" style={{maxWidth: '100%',height: 'auto',width: '120px'  }}/>
                        </Col>
                        <Col md={2}><div></div></Col>
                        <Col md={4}>
                          <p className="problems-text" style={problems}>Problems</p>
                          <h6 className="problems-count" style={problemsCount}>{codechefTotal?codechefTotal:0}</h6>
                        </Col>
                      </Row>
                      <hr style={horizontalLine} />
                        <Row className="text-center">
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{codechefRank?codechefRank:0}</h6>
                            <p style={easy}>Rank</p>
                          </Col>
                          <Col>
                            <h6 style={{ fontSize: '1.2rem', fontWeight: '500' }}>
                              {(() => {
                                const stars = [];
                                const rating = codechefStarRating || 0; // Handle null or undefined ratings
                                if (rating === 0) {
                                  return "0"; // Display "0" when there are no stars
                                }
                            
                                for (let i = 0; i < rating; i++) {
                                  stars.push(
                                    <i
                                      key={i}
                                      className="fa fa-star"
                                      style={{ color: '#FFD700', marginRight: '2px' }}
                                    ></i>
                                  );
                                }
                                return stars;
                              })()}
                            </h6>
                            <p style={medium}>Rating</p>
                          </Col>
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{codechefContests?codechefContests:0}</h6>
                            <p style={hard}>Contests</p>
                          </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col md="3" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      {/* <Row>
                        <Col><h5>Hacker Rank</h5></Col>
                        <Col><h5 style={textAlign}>Badges {hackerRankBadges?hackerRankBadges:0}</h5></Col>
                      </Row> */}
                       <Row className="align-items-center">
                        <Col md={6} className="text-center" style={{display:'flex', justifyContent:'center', alignItems: 'center'}}>
                          <img src='https://maya.technicalhub.io/assets/icons/coding-icons/hacker_rank.png' alt="C Icon" style={{maxWidth: '100%',height: 'auto',width: '120px'}}/>
                        </Col>
                        <Col md={2}><div></div></Col>
                        <Col md={4}>
                          <p className="problems-text" style={problems}>Problems</p>
                          <h6 className="problems-count" style={problemsCount}> {hackerRankBadges?hackerRankBadges:0}</h6>
                        </Col>
                      </Row>
                      <hr style={horizontalLine} />
                        <Row className="text-center">
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{hackerRankTotalStars?hackerRankTotalStars:0}</h6>
                            <p style={medium}>Total Stars</p>
                          </Col>
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{hackerRankCertificationsCount?hackerRankCertificationsCount:0}</h6>
                            <p style={hard}>Certifications</p>
                          </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Row className="mt-2">
                <Col md="3" sm="6" >
                    <Card style={cardStyle}>
                    <CardBody>
                        {/* <h3 style={sectionTitleStyle}>Maya</h3> */}
                      <Row className="align-items-center">
                        <Col md={4} className="text-center" style={{display:'flex', justifyContent:'center', alignItems: 'center'}}>
                          <img src='https://upload.wikimedia.org/wikipedia/commons/1/18/C_Programming_Language.svg' alt="C Icon" style={{width: '42px',height: 'auto'}}/>
                          {/* <h6 className="language-title" style={{fontSize: '1.25rem',fontWeight: '500', marginBottom: '0.2rem'}}>C</h6> */}
                        </Col>
                        <Col md={4}></Col>
                        <Col md={4}>
                          <p className="problems-text" style={problems}>Problems</p>
                          <h6 className="problems-count" style={problemsCount}>{cData?cData.total:0}</h6>
                        </Col>
                      </Row>
                      <hr style={horizontalLine} />
                        <Row className="text-center">
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{cData?cData.easy:0}</h6>
                            <p style={easy}>Easy</p>
                          </Col>
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{cData?cData.medium:0}</h6>
                            <p style={medium}>Medium</p>
                          </Col>
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{cData?cData.hard:0}</h6>
                            <p style={hard}>Hard</p>
                          </Col>
                      </Row>
                      </CardBody>
                    </Card>
                </Col>
                <Col md="3" sm="6">
                    <Card style={cardStyle}>
                    <CardBody>
                      <Row className="align-items-center">
                        <Col md={4} className="text-center" style={{display:'flex',justifyContent:'center', alignItems: 'center'}}>
                          <img src={cpp} alt="Cpp Icon" style={{width: '45px',height: 'auto'}}/>
                          {/* <h6 className="language-title" style={{fontSize: '1.25rem',fontWeight: '500', marginBottom: '0.2rem'}}>C++</h6> */}
                        </Col>
                        <Col md={4}></Col>
                        <Col md={4} className="text-left">
                          <p className="problems-text" style={problems}>Problems</p>
                          <h6 className="problems-count" style={problemsCount}>{cppData?cppData.total:0}</h6>
                        </Col>
                      </Row>
                      <hr style={horizontalLine} />
                        <Row className="text-center">
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{cppData?cppData.easy:0}</h6>
                            <p style={easy}>Easy</p>
                          </Col>
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{cppData?cppData.medium:0}</h6>
                            <p style={medium}>Medium</p>
                          </Col>
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{cppData?cppData.hard:0}</h6>
                            <p style={hard}>Hard</p>
                          </Col>
                      </Row>
                      </CardBody>
                    </Card>
                </Col>
                <Col md="3" sm="6">
                    <Card style={cardStyle}>
                    <CardBody>
                      <Row className="align-items-center justify-">
                        <Col md={4} className="text-center" style={{display:'flex', justifyContent:'space-evenly', alignItems: 'center'}}>
                          <img src={python} alt="Python Icon" style={{width: '40px',height: 'auto'}}/>
                          {/* <h6 className="language-title" style={{fontSize: '1.25rem',fontWeight: '500', marginBottom: '0.2rem'}}>Python</h6> */}
                        </Col>
                        <Col md={4}></Col>
                        <Col md={4} className="text-left">
                          <p className="problems-text" style={problems}>Problems</p>
                          <h6 className="problems-count" style={problemsCount}>{pythonData?pythonData.total:0}</h6>
                        </Col>
                      </Row>
                      <hr style={horizontalLine} />
                        <Row className="text-center">
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{pythonData?pythonData.easy:0}</h6>
                            <p style={easy}>Easy</p>
                          </Col>
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{pythonData?pythonData.medium:0}</h6>
                            <p style={medium}>Medium</p>
                          </Col>
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{pythonData?pythonData.hard:0}</h6>
                            <p style={hard}>Hard</p>
                          </Col>
                      </Row>
                      </CardBody>
                    </Card>
                </Col>
                <Col md="3" sm="6">
                    <Card style={cardStyle}>
                    <CardBody>
                      <Row className="align-items-center justify-">
                        <Col md={4} className="text-center" style={{display:'flex', justifyContent:'space-evenly', alignItems: 'center'}}>
                          <img src={java} alt="Java Icon" style={{width: '45px',height: 'auto'}}/>
                          {/* <h6 className="language-title" style={{fontSize: '1.25rem',fontWeight: '500', marginBottom: '0.2rem'}}>Java</h6> */}
                        </Col>
                        <Col md={4}></Col>
                        <Col md={4} className="text-left">
                          <p className="problems-text" style={problems}>Problems</p>
                          <h6 className="problems-count" style={problemsCount}>{javaData?javaData.total:0}</h6>
                        </Col>
                      </Row>
                      <hr style={horizontalLine} />
                        <Row className="text-center">
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{javaData?javaData.easy:0}</h6>
                            <p style={easy}>Easy</p>
                          </Col>
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{javaData?javaData.medium:0}</h6>
                            <p style={medium}>Medium</p>
                          </Col>
                          <Col>
                            <h6 style={{fontSize: '1.2rem',fontWeight: '500'}}>{javaData?javaData.hard:0}</h6>
                            <p style={hard}>Hard</p>
                          </Col>
                      </Row>
                      </CardBody>
                    </Card>
                </Col>
              </Row>
          </Row>
      </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(StudentExplore);


