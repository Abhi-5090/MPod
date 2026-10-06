import React, { useCallback, useMemo, useRef } from "react"
import PropTypes from "prop-types"
import Flatpickr from "react-flatpickr"

// Times are compared to the minute (the picker has no seconds).
const toTime = v => {
  if (!v) return null
  const d = v instanceof Date ? v : new Date(v)
  return Number.isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 60000) * 60000
}

// Date + time picker for interview start times. Reports the chosen time on every
// change (calendar click, arrows, typed hour/minute, AM/PM, closing the picker),
// so the value saved is always exactly what the field shows.
// It only reports when the time really changes: flatpickr also fires value
// updates when the parent re-renders, which would otherwise loop forever.
const DateTimePicker = ({ value, onChange, allowPast = false }) => {
  const valueTime = toTime(value)
  // A stable Date per distinct time, so the picker is not reset on every render.
  const current = useMemo(() => (valueTime === null ? "" : new Date(valueTime)), [valueTime])
  const lastTime = useRef(valueTime)
  lastTime.current = valueTime
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Stable callback: react-flatpickr re-applies hooks whenever their identity
  // changes, and re-applying fires a value update - a new function per render
  // would loop forever.
  const report = useCallback(selectedDates => {
    const d = selectedDates && selectedDates[0] ? selectedDates[0] : null
    const t = toTime(d)
    if (t === lastTime.current) return
    lastTime.current = t
    onChangeRef.current(d)
  }, [])

  const options = useMemo(
    () => ({
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      altInput: true,
      altFormat: "F j, Y h:i K",
      minuteIncrement: 5,
      ...(allowPast ? {} : { minDate: "today" }),
      // Hooks live inside this memoised options object (never as props): react-flatpickr
      // re-applies prop hooks on every render, which fires value updates in a loop.
      onChange: [report],
      onValueUpdate: [report],
      onClose: [report],
    }),
    [allowPast, report]
  )

  return (
    <Flatpickr
      value={current}
      className="form-control d-block"
      placeholder="Select date and time"
      options={options}
    />
  )
}

DateTimePicker.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  onChange: PropTypes.func.isRequired,
  allowPast: PropTypes.bool,
}

export default DateTimePicker
