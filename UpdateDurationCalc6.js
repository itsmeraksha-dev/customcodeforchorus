// Converts a time string ("HH:mm") to total minutes
function toMinutes(t) {
  if (!t || typeof t !== "string" || !t.includes(":")) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Calculates total duration excluding break time
function calculateDuration(start, breakStart, breakEnd, end) {
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

// Main function called by UX Builder via button action
function onCalculateDuration(formData, updateFormData) {
  console.log("🟢 Button clicked. formData:", formData);

  // Show all keys in formData to help you find the table name
  const keys = Object.keys(formData);
  console.log("🧩 formData keys:", keys);

  // Try to find the first table field automatically
  const tableKey = keys.find(k => Array.isArray(formData[k]));
  if (!tableKey) {
    console.error("❌ No table found in formData.");
    return;
  }

  console.log(`📋 Using table key: ${tableKey}`);

  const updatedRows = formData[tableKey].map((row, index) => {
    console.log(`🔄 Processing row ${index + 1}:`, row);

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

  // Push updated rows back to the table
  updateFormData({
    [tableKey]: updatedRows
  });

  console.log("✅ Duration updated in form.");
}
