import React, { useCallback, useEffect, useMemo, useState } from "react";
import RetryEvaluationButton from "../../components/Common/RetryEvaluationButton";
import { Row, Col, Card, CardBody, CardTitle, Button, Badge, Input } from "reactstrap";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { setBreadcrumbItems } from "../../store/actions";
import { apiUrl, getErrorMessage } from "../../config/api";
import useTenantSelection, { TenantSelect } from "./useTenantSelection";
import LoadState from "../../components/Common/LoadState";
import ConfirmModal from "../../components/Common/ConfirmModal";
import { deleteResultMessage, studentReportUrl, statusColor, canRetryEvaluation } from "./interviewHelpers";
import "./datatables.scss";

const CodingInterviewsList = (props) => {
  document.title = "Coding Interviews List | Mpod";

  const tenantSelection = useTenantSelection();
  const { tenantId, tenantName } = tenantSelection;
  const [interviewsData, setInterviewsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(""); // Holds selected date
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    props.setBreadcrumbItems("Maya AI", [
      { title: "Mpod", link: "#" },
      { title: "Maya Ai", link: "#" },
      { title: "Coding Interviews List", link: "#" },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInterviewsData = useCallback(async () => {
    if (!tenantId) {
      setInterviewsData([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(apiUrl(`get-all-coding-interview-details/${tenantId}`));
      setInterviewsData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setInterviewsData([]);
      setError(getErrorMessage(err, "Failed to load coding interviews."));
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchInterviewsData();
  }, [fetchInterviewsData]);

  const confirmDeleteInterview = async () => {
    setDeleting(true);
    try {
      const res = await axios.delete(apiUrl(`delete-coding-interview/${selectedInterviewId}`));
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

  const filteredData = useMemo(() => {
    let filtered = interviewsData;

    // Filter by Date
    if (filterDate) {
      const selectedDate = new Date(filterDate).toDateString();
      filtered = filtered.filter((interview) => {
        if (!interview.start_date_time_ist) return false;
        const interviewDate = new Date(
          interview.start_date_time_ist.split(" ")[0].split("-").reverse().join("-")
        );
        return interviewDate.toDateString() === selectedDate;
      });
    }

    // Filter by Status
    if (statusFilter !== "All") {
      filtered = filtered.filter((interview) => interview.interview_status === statusFilter);
    }

    // Filter by Search Term
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
  }, [filterDate, statusFilter, searchTerm, interviewsData]);

  const columns = [
    { dataField: "platform", text: "Platform", sort: true },
    { dataField: "roll_no", text: "Roll no", sort: true },
    { dataField: "first_name", text: "Name", sort: true },
    { dataField: "gender", text: "Gender", sort: true },
    { dataField: "level", text: "Level", sort: true },
    { dataField: "questions_count", text: "No of Questions", sort: true },
    { dataField: "start_date_time_ist", text: "Start Date & Time", sort: true },
    {
      dataField: "interview_status",
      text: "Status",
      sort: true,
      formatter: (cell) => (
        <Badge color={statusColor(cell)} pill>
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
            href={studentReportUrl("coding-report", {
              roll_no: interview.roll_no,
              interview_type: "coding",
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
              <Link to={`/edit-coding-interview/${interview._id}`} className="btn btn-primary btn-sm me-2">
                Edit
              </Link>
            )}
            {canRetryEvaluation(interview.interview_status) && (
              <RetryEvaluationButton interviewId={interview._id} interviewType="coding" title={interview.evaluation_error || ""} />
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
      Name: item.first_name,
      Gender: item.gender,
      Level: item.level,
      "No of Questions": item.questions_count,
      "Start Date & Time": item.start_date_time_ist,
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
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">{tenantName ? `${tenantName} - ` : ""}Coding Interviews List</CardTitle>
              <div className="d-flex align-items-center gap-2">
                <TenantSelect {...tenantSelection} />
                <Button color="success" onClick={downloadExcel} className="text-nowrap" disabled={!filteredData.length}>
                  Download Excel
                </Button>
                <Link to="/add-coding-interview" className="btn btn-primary text-nowrap">
                  ADD CODING INTERVIEW
                </Link>
              </div>
            </CardBody>
            <CardBody>
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
                    onChange={(e) => setFilterDate(e.target.value)}
                    placeholder="Filter by Date"
                  />
                </Col>
                <Col xs="3">
                  <Input type="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
              </Row>
              <LoadState
                loading={loading}
                error={error}
                empty={!tenantId || !filteredData.length}
                emptyText={tenantId ? "No coding interviews found" : "Select a college"}
                onRetry={fetchInterviewsData}
              >
                <BootstrapTable
                  bootstrap4
                  keyField="_id"
                  columns={columns}
                  data={filteredData}
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

export default connect(null, { setBreadcrumbItems })(CodingInterviewsList);
