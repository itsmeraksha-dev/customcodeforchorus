const tableBody = document.querySelector('.p-datatable-tbody');
let tableWatcher;

function extractTableData() {
  const rows = tableBody.querySelectorAll('tr');
  const data = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td div');
    if (cells.length >= 6) {
      const dateText = cells[0]?.textContent.trim();
      const dateObj = new Date(dateText);
      const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;

      const startTime = cells[1]?.textContent.trim();
      const breakStart = cells[2]?.textContent.trim();
      const breakEnd = cells[3]?.textContent.trim();
      const endTime = cells[4]?.textContent.trim();
      const totalDuration = cells[5]?.textContent.trim();
      
      const startMin = toMinutes(startTime);
      const breakStartMin = toMinutes(breakStart);
      const breakEndMin = toMinutes(breakEnd);
      const endMin = toMinutes(endTime);

      let isValid = true;
      if (breakStartMin !== null && startMin !== null && breakStartMin < startMin) isValid = false;
      if (breakEndMin !== null && ((startMin !== null && breakEndMin < startMin) || (breakStartMin !== null && breakEndMin < breakStartMin))) isValid = false;
      if (endMin !== null && ((startMin !== null && endMin < startMin) || (breakStartMin !== null && endMin < breakStartMin) || (breakEndMin !== null && endMin < breakEndMin))) isValid = false;

      if (!isValid) {
        row.style.backgroundColor = "#ffe6e6"; // optional: highlight invalid row
        return; // skip this row
      }
      data.push({
        Date: formattedDate,
        startTime,
        breakStart,
        breakEnd,
        endTime,
        totalDuration
      });
    }
  });

  const jsonString = JSON.stringify(data);
  UXBClientAPI.setDataSourceValues({ tableString: jsonString });
}

function toMinutes(timeStr) {
  if (!timeStr || !timeStr.includes(":")) return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToHHMM(minutes) {
  const hrs = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}`;
}

function calculateDuration(start, breakStart, breakEnd, end) {
  const startMin = toMinutes(start);
  const breakStartMin = toMinutes(breakStart);
  const breakEndMin = toMinutes(breakEnd);
  const endMin = toMinutes(end);

  if ([startMin, breakStartMin, breakEndMin, endMin].some(val => val === null)) return "";

  const worked = endMin - startMin;
  const breakTime = breakEndMin - breakStartMin;
  const net = worked - breakTime;

  if (net < 0 || isNaN(net)) return "Invalid";

  return minutesToHHMM(net);
}

function updateTotalDurations() {
  console.log("updateTotalDurations() - start");

  let totalMinutes = 0;

  try {
    if (tableWatcher) tableWatcher.disconnect();

    const rows = document.querySelectorAll(".p-datatable-tbody tr");

    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll("td div");

      if (cells.length < 6) {
        console.warn(`Row ${rowIndex} skipped due to insufficient cells.`);
        if (rowIndex === 0) {
          console.log(`Row 0 innerHTML:`, row.innerHTML);
          console.log(`Row 0 cell count:`, cells.length);
          cells.forEach((cell, i) => {
            console.log(`Cell ${i} content:`, cell.textContent.trim());
          });
        }
        return;
      }

      const start = cells[1]?.textContent.trim();
      const breakStart = cells[2]?.textContent.trim();
      const breakEnd = cells[3]?.textContent.trim();
      const end = cells[4]?.textContent.trim();

      const durationStr = calculateDuration(start, breakStart, breakEnd, end);
      const durationCell = cells[5];

      if (durationCell && durationStr !== "" && durationStr !== "Invalid") {
        if (durationCell.textContent !== durationStr) {
          durationCell.textContent = durationStr;
          console.log(`Row ${rowIndex} duration updated to: ${durationStr}`);
        }

        const mins = toMinutes(durationStr);
        if (mins !== null) {
          totalMinutes += mins;
        }
      }
    });

    const totalFormatted = minutesToHHMM(totalMinutes);
    UXBClientAPI.setDataSourceValues({ TotalTime: totalFormatted });
    console.log(`TotalTime set to: ${totalFormatted}`);

  } catch (err) {
    console.error("Error in updateTotalDurations:", err);
  } finally {
    if (tableBody && tableWatcher) {
      tableWatcher.observe(tableBody, { childList: true, subtree: true });
    }
  }

  console.log("updateTotalDurations() - end");
}

// MutationObserver
tableWatcher = new MutationObserver(() => {
  console.log("MutationObserver triggered");
  extractTableData();
  updateTotalDurations();
});

if (tableBody) {
  tableWatcher.observe(tableBody, { childList: true, subtree: true });
  console.log("MutationObserver attached to tableBody");
} else {
  console.warn("tableBody not found; MutationObserver not attached");
}

// Initial run
extractTableData();
updateTotalDurations();
