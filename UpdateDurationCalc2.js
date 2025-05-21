/**
 * Utility function to calculate duration in hours and minutes.
 * Expects time strings in "HH:MM" 24-hour format.
 */
function calculateDuration(start, breakStart, breakEnd, end) {
  function toMinutes(t) {
    if (!t || !t.includes(":")) return 0;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  const startMin = toMinutes(start);
  const breakStartMin = toMinutes(breakStart);
  const breakEndMin = toMinutes(breakEnd);
  const endMin = toMinutes(end);

  const workDuration = endMin - startMin;
  const breakDuration = breakEndMin - breakStartMin;
  const netDuration = workDuration - breakDuration;

  if (netDuration < 0 || isNaN(netDuration)) return "Invalid input";

  const hrs = Math.floor(netDuration / 60);
  const mins = netDuration % 60;
  return `${hrs}h ${mins}m`;
}

/**
 * Function triggered by a button with action: "onCalculateDuration"
 * Iterates over Timesheet_Table and calculates durations per row.
 */
function onCalculateDuration(formData, updateFormData) {
  const updatedRows = formData.Timesheet_Table.map(row => {
    const duration = calculateDuration(
      row.startTime,
      row.breakStart,
      row.breakEnd,
      row.endTime
    );

    return {
      ...row,
      duration: duration
    };
  });

  updateFormData({
    Timesheet_Table: updatedRows
  });
}
