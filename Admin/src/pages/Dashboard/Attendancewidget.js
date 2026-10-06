import React, { useEffect, useState } from "react"
import axios from "axios"

import { Card, CardBody, Row, Col, CardTitle } from "reactstrap"
import DonutChart from '../AllCharts/DonutChart';
import MonthlyEarnings2 from "./montly-earnings2";
import AttendanceStats from "../AllCharts/dashboardCharts/attendance-stats/attendanceStats";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Attendancewidget = props => {
  const [user, setUser] = useState();
  const [batchAttendancesCount, setBatchAttendancesCount] = useState();
  const [totalAttendanceCount, setTotalAttendanceCount] = useState();
  const [totalLightmodeCount, setTotalLightmodeCount] = useState();
  const [totalBrightmodeCount, setTotalBrightmodeCount] = useState();
  const [totalShinemodeCount, setTotalShinemodeCount] = useState();
  const [totalDarkmodeCount, setTotalDarkmodeCount] = useState();
  const [mappedTechnologies, setMappedTechnologies] = useState();
  const [courseWiseCount, setCourseWiseCount] = useState();

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    setUser(authUser)
  }, [])

  useEffect(() => {
    try {
      axios.get(backendUrl + "get-today-batchwise-attendance").then((response) => {
        setBatchAttendancesCount(response.data)
        //add all batches attendances
        let sum = response.data.reduce((accumulator, ele) => {
          return accumulator + ele.count;
        }, 0);
        setTotalAttendanceCount(sum)

        //filtering all lightmode attendance
        let lightmode = response.data.filter(ele => ele.mode === "lightmode")
        //add all lightmode attendances
        let lightmodesum = lightmode.reduce((accumulator, ele) => {
          return accumulator + ele.count
        }, 0)
        setTotalLightmodeCount(lightmodesum)

        //filtering all brightmode attendance
        let brightmode = response.data.filter(ele => ele.mode === "brightmode")
        //add all brightmode attendances
        let brightmodesum = brightmode.reduce((accumulator, ele) => {
          return accumulator + ele.count
        }, 0)
        setTotalBrightmodeCount(brightmodesum)

        //filtering all shinemode attendance
        let shinemode = response.data.filter(ele => ele.mode === "shinemode")
        //add all shinemode attendances
        let shinemodesum = shinemode.reduce((accumulator, ele) => {
          return accumulator + ele.count
        }, 0)
        setTotalShinemodeCount(shinemodesum)

        //filtering all brightmode attendance
        let darkmode = response.data.filter(ele => ele.mode === "darkmode")
        //add all darkmode attendances
        let darkmodesum = darkmode.reduce((accumulator, ele) => {
          return accumulator + ele.count
        }, 0)
        setTotalDarkmodeCount(darkmodesum)
      })
    } catch (err) {
      console.log(err)
    }

  }, [])

  useEffect(() => {
    if (typeof (user) != 'undefined' && typeof (batchAttendancesCount) != 'undefined') {
      let mappedTechnology = batchAttendancesCount.filter((ele) => {
        return user && user.technology.includes(ele.technology_id)
      })

      //getting mapped technolgy values
      const aggregatedTechnologyData = mappedTechnology.reduce((acc, curr) => {
        const { technology, mode, count, course } = curr;

        if (!acc[technology]) {
          acc[technology] = { technology };
        }
        if (!acc[technology]["course_name"]) {
          acc[technology]["course_name"] = { course };
        }

        acc[technology][mode] = (acc[technology][mode] || 0) + count;
        return acc;
      }, {});
      const result = Object.values(aggregatedTechnologyData);
      setMappedTechnologies(Object.values(result))

      //getting mapped technolgy values
      const aggregatedCourseData = batchAttendancesCount.reduce((acc, curr) => {
        const { mode, count, course } = curr;

        if (!acc[course]) {
          acc[course] = { course };
        }

        acc[course][mode] = (acc[course][mode] || 0) + count;
        return acc;
      }, {});
      const course_result = Object.values(aggregatedCourseData);
      setCourseWiseCount(Object.values(course_result))


    }
  }, [batchAttendancesCount, user])

  return (
    <React.Fragment>
      <Row className="text-center mt-4">

        <Col xl="10">
          <AttendanceStats />
        </Col>
        <Col xl="3">
          <MonthlyEarnings2 />
        </Col>
      </Row>
      {/* <Row>
        <Col xl={3} sm={6}>
          <Card className="mini-stat bg-primary">
            <CardBody className="card-body mini-stat-img">
              <div className="mini-stat-icon">
                <i className={"float-end ion ion-ios-people"}></i>
              </div>
              <div className="text-white">
                <h6 className="text-uppercase mb-3 font-size-16 text-white">{"Total Attendance"}</h6>
                <h2 className="mb-4 text-white">{totalAttendanceCount}</h2>
                <span style={{ background: "#FFD700", color: "black", padding: "5px", fontSize: "10pt", marginLeft: "5px" }} className="badge">{totalLightmodeCount}</span>
                <span style={{ background: "#FFA500", color: "black", padding: "5px", fontSize: "10pt", marginLeft: "5px" }} className={totalBrightmodeCount == 0 ? "d-none badge" : "badge"}>{totalBrightmodeCount}</span>
                <span style={{ background: "#800080", padding: "5px", fontSize: "10pt", marginLeft: "5px" }} className={totalShinemodeCount == 0 ? "d-none badge" : "d-block badge"}>{totalShinemodeCount}</span>
                <span style={{ background: "#000080", padding: "5px", fontSize: "10pt", marginLeft: "5px" }} className={totalDarkmodeCount == 0 ? "d-none badge" : "d-block badge"}>{totalDarkmodeCount}</span>
                <span className="ms-2 badge bg-danger" style={{ float: "right", fontSize: "10pt" }}>Live</span>
              </div>
            </CardBody>
          </Card>
        </Col>
        {mappedTechnologies && mappedTechnologies.map((ele) => {
          const lightmodeCount = typeof (ele.lightmode) != 'undefined' ? ele.lightmode : 0
          const brightmodeCount = typeof (ele.brightmode) != 'undefined' ? ele.brightmode : 0
          return (<Col xl={3} sm={6}>
            <Card className="mini-stat bg-primary">
              <CardBody className="card-body mini-stat-img">
                <div className="mini-stat-icon">
                  <i className={"float-end ion ion-ios-people"}></i>
                </div>
                {console.log(ele.brightmode)}
                <div className="text-white">
                  <h6 className="text-uppercase mb-3 font-size-16 text-white">{ele.technology}<span className="badge bg-warning" style={{ fontSize: "9pt !important", marginLeft: "5px" }}>{ele.course_name.course}</span></h6>
                  <h2 className="mb-4 text-white">{lightmodeCount + brightmodeCount}</h2>
                  <span style={{ background: "#FFD700", color: "black", padding: "5px", fontSize: "10pt", marginLeft: "5px" }} className="badge">{lightmodeCount}</span>
                  <span style={{ background: "#FFA500", color: "black", padding: "5px", fontSize: "10pt", marginLeft: "5px" }} className="badge">{ele.brightmode}</span>
                  <span className="ms-2 badge bg-danger" style={{ float: "right", fontSize: "10pt" }}>Live</span>
                </div>
              </CardBody>
            </Card>
          </Col>)
        })}

      </Row> */}

    </React.Fragment>
  )

}

export default Attendancewidget
