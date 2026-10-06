import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Row, Col, Card, CardBody, CardTitle, Button, Badge, Input } from "reactstrap";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import { toast } from "react-toastify";
import { setBreadcrumbItems } from "../../store/actions";
import { apiUrl, getErrorMessage } from "../../config/api";
import useTenantSelection, { TenantSelect } from "./useTenantSelection";
import LoadState from "../../components/Common/LoadState";
import ConfirmModal from "../../components/Common/ConfirmModal";
import {
  attemptedPercentage,
  deleteResultMessage,
  getYesterdayDateString,
  studentReportUrl,
} from "./interviewHelpers";
import "./datatables.scss";

// map raw interviews to table rows
const mapToRows = (arr) =>
  (arr || []).map((interview) => ({
    platform: interview.platform,
    roll_no: interview.roll_no,
    first_name: interview.first_name,
    gender: interview.gender,
    type: interview.type,
    round: interview.round,
    questions_count: interview.questions_count,
    start_date_time: interview.start_date_time_ist || interview.start_date_time,
    interview_status: interview.interview_status,
    _id: interview._id,
  }));

const CompanyInterviewsList = (props) => {
  document.title = "Company Interviews List | Mpod";

  const tenantSelection = useTenantSelection();
  const { tenantId, tenantName } = tenantSelection;
  const [interviewsData, setInterviewsData] = useState([]); // date-scoped data from server
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(getYesterdayDateString()); // YYYY-MM-DD
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    props.setBreadcrumbItems("Maya AI", [
      { title: "Mpod", link: "#" },
      { title: "Maya Ai", link: "#" },
      { title: "Company Interviews List", link: "#" },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch interviews for a date (YYYY-MM-DD)
  const fetchInterviewsData = useCallback(
    async (dateParam) => {
      if (!tenantId) {
        setInterviewsData([]);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(apiUrl(`get-company-interviews/${tenantId}`), {
          params: dateParam ? { date: dateParam } : {},
        });
        setInterviewsData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setInterviewsData([]);
        setError(getErrorMessage(err, "Failed to load company interviews."));
      } finally {
        setLoading(false);
      }
    },
    [tenantId]
  );

  useEffect(() => {
    fetchInterviewsData(filterDate || getYesterdayDateString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchInterviewsData]);

  // handle date change: request that specific date from server (cleared -> yesterday)
  const handleDateChange = (e) => {
    const val = e.target.value;
    setFilterDate(val || "");
    fetchInterviewsData(val || getYesterdayDateString());
  };

  // search applies on interviewsData (already date-scoped)
  const filteredRows = useMemo(() => {
    const term = (searchTerm || "").trim().toLowerCase();
    const filtered = !term
      ? interviewsData
      : interviewsData.filter(
          (interview) =>
            (interview.first_name || "").toLowerCase().includes(term) ||
            String(interview.roll_no || "").toLowerCase().includes(term) ||
            (interview.platform || "").toLowerCase().includes(term)
        );
    return mapToRows(filtered);
  }, [searchTerm, interviewsData]);

  // counts use the date-scoped results
  const upcomingCount = interviewsData.filter((i) => i.interview_status === "Upcoming").length;
  const attemptedCount = interviewsData.filter((i) => i.interview_status === "Attempted").length;
  const expiredCount = interviewsData.filter((i) => i.interview_status === "Expired").length;

  const confirmDeleteInterview = async () => {
    setDeleting(true);
    try {
      const res = await axios.delete(apiUrl(`delete-company-interviewee-details/${selectedInterviewId}`));
      const deletedId = selectedInterviewId;
      setInterviewsData((prev) => prev.filter((interview) => interview._id !== deletedId));
      setSelectedInterviewId(null);
      toast.success(deleteResultMessage(res.data));
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete interview."));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { dataField: "platform", text: "Platform", sort: true },
    { dataField: "roll_no", text: "Roll no", sort: true },
    { dataField: "first_name", text: "Name", sort: true },
    { dataField: "gender", text: "Gender", sort: true },
    { dataField: "type", text: "Type", sort: true },
    { dataField: "round", text: "Round", sort: true },
    { dataField: "questions_count", text: "No of Questions", sort: true },
    { dataField: "start_date_time", text: "Start Date & Time", sort: true },
    {
      dataField: "interview_status",
      text: "Status",
      sort: true,
      formatter: (cell) => (
        <Badge color={cell === "Attempted" ? "success" : cell === "Expired" ? "danger" : "warning"} pill>
          {cell}
        </Badge>
      ),
    },
    {
      dataField: "actions",
      text: "Actions",
      sort: false,
      isDummyField: true,
      formatter: (cell, interview) =>
        interview.interview_status === "Attempted" ? (
          <a
            href={studentReportUrl("report", {
              roll_no: interview.roll_no,
              interview_type: "company",
              id: interview._id,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-info btn-sm me-2"
          >
            View
          </a>
        ) : (
          <>
            {interview.interview_status === "Upcoming" && (
              <Link to={`/edit-company-interview/${interview._id}`} className="btn btn-primary btn-sm me-2">
                Edit
              </Link>
            )}
            <Button color="danger" size="sm" onClick={() => setSelectedInterviewId(interview._id)}>
              Delete
            </Button>
          </>
        ),
    },
  ];

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">{tenantName ? `${tenantName} - ` : ""}Company Interviews List</CardTitle>
              <div className="d-flex align-items-center gap-2">
                <TenantSelect {...tenantSelection} />
                <Link to="/add-company-interview" className="btn btn-primary waves-effect waves-light text-nowrap">
                  ADD INTERVIEW
                </Link>
              </div>
            </CardBody>

            <CardBody>
              {/* --- ultra-compact small cards: minimal height --- */}
              <Row className="mb-2">
                <Col xs="2">
                  <div
                    style={{
                      background: "#eef4ff",
                      borderLeft: "4px solid #007bff",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      textAlign: "center",
                      minHeight: "44px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center"
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 500, color: "#555" }}>
                      Upcoming
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#007bff", lineHeight: "16px" }}>
                      {upcomingCount}
                    </div>
                  </div>
                </Col>

                <Col xs="2">
                  <div
                    style={{
                      background: "#eaffea",
                      borderLeft: "4px solid #28a745",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      textAlign: "center",
                      minHeight: "44px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center"
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 500, color: "#555" }}>
                      Attempted
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#28a745", lineHeight: "16px" }}>
                      {attemptedCount}
                    </div>
                  </div>
                </Col>

                <Col xs="2">
                  <div
                    style={{
                      background: "#ffeaea",
                      borderLeft: "4px solid #dc3545",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      textAlign: "center",
                      minHeight: "44px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center"
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 500, color: "#555" }}>
                      Expired
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#dc3545", lineHeight: "16px" }}>
                      {expiredCount}
                    </div>
                  </div>
                </Col>
                <Col xs="2">
                  <div
                    style={{
                      background: "#ffeaea",
                      borderLeft: "4px solid #fd8f00ff",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      minHeight: "44px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#555" }}>Percentage</div>
                    <div style={{ fontSize: "17px", fontWeight: "700", color: "#fd8f00ff" }}>
                      {attemptedPercentage(attemptedCount, expiredCount)}%
                    </div>
                  </div>
                </Col>
              </Row>

              {/* --- Filters row (date + search) --- */}
              <Row className="mb-3">
                <Col xs="3">
                  <Input
                    type="text"
                    placeholder="Search by Name, Roll No, Platform"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>

                <Col xs="3">
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={handleDateChange}
                  />
                  <small className="text-muted">Showing yesterday by default</small>
                </Col>
              </Row>

              <LoadState
                loading={loading}
                error={error}
                empty={!tenantId || !filteredRows.length}
                emptyText={tenantId ? "No interviews found for selected date." : "Select a college"}
                onRetry={() => fetchInterviewsData(filterDate || getYesterdayDateString())}
              >
                <BootstrapTable
                  bootstrap4
                  keyField="_id"
                  columns={columns}
                  data={filteredRows}
                  pagination={paginationFactory()}
                />
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <ConfirmModal
        isOpen={!!selectedInterviewId}
        toggle={() => setSelectedInterviewId(null)}
        onConfirm={confirmDeleteInterview}
        title="Confirm Deletion"
        message="Are you sure you want to delete this interview?"
        busy={deleting}
      />
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(CompanyInterviewsList);
