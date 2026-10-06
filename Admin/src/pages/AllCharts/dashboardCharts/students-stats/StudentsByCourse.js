import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle
} from "reactstrap"
import axios from 'axios';

const CourseStats = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // const [courses, setCourses] = useState();
  const [coursesCount, setCoursesCount] = useState([]);
  const [traineesCount, setTraineesCount] = useState(0);
  const chartRef = useRef(null);
  

  useEffect(() => {
    axios.get(backendUrl + "get-courses").then((response) => {
      if (response.status === 200) {
        // setCourses(response.data);
        response.data.forEach((ele) => {
          let trainees_count;
          //Get only trainess count by course wise with out details, Note: isDetails is false so that will only get the counts
          axios.post(backendUrl + "get-trainees-by-course", { course: ele._id, isDetails: false }).then((res) => {
            if (res.data.length > 0) {
              setCoursesCount(prevCoursesCount => [
                ...prevCoursesCount,
                { course: ele.course_name, count: res.data[0] }
              ]);
              // trainees_count = res.data[0].count.count
              // setTraineesCount(trainees_count)
            }
          });
        });
      }
    });
  }, [backendUrl]);

  useEffect(() => {
    if (coursesCount.length > 0) {
      const chartDom = chartRef.current;
      const myChart = echarts.init(chartDom);
      const option = {
        color: [
          '#5470C6', '#91CC75', '#FAC858', '#EE6666'],
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: '0%',
          left: 'center'
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: coursesCount.map((ele) => {
              return { value: ele.count.count, name: ele.course };
            })
          }
        ]
      };

      option && myChart.setOption(option);
      let totalcount = 0
      coursesCount.forEach(item => {
        totalcount += item.count.count;
        setTraineesCount(totalcount)
    });
      // Cleanup on unmount
      return () => {
        
        myChart.dispose();
      };
    }
  }, [coursesCount]);

  return (
    <Row className="text-center mt-4">
      <Col>
        <Card>
          <CardBody>
            <CardTitle className="h4 mb-4">Trainees Stats</CardTitle>
            <Row className="text-center mt-4">
              <div className="col-2">
                <h5 className="font-size-20">{traineesCount!=undefined?traineesCount:""}</h5>
                <p className="text-muted">Total Trainees</p>
              </div>
              <div className="col-2">
                <h5 className="font-size-20">{coursesCount!=undefined?coursesCount.length:""}</h5>
                <p className="text-muted">Current Programs</p>
              </div>
              <div className="col-2">
                <h5 className="font-size-20">{traineesCount!=undefined?traineesCount:""}</h5>
                <p className="text-muted">Male</p>
              </div>
              <div className="col-2">
                <h5 className="font-size-20">{coursesCount!=undefined?coursesCount.length:""}</h5>
                <p className="text-muted">Female</p>
              </div>
              <div className="col-2">
                <h5 className="font-size-20">{traineesCount!=undefined?traineesCount:""}</h5>
                <p className="text-muted">AU</p>
              </div>
              <div className="col-2">
                <h5 className="font-size-20">{coursesCount!=undefined?coursesCount.length:""}</h5>
                <p className="text-muted">ACET</p>
              </div>

            </Row>
            <div dir="ltr">
              <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
            </div>

          </CardBody>
        </Card>
      </Col>
      {/* <Col xl="6">
          <EmailSent />
        </Col>

        <Col xl="3">
          <MonthlyEarnings2 />
        </Col> */}
    </Row>
  );
};

export default CourseStats;
