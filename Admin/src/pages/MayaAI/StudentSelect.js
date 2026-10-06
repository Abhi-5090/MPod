import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import axios from "axios"
import Select from "react-select"
import { apiUrl, getErrorMessage } from "../../config/api"

// Searchable list of the college's active students (GET get-students/:tenantId).
// value / onChange use the roll number string.
const StudentSelect = ({ tenantId, value, onChange }) => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!tenantId) {
      setStudents([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError("")
    axios
      .get(apiUrl(`get-students/${tenantId}`))
      .then(res => {
        if (!cancelled) setStudents(Array.isArray(res.data) ? res.data : [])
      })
      .catch(err => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load students."))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tenantId])

  const options = students.map(s => ({
    value: s.roll_no,
    label: `${s.roll_no}${s.first_name ? ` - ${s.first_name}` : ""}${s.branch ? ` (${s.branch})` : ""}`,
  }))
  const selected = options.find(o => o.value === value) || null

  return (
    <>
      <Select
        value={selected}
        onChange={opt => onChange(opt ? opt.value : "")}
        options={options}
        isLoading={loading}
        isClearable
        placeholder={tenantId ? "Search by roll no or name..." : "Select a college first"}
        noOptionsMessage={() => (loading ? "Loading..." : "No students found. Import students under Users first.")}
        classNamePrefix="select2-selection"
        isDisabled={!tenantId}
      />
      {error && <small className="text-danger">{error}</small>}
    </>
  )
}

StudentSelect.propTypes = {
  tenantId: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
}

export default StudentSelect
