import React, { useState, useEffect } from 'react';
import { Row, Col, Card, CardBody } from "reactstrap";
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const MonthlyEarnings = () => {
    const [totalAttendanceCount, setTotalAttendanceCount] = useState(0);
    const [batchAttendancesCount, setBatchAttendancesCount] = useState([]);
    const [totalLightmodeCount, setTotalLightmodeCount] = useState(0);
    const [totalBrightmodeCount, setTotalBrightmodeCount] = useState(0);
    const [totalDarkmodeCount, setTotalDarkmodeCount] = useState(0);
    const [lightmode, setLightmode] = useState([]);
    const [brightmode, setBrightmode] = useState([]);
    const [darkmode, setDarkmode] = useState([]);

    useEffect(() => {
        axios.get(backendUrl + "get-today-batchwise-attendance").then((response) => {
            setBatchAttendancesCount(response.data);

            // Total Attendance count
            let sum = response.data.reduce((accumulator, ele) => accumulator + ele.count, 0);
            setTotalAttendanceCount(sum);

            // Lightmode Attendance count
            let lightmodeSum = response.data.filter(ele => ele.mode === "lightmode")
                .reduce((accumulator, ele) => accumulator + ele.count, 0);
            setTotalLightmodeCount(lightmodeSum);

            // Brightmode Attendance count
            let brightmodeSum = response.data.filter(ele => ele.mode === "brightmode")
                .reduce((accumulator, ele) => accumulator + ele.count, 0);
            setTotalBrightmodeCount(brightmodeSum);

            // Darkmode Attendance count
            let darkmodeSum = response.data.filter(ele => ele.mode === "darkmode")
                .reduce((accumulator, ele) => accumulator + ele.count, 0);
            setTotalDarkmodeCount(darkmodeSum);

            // Lightmode data for chart
            let lightmodeData = response.data.filter(item => item.mode === "lightmode")
                .map(item => ({ technology: item.technology, count: item.count }));
            setLightmode(lightmodeData);

            // Brightmode data for chart
            let brightmodeData = response.data.filter(item => item.mode === "brightmode")
                .map(item => ({ technology: item.technology, count: item.count }));
            setBrightmode(brightmodeData);

            // Brightmode data for chart
            let darkmodeData = response.data.filter(item => item.mode === "darkmode")
                .map(item => ({ technology: item.technology, count: item.count }));
            setDarkmode(darkmodeData);
        });
    }, []);

    const options = {
        colors: ['#ccc', '#7a6fbe', 'rgb(40, 187, 227)'],
        chart: {
            toolbar: {
                show: false,
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 0.1,
        },
        grid: {
            borderColor: '#f8f8fa',
            row: {
                colors: ['transparent', 'transparent'],
                opacity: 0.5
            },
        },
        xaxis: {
            categories: lightmode.map(ele => ele.technology),
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        legend: {
            show: false
        },
    };

    const series = [
        {
            name: 'Lightmode',
            data: lightmode.map(ele => ele.count),
        },
        {
            name: 'Brightmode',
            data: brightmode.map(ele => ele.count),
        },
        {
            name: 'Darkmode',
            data: darkmode.map(ele => ele.count) // Example data for Darkmode
        }
    ];

    return (
        <React.Fragment>
            <Card>
                <CardBody>
                    <h4 className="card-title mb-4">Attendance Stats</h4>

                    <Row className="text-center mt-4">
                        <Col xs="3">
                            <h5 className="font-size-20">{totalAttendanceCount}</h5>
                            <p className="text-muted">Total Attendance</p>
                        </Col>
                        <Col xs="3">
                            <h5 className="font-size-20">{totalLightmodeCount}</h5>
                            <p className="text-muted">Lightmode Attendance</p>
                        </Col>
                        <Col xs="3">
                            <h5 className="font-size-20">{totalBrightmodeCount}</h5>
                            <p className="text-muted">Brightmode Attendance</p>
                        </Col>
                        <Col xs="3">
                            <h5 className="font-size-20">{totalDarkmodeCount}</h5>
                            <p className="text-muted">Darkmode Attendance</p>
                        </Col>
                    </Row>

                    <div id="morris-area-example" className="morris-charts morris-charts-height" dir="ltr">
                        <ReactApexChart options={options} series={series} type="area" height="300" />
                    </div>
                </CardBody>
            </Card>
        </React.Fragment>
    );
}

export default MonthlyEarnings;
