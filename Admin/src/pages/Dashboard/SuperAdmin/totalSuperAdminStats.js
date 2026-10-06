import React, { useCallback, useEffect, useState } from "react";
import {
    Row,
    Col,
    Card,
    Spinner,
    Table,
    Alert,
    Button
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import { apiUrl, getErrorMessage } from "../../../config/api";

const asArray = value => (Array.isArray(value) ? value : []);

const ApexChart = ({ stats }) => {
    const { categories, techData, codingData, companyData } =
        prepareChartData(asArray(stats.technology), asArray(stats.coding), asArray(stats.company));
    function prepareChartData(tech, coding, company) {
        const allDates = new Set();

        tech.forEach(x => allDates.add(x._id));
        coding.forEach(x => allDates.add(x._id));
        company.forEach(x => allDates.add(x._id));

        const sortedDates = [...allDates].sort();

        const categories = sortedDates; // X-axis labels

        const techData = sortedDates.map(date => tech.find(x => x._id === date)?.attempted_count || 0);
        const codingData = sortedDates.map(date => coding.find(x => x._id === date)?.attempted_count || 0);
        const companyData = sortedDates.map(date => company.find(x => x._id === date)?.attempted_count || 0);

        return { categories, techData, codingData, companyData };
    }

    const options = {
        chart: {
            height: 350,
            type: 'line',
            zoom: { enabled: false }
        },
        stroke: {
            width: [4, 4, 4],
            curve: 'straight'
        },
        colors: ["#7a6fbe", "#1cc88a", "#e74a3b"],
           dataLabels: {
        enabled: true,
        background: {
            enabled: true,
            foreColor: '#fff',
            padding: 4,
            borderRadius: 4,
        },
        style: {
            fontSize: '12px',
            fontWeight: 'bold'
        },
        offsetY: -8 // lift labels up a bit
    },
        title: {
            text: 'Daily Interview Attempts',
            align: 'left'
        },
        xaxis: { categories },
        legend: { position: "top" }
    };

    const series = [
        { name: "Technology", data: techData },
        { name: "Coding", data: codingData },
        { name: "Company", data: companyData },
    ];

    return (
        <div id="chart">
            <ReactApexChart options={options} series={series} type="line" height={350} />
        </div>
    );
};
const styles = {
    dashboardContainer: {
        padding: "10px",
        width: "100%",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)"
    },
};

