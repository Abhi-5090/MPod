import React, { useEffect, useState } from "react"
import axios from "axios"
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table"
import { Card, CardBody, Row, Col, CardTitle } from "reactstrap"

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Sessionwidget = props => {
  const [user, setUser] = useState();
  const [sessionsList, setSessionsList] = useState([]);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    setUser(authUser)
  }, [])

  useEffect(() => {
    try {
      axios.get(backendUrl + "get-today-created-sessions").then((response) => {
        console.log(response.data)
        setSessionsList(response.data)
      })
    } catch (err) {
      console.log(err)
    }
  }, [])



  return (
    <React.Fragment>
      <Row className="text-center mt-4">
        <Col xl="12">
          <div className="table-rep-plugin">
            <div
              className="table-responsive mb-0"
              data-pattern="priority-columns"
            >

              <table id="tech-companies-1" className="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th data-priority="1">Batch</th>
                    <th data-priority="3">Technology</th>
                    <th data-priority="1">Date</th>
                    <th data-priority="3">Mode</th>
                    <th data-priority="3">Status</th>
                    
                  </tr>
                </thead>
                {sessionsList.length > 0 ? sessionsList.map((ele, index) => (
                  <tbody key={index}>
                    {
                      !ele.sessionDate?(<></>):(<tr>
                        <td>{ele.course_name}</td>
                        <td>{ele.batch_name}</td>
                        <td>{ele.technology}</td>
                        <td>{ele.isCreated?ele.sessionDate:"Created On "+ele.sessionDate}</td>
                        <td>{ele.sessionMode}</td>
                        <td style={{color:ele.isCreated?"green":"red"}}>{ele.isCreated?"Created":"Not Created"}</td>
                      </tr>)

                      
                    }
                  </tbody>
                )) : (<></>)}
              </table>

            </div>
          </div>
        </Col>
      </Row>

    </React.Fragment>
  )

}

export default Sessionwidget
