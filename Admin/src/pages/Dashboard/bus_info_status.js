import React, { Component } from 'react';
import { Row, Col, Card, CardBody, Table } from "reactstrap";
import ReactApexChart from 'react-apexcharts';
import Active from "./images/active.png";
import INActive from "./images/inactive.png";

class YearlySales extends Component {
    constructor(props) {
        super(props);

        this.state = {
            options: {
                chart: {
                    toolbar: {
                        show: false,
                    },
                },
                colors: ['#7A6FBE', '#28BBE3'],
                plotOptions: {
                    bar: {
                        columnWidth: '70%',
                        dataLabels: {
                            show: false
                        },
                    },
                },
                legend: {
                    show: false
                },
                dataLabels: {
                    enabled: false,
                },
                grid: {
                    show: false,
                    row: {
                        colors: ['transparent', 'transparent'],
                        opacity: 0.5
                    },
                },
                xaxis: {
                    labels: {
                        show: false
                    },
                    categories: [],
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    }
                },
                yaxis: {
                    labels: {
                        show: false
                    },
                },
            },
            series: [{
                name: 'College',
                data: [8, 6, 4, 7, 10, 12, 7, 4, 9, 12, 13, 11, 12]
            }],
            activeCount: 0,
            inactiveCount: 0,
            weeklyActive: 0,
            weeklyInactive: 0,
            monthlyActive: 0,
            monthlyInactive: 0,
            top5Users: [], // State to hold last week's top-5 scanned users
            lastMonthTop5Users: [], // State for last month's top-5 scanned users
            overallTop5Users: [] // New state for overall top-5 scanned users
        };
    }

    componentDidMount() {
        this.fetchCounts();
        this.fetchWeeklyReport();
        this.fetchMonthlyReport();
        this.fetchTop5LastWeek(); // Fetch top-5 scanned users for last week
        this.fetchLastMonthTop5Users(); // Fetch top-5 scanned users for last month
        this.fetchTopScanners(); // Fetch overall top-5 scanned users
    }

    fetchCounts = async () => {
        try {
            const backedUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(backedUrl + 'today_scan_count');
            const data = await response.json();
            this.setState({
                activeCount: data.active || 0,
                inactiveCount: data.inactive || 0,
            });
        } catch (error) {
            console.error("Error fetching counts:", error);
        }
    };

    fetchWeeklyReport = async () => {
        try {
            const backedUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(backedUrl + 'weekly-scan-report');
            const data = await response.json();
            this.setState({
                weeklyActive: data?.active || 0,
                weeklyInactive: data?.inactive || 0,
            });
        } catch (error) {
            console.error("Error fetching weekly report:", error);
        }
    };

    fetchMonthlyReport = async () => {
        try {
            const backedUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(backedUrl + 'monthly-scan-report');
            const data = await response.json();
            this.setState({
                monthlyActive: data?.active || 0,
                monthlyInactive: data?.inactive || 0,
            });
        } catch (error) {
            console.error("Error fetching monthly report:", error);
        }
    };

    fetchTop5LastWeek = async () => {
        try {
            const backedUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(backedUrl + 'lastweek-active-data');
            const data = await response.json();
            console.log("Top 5 Users Data (Last Week):", data); // Log the response to check structure

            this.setState({
                top5Users: data.results || data || [], // Adjust the structure based on the actual API response
            });
        } catch (error) {
            console.error("Error fetching top 5 users:", error);
        }
    };

    fetchLastMonthTop5Users = async () => {
        try {
            const backedUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(backedUrl + 'lastmonth-active-data'); // API for last month's top 5 scanned users
            const data = await response.json();
            console.log("Top 5 Users Data (Last Month):", data); // Log the response to check structure

            this.setState({
                lastMonthTop5Users: data.results || data || [], // Adjust the structure based on the actual API response
            });
        } catch (error) {
            console.error("Error fetching last month top 5 users:", error);
        }
    };

    fetchTopScanners = async () => {
        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(backendUrl + 'over-top-scanners');
            const data = await response.json();
            console.log("Top 5 Scanners Data:", data); // Log to check structure

            this.setState({ overallTop5Users: data || [] });
        } catch (error) {
            console.error("Error fetching top scanners:", error);
        }
    };

    render() {
        const { activeCount, inactiveCount, weeklyActive, weeklyInactive, monthlyActive, monthlyInactive, top5Users, lastMonthTop5Users, overallTop5Users } = this.state;

        return (
            <>
                <Row className="mt-3">
                    <Col xl={4} md={4}>
                        <Card>
                            <CardBody>
                                <h3 style={{ color: "SlateBlue", fontSize: "20px" }} className="card-title mb-4">Bus Users</h3>
                                <Row>
                                    <Col md="4">
                                        <div>
                                            <h3 style={{ fontSize: "20px", fontWeight: "600" }}>12,843</h3>
                                        </div>
                                    </Col>
                                    <Col md="8" className="text-end">
                                        <div id="sparkline">
                                            <ReactApexChart
                                                options={this.state.options}
                                                series={this.state.series}
                                                type="bar"
                                                height="130"
                                                className="apex-charts"
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col xl={4} md={4}>
                        <Card>
                            <CardBody>
                                <h4 className="card-title mb-4">
                                    <b style={{ color: 'green', fontSize: "20px" }}> Today Active</b>
                                </h4>
                                <Row>
                                    <Col md="6">
                                        <div>
                                            <h1>{activeCount}</h1>
                                        </div>
                                    </Col>
                                    <Col md="6">
                                        <div>
                                            <img src={Active} alt="Active" style={{ width: '128px', height: '128px' }} />
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col xl={4} md={4}>
                        <Card>
                            <CardBody>
                                <h4 className="card-title mb-4">
                                    <b style={{ color: 'red', fontSize: "20px" }}> Today Inactive</b>
                                </h4>
                                <Row>
                                    <Col md="6">
                                        <div>
                                            <h1>{inactiveCount}</h1>
                                        </div>
                                    </Col>
                                    <Col md="6">
                                        <div>
                                            <img src={INActive} alt="Inactive" style={{ width: '128px', height: '128px' }} />
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col xl={6} md={6}>
                        <Card>
                            <CardBody>
                                <h3 style={{ color: "SlateBlue", fontSize: "20px" }} className="card-title mb-4">Weekly Count</h3>
                                <Row>
                                    <Col md="8">
                                        <h5 style={{ color: 'green', fontSize: "20px" }}>Active : <b style={{ color: "black" }}>{weeklyActive}</b></h5>
                                    </Col>
                                    <Col md="4">
                                        <h5 style={{ color: 'red', fontSize: "20px" }}>Inactive : <b style={{ color: "black" }}>{weeklyInactive}</b></h5>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl={6} md={6}>
                        <Card>
                            <CardBody>
                                <h3 style={{ color: "SlateBlue", fontSize: "20px" }} className="card-title mb-4">Monthly Count</h3>
                                <Row>
                                    <Col md="8">
                                        <h5 style={{ color: 'green', fontSize: "20px" }}>Active : <b style={{ color: "black" }}>{monthlyActive}</b></h5>
                                    </Col>
                                    <Col md="4">
                                        <h5 style={{ color: 'red', fontSize: "20px" }}>Inactive : <b style={{ color: "black" }}> {monthlyInactive}</b></h5>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Table for Top-5 Scanned Users Last Week */}
                <Row className="mt-3">
                    {/* Table for Overall Top-5 Scanned Users */}
                    <Col xl={4} md={4}>

                        <Card>
                            <CardBody>
                                <h3 style={{ color: "SlateBlue", fontSize: "20px" }} className="card-title ">Top-5 Scanned Overall</h3>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr style={{ fontSize: "20px" }}>
                                            <th>S.No</th>
                                            <th>Name</th>
                                            <th>Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {overallTop5Users.length > 0 ? overallTop5Users.map((user, index) => (
                                            <tr key={index}>
                                                <td style={{ fontSize: "18px", fontWeight: "bold" }}>{index + 1}</td>
                                                <td style={{ fontSize: "18px", color: "SlateBlue" }}>{user.added_by}</td>
                                                <td style={{ color: "green", fontWeight: "bold", fontSize: "18px" }}>{user.count}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3">data Loading...</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>

                            </CardBody>
                        </Card>
                    </Col>
                    {/* Table for Top-5 Scanned Users Last Month */}
                    <Col xl={4} md={4}>
                        <Card>
                            <CardBody>
                                <h3 style={{ color: "SlateBlue", fontSize: "20px" }} className="card-title">Top-5 Scan Users Last Month</h3>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr style={{ fontSize: "20px" }}>
                                            <th>S.No</th>
                                            <th>Name</th>
                                            <th>Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lastMonthTop5Users.length > 0 ? lastMonthTop5Users.map((user, index) => (
                                            <tr key={index}>
                                                <td style={{ fontSize: "18px", fontWeight: "bold" }}>{index + 1}</td>
                                                <td style={{ fontSize: "18px", color: "SlateBlue" }}>{user._id.added_by}</td>
                                                <td style={{ color: "green", fontWeight: "bold", fontSize: "18px" }}>{user.count}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3">No data available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl={4} md={4}>
                        <Card>
                            <CardBody>
                                <h3 style={{ color: "SlateBlue", fontSize: "20px" }} className="card-title ">Top-5 Scan Users Last Week</h3>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr style={{ fontSize: "20px" }}>
                                            <th>S.No</th>
                                            <th>Name</th>
                                            <th>Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {top5Users.length > 0 ? top5Users.map((user, index) => (
                                            <tr key={index}>
                                                <td style={{ fontSize: "18px", fontWeight: "bold" }}>{index + 1}</td>
                                                <td style={{ fontSize: "18px", color: "SlateBlue" }}>{user._id}</td>
                                                <td style={{ color: "green", fontWeight: "bold", fontSize: "18px" }}>{user.count}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3">No data available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>

                </Row>
            </>
        );
    }
}

export default YearlySales;