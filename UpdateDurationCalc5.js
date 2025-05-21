// Utility function to calculate total work duration excluding break time
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

// Button-triggered function (action: "onCalculateDuration")
function onCalculateDuration(formData, updateFormData) {
  console.log("🟢 formData keys:", Object.keys(formData));

  }

  const updatedRows = formData.Timesheet.map((row, index) => {
    console.log(`🔍 Processing row ${index + 1}:`, row);

    const duration = calculateDuration(
      row.startTime,
      row.breakStart,
      row.breakEnd,
      row.endTime
    );

    console.log(`✅ Row ${index + 1} duration:`, duration);

    return {
      ...row,
      duration: duration
    };
  });

  updateFormData({
    Timesheet: updatedRows
  });

  console.log("✅ All rows updated and pushed to form.");
}