const TotalSuperAdminStats = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [yesterdayAssignedStats, setYesterdayAssignedStats] = useState();
    const [yesterdayAttemptedStats, setYesterdayAttemptedStats] = useState();
    const [overallStats, setOverallStats] = useState();
    const [currentStats, setCurrentStats] = useState();
    const [daywiseStats, setDaywiseStats] = useState();

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const results = await Promise.allSettled([
                axios.get(apiUrl("get-overall-stats")),
                axios.get(apiUrl("get-all-tenants-yesterday-assigned-stats")),
                axios.get(apiUrl("get-overall-yesterday-attempted-interview-stats")),
                axios.get(apiUrl("get-current-stats")),
                axios.get(apiUrl("get-day-wise-stats")),
            ]);
            const [overallRes, yesterdayAssignedRes, yesterdayAttemptedRes, currentRes, dayWiseRes] = results;

            if (dayWiseRes.status === "fulfilled") setDaywiseStats(dayWiseRes.value.data);
            if (currentRes.status === "fulfilled") setCurrentStats(asArray(currentRes.value.data));
            if (overallRes.status === "fulfilled" && overallRes.value.data?.overall) {
                const data = overallRes.value.data;
                const o = data.overall;
                const sum = key =>
                    (o.overallTechStats?.[key] || 0) +
                    (o.overallCodingStats?.[key] || 0) +
                    (o.overallCompanyStats?.[key] || 0);

                setOverallStats({
                    ...data,
                    overall: {
                        ...o,
                        overall: { assigned: sum("assigned"), attempted: sum("attempted") },
                    },
                });
            }
            if (yesterdayAssignedRes.status === "fulfilled") setYesterdayAssignedStats(yesterdayAssignedRes.value.data);
            if (yesterdayAttemptedRes.status === "fulfilled") setYesterdayAttemptedStats(yesterdayAttemptedRes.value.data);

            const failed = results.find(r => r.status === "rejected");
            if (failed) setError(getErrorMessage(failed.reason, "Some statistics failed to load."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const renderCount = (value) =>
        value !== undefined && value !== null ? (
            <h6 style={{ fontSize: "1.2rem", fontWeight: "500" }}>{value}</h6>
        ) : (
            <span className="text-muted">-</span>
        );

    return (
        <React.Fragment>
            {error && (
                <Alert color="danger" className="d-flex justify-content-between align-items-center mt-4">
                    <span>{error}</span>
                    <Button size="sm" color="danger" outline onClick={fetchStats} disabled={loading}>
                        Retry
                    </Button>
                </Alert>
            )}
            <Row className="Programming hoot-dark-test mt-4" style={styles.dashboardContainer}>
                <Row>
                    {/* Overall Cards */}
                    {overallStats && (
                        <>
                            {[
                                { title: "Overall", data: overallStats.overall.overall, color: "#dfa04eff" },
                                { title: "Technology", data: overallStats.overall.overallTechStats, color: "#4e73df" },
                                { title: "Coding", data: overallStats.overall.overallCodingStats, color: "#1cc88a" },
                                { title: "Company", data: overallStats.overall.overallCompanyStats, color: "#e74a3b" },
                            ].map((item, idx) => (
                                <Col md="2" className="mb-3" key={idx}>
                                    <Card className="shadow-sm border-0 rounded-4 p-4 text-center">
                                        <h5 className="fw-bold mb-3" style={{ color: item.color }}>{item.title}</h5>

                                        <div className="d-flex justify-content-between px-3 mb-2">
                                            <span className="text-muted">Assigned</span>
                                            <span className="fw-bold">{item.data?.assigned}</span>
                                        </div>

                                        <div className="d-flex justify-content-between px-3">
                                            <span className="text-muted">Attempted</span>
                                            <span className="fw-bold text-primary">{item.data?.attempted}</span>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </>
                    )}
                </Row>

                <hr className="my-4" />

                <Row className="mt-2">
                    <Col md="6">
                        <h4 className="fw-bold mb-3">Tenant-wise overall statistics</h4>

                        {overallStats?.tenantwise && (
                            <Col md="12">
                                <Table bordered hover responsive className="shadow-sm rounded-4">
                                    <thead className="text-center">
                                        <tr>
                                            <th>Tenant</th>
                                            <th colSpan="2">Technology</th>
                                            <th colSpan="2">Coding</th>
                                            <th colSpan="2">Company</th>
                                        </tr>
                                        <tr>
                                            <th></th>
                                            <th>Assigned</th>
                                            <th>Attempted</th>
                                            <th>Assigned</th>
                                            <th>Attempted</th>
                                            <th>Assigned</th>
                                            <th>Attempted</th>
                                        </tr>
                                    </thead>

                                    <tbody className="text-center">
                                        {asArray(overallStats.tenantwise.tenantWiseTechstats).map((tenant) => {
                                            const coding = asArray(overallStats.tenantwise.tenantWiseCodingstats).find(
                                                t => t.tenant_id === tenant.tenant_id
                                            );
                                            const company = asArray(overallStats.tenantwise.tenantWiseCompanystats).find(
                                                t => t.tenant_id === tenant.tenant_id
                                            );

                                            return (
                                                <tr key={tenant.tenant_id}>
                                                    <td className="fw-bold">{tenant.tenant_name}</td>

                                                    {/* Technology */}
                                                    <td>{tenant.totalAssigned}</td>
                                                    <td className="text-primary fw-bold">{tenant.totalAttempted}</td>

                                                    {/* Coding */}
                                                    <td>{coding?.totalAssigned || 0}</td>
                                                    <td className="text-success fw-bold">{coding?.totalAttempted || 0}</td>

                                                    {/* Company */}
                                                    <td>{company?.totalAssigned || 0}</td>
                                                    <td className="text-danger fw-bold">{company?.totalAttempted || 0}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </Col>
                        )}
                    </Col>
                    <Col md="6">
                        <h4 style={{ fontWeight: "600" }}>Yesterday's Statistics</h4>
                        {loading ? (
                            <div className="text-center my-4">
                                <Spinner color="success" />
                                <p>Loading stats...</p>
                            </div>
                        ) : !yesterdayAssignedStats ? (
                            <p className="text-muted">No data available.</p>
                        ) : (
                            <Table bordered hover responsive className="shadow-sm rounded-4">
                                <thead className="text-center">
                                    <tr>
                                        <th >Tenant</th>
                                        <th colSpan="2">Technology</th>
                                        <th colSpan="2">Coding</th>
                                        <th colSpan="2">Company</th>
                                    </tr>
                                    <tr className="small text-center">
                                        <th></th>
                                        <th>Assigned</th>
                                        <th>Attempted</th>
                                        <th>Assigned</th>
                                        <th>Attempted</th>
                                        <th>Assigned</th>
                                        <th>Attempted</th>
                                    </tr>
                                </thead>

                                <tbody className="text-center">
                                    {asArray(yesterdayAssignedStats.data).map((tenant) => {
                                        const attemptedObj = asArray(yesterdayAttemptedStats?.data).find(
                                            (t) => t.tenant_id === tenant.tenant_id
                                        );

                                        return (
                                            <tr key={tenant.tenant_id}>
                                                {/* Tenant */}
                                                <td className="fw-bold">{tenant.tenant_name}</td>

                                                {/* Technology */}
                                                <td>{renderCount(tenant.technologyInterviews)}</td>
                                                <td className="text-primary fw-bold">
                                                    {renderCount(attemptedObj?.technologyInterviews)}
                                                </td>

                                                {/* Coding */}
                                                <td>{renderCount(tenant.codingInterviews)}</td>
                                                <td className="text-success fw-bold">
                                                    {renderCount(attemptedObj?.codingInterviews)}
                                                </td>

                                                {/* Company */}
                                                <td>{renderCount(tenant.companyInterviews)}</td>
                                                <td className="text-danger fw-bold">
                                                    {renderCount(attemptedObj?.companyInterviews)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        )}
                    </Col>
                </Row>

                <Row className="mt-2 mb-3">

                </Row>
            </Row>
            <Row>
                <Col md="8">
                    <h5 className="mb-3  fw-bold mt-3">Current Interview Stats</h5>
                    <Col md="12">
                        <Table bordered hover responsive className="shadow-sm rounded-4">
                            <thead className=" text-center">
                                <tr>
                                    <th>Tenant</th>
                                    <th colSpan="3">Technology</th>
                                    <th colSpan="3">Coding</th>
                                    <th colSpan="3">Company</th>
                                </tr>
                                <tr className="small text-center">
                                    <th></th>
                                    <th>Assigned</th>
                                    <th>Attempted</th>
                                    <th>Upcoming</th>
                                    <th>Assigned</th>
                                    <th>Attempted</th>
                                    <th>Upcoming</th>
                                    <th>Assigned</th>
                                    <th>Attempted</th>
                                    <th>Upcoming</th>
                                </tr>
                            </thead>

                            <tbody className="text-center">
                                {currentStats?.map((tenant) => (
                                    <tr key={tenant.tenant_id}>
                                        <td className="fw-bold">{tenant.tenant_name}</td>

                                        {/* Technology */}
                                        <td>{tenant.technologyInterviews?.assigned}</td>
                                        <td className="text-primary fw-bold">{tenant.technologyInterviews?.attempted}</td>
                                        <td className="text-warning fw-bold">{tenant.technologyInterviews?.upcoming}</td>

                                        {/* Coding */}
                                        <td>{tenant.codingInterviews?.assigned}</td>
                                        <td className="text-primary fw-bold">{tenant.codingInterviews?.attempted}</td>
                                        <td className="text-warning fw-bold">{tenant.codingInterviews?.upcoming}</td>

                                        {/* Company */}
                                        <td>{tenant.companyInterviews?.assigned}</td>
                                        <td className="text-primary fw-bold">{tenant.companyInterviews?.attempted}</td>
                                        <td className="text-warning fw-bold">{tenant.companyInterviews?.upcoming}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Col>
            </Row>
            <Row>
                <Col md="6">
                    {daywiseStats && <ApexChart stats={daywiseStats} />}
                </Col>
            </Row>
        </React.Fragment>
    );

};

export default TotalSuperAdminStats;