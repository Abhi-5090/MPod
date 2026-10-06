import React, { useCallback, useEffect, useMemo, useState } from "react";
import RetryEvaluationButton from "../../components/Common/RetryEvaluationButton";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Button, Badge, Card, CardBody, CardTitle, Row, Col, Input } from "reactstrap";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { setBreadcrumbItems } from "../../store/actions";
import { apiUrl, getErrorMessage } from "../../config/api";
import useTenantSelection, { TenantSelect } from "./useTenantSelection";
import LoadState from "../../components/Common/LoadState";
import ConfirmModal from "../../components/Common/ConfirmModal";
import {
  attemptedPercentage,
  deleteResultMessage,
  getTodayDateString,
  studentReportUrl, statusColor, canRetryEvaluation } from "./interviewHelpers";

const joinList = (value) => (Array.isArray(value) ? value.join(", ") : value || "");

const InterviewsList = (props) => {
  document.title = "Interviews List | Mpod";

  const tenantSelection = useTenantSelection();
  const { tenantId, tenantName } = tenantSelection;
  const [interviewsData, setInterviewsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(getTodayDateString()); // Holds selected date
  const [statusFilter, setStatusFilter] = useState("All");
  const [technologyFilter, setTechnologyFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    props.setBreadcrumbItems("Interviews List", [
      { title: "Mpod", link: "#" },
      { title: "Maya Ai", link: "#" },
      { title: "Interviews List", link: "#" },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch interviews for a specific date (YYYY-MM-DD).
  const fetchInterviewsData = useCallback(
    async (dateString) => {
      if (!tenantId) {
        setInterviewsData([]);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(apiUrl(`get-all-interviewee-details/${tenantId}`), {
          params: dateString ? { date: dateString } : {},
        });
        setInterviewsData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setInterviewsData([]);
        setError(getErrorMessage(err, "Failed to load interviews."));
      } finally {
        setLoading(false);
      }
    },
    [tenantId]
  );

  useEffect(() => {
    fetchInterviewsData(filterDate || getTodayDateString());
    // Only on mount / tenant change; date changes fetch via handleDateChange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchInterviewsData]);

  // When user changes date input, fetch that date from server.
  // If the date is cleared, today is fetched again.
  const handleDateChange = (e) => {
    const value = e.target.value;
    setFilterDate(value || "");
    fetchInterviewsData(value || getTodayDateString());
  };

  const technologyOptions = useMemo(
    () => ["All", ...Array.from(new Set(interviewsData.map((item) => item.technology_name).filter(Boolean)))],
    [interviewsData]
  );

  const filteredData = useMemo(() => {
    // The server already returns only the interviews for the requested IST day.
    let filtered = interviewsData;
    if (statusFilter !== "All") {
      filtered = filtered.filter((interview) => interview.interview_status === statusFilter);
    }
    if (technologyFilter !== "All") {
      filtered = filtered.filter((interview) => interview.technology_name === technologyFilter);
    }
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter(
        (interview) =>
          (interview.platform || "").toLowerCase().includes(term) ||
          String(interview.roll_no || "").toLowerCase().includes(term) ||
          (interview.first_name || "").toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [interviewsData, statusFilter, technologyFilter, searchTerm]);

  const upcomingCount = filteredData.filter((i) => i.interview_status === "Upcoming").length;
  const attemptedCount = filteredData.filter((i) => i.interview_status === "Attempted").length;
  const expiredCount = filteredData.filter((i) => i.interview_status === "Expired").length;

  const confirmDeleteInterview = async () => {
    setDeleting(true);
    try {
      const res = await axios.delete(apiUrl(`delete-interviewee-details/${selectedInterviewId}`));
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
    { dataField: "roll_no", text: "Roll No", sort: true },
    { dataField: "college", text: "College", sort: true },
    { dataField: "first_name", text: "Name", sort: true },
    { dataField: "gender", text: "Gender", sort: true },
    { dataField: "technology_name", text: "Technology", sort: true },
    { dataField: "module_name", text: "Modules", formatter: joinList },
    { dataField: "topic_name", text: "Topics", formatter: joinList },
    { dataField: "level", text: "Level" },
    { dataField: "questions_count", text: "No of Questions" },
    { dataField: "start_date_time_ist", text: "Start Date & Time" },
    {
      dataField: "interview_status",
      text: "Status",
      formatter: (status, row) => (
        <><Badge color={statusColor(status)}>
          {status}
        </Badge>{row && row.provisional && (<Badge color="warning" className="ms-1" title={row.evaluation_error || "Scored without AI"}>Provisional</Badge>)}</>
      ),
    },
    { dataField: "average_accuracy", text: "Total Accuracy" },
    {
      dataField: "actions",
      text: "Actions",
      isDummyField: true,
      formatter: (cell, interview) =>
        interview.interview_status === "Attempted" ? (
          <>
          <a
            href={studentReportUrl("report", {
              roll_no: interview.roll_no,
              interview_type: "ai generated",
              id: interview._id,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-info btn-sm me-2"
          >
            View
          </a>
            {interview.provisional && (
              <RetryEvaluationButton interviewId={interview._id} interviewType="ai generated" label="Re-score with AI" title="Replace the provisional score with the AI evaluation" />
            )}
          </>
        ) : (
          <>
            {interview.interview_status === "Upcoming" && (
              <Link to={`/edit-ai-interview/${interview._id}`} className="btn btn-primary btn-sm me-2">
                Edit
              </Link>
            )}
            {canRetryEvaluation(interview.interview_status) && (
              <RetryEvaluationButton interviewId={interview._id} interviewType="ai generated" title={interview.evaluation_error || ""} />
            )}
            <Button color="danger" size="sm" onClick={() => setSelectedInterviewId(interview._id)}>
              Delete
            </Button>
          </>
        ),
    },
  ];

  const downloadExcel = () => {
    const exportData = filteredData.map((item) => ({
      Platform: item.platform,
      "Roll No": item.roll_no,
      College: item.college,
      Name: item.first_name,
      Gender: item.gender,
      Technology: item.technology_name,
      Modules: joinList(item.module_name),
      Topics: joinList(item.topic_name),
      Level: item.level,
      "No of Questions": item.questions_count,
      "Start Date & Time": item.start_date_time_ist,
      Accuracy: item.average_accuracy,
      Status: item.interview_status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Interviews");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "InterviewsList.xlsx");
  };

  return (
    <React.Fragment>
      <Row>
        <Col xs="12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">{tenantName ? `${tenantName} - ` : ""}Interview List</CardTitle>
              <div className="d-flex align-items-center gap-2">
                <TenantSelect {...tenantSelection} />
                <Button color="success" onClick={downloadExcel} className="text-nowrap" disabled={!filteredData.length}>
                  Download Excel
                </Button>
                <Link to="/add-ai-interview" className="btn btn-primary text-nowrap">
                  ADD INTERVIEW
                </Link>
              </div>
            </CardBody>
            <CardBody>
              <Row className="mb-2">
                <Col xs="2">
                  <div
                    style={{
                      background: "#eef4ff",
                      borderLeft: "4px solid #007bff",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      textAlign: "center",
                      minHeight: "48px"
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
                      minHeight: "48px"
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
                      minHeight: "48px"
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



              <Row className="mb-3">
                <Col xs="3">
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by platform, roll no, or name"
                  />
                </Col>
                <Col xs="3">
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={handleDateChange}
                    placeholder="Filter by Date"
                  />
                  <small className="text-muted">Showing today by default</small>
                </Col>
                <Col xs="3">
                  <Input
                    type="select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Attempted">Attempted</option>
                    <option value="Expired">Expired</option>
                    <option value="In progress">In progress</option>
                    <option value="Waiting for AI">Waiting for AI</option>
                    <option value="Evaluating">Evaluating</option>
                    <option value="Evaluation failed">Evaluation failed</option>
                  </Input>
                </Col>
                <Col xs="3">
                  <Input
                    type="select"
                    value={technologyFilter}
                    onChange={(e) => setTechnologyFilter(e.target.value)}
                  >
                    {technologyOptions.map((tech, index) => (
                      <option key={index} value={tech}>
                        {tech}
                      </option>
                    ))}
                  </Input>
                </Col>
              </Row>
              <LoadState
                loading={loading}
                error={error}
                empty={!tenantId || !filteredData.length}
                emptyText={tenantId ? "No interviews found" : "Select a college"}
                onRetry={() => fetchInterviewsData(filterDate || getTodayDateString())}
              >
                <BootstrapTable
                  keyField="_id"
                  data={filteredData}
                  columns={columns}
                  condensed
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

export default connect(null, { setBreadcrumbItems })(InterviewsList);
