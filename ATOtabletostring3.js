const tableBody = document.querySelector('.p-datatable-tbody');

function extractTableData() {
  const rows = tableBody.querySelectorAll('tr');
  const data = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td div');
    if (cells.length >= 6) {
      const dateText = cells[0]?.textContent.trim();
      const parsedDate = new Date(dateText);
      
      let formattedDate = "";
      if (!isNaN(parsedDate)) {
        const year = parsedDate.getFullYear();
        const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
        const day = parsedDate.getDate().toString().padStart(2, "0");
        formattedDate = `${year}-${month}-${day}`;
      }

      const startTime = cells[1]?.textContent.trim();
      const breakStart = cells[2]?.textContent.trim();
      const breakEnd = cells[3]?.textContent.trim();
      const endTime = cells[4]?.textContent.trim();
      const totalDuration = cells[5]?.textContent.trim();

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
  // Send to UX Builder
  UXBClientAPI.setDataSourceValues({ tableString: jsonString });
}

function toMinutes(timeStr) {
  if (!timeStr || !timeStr.includes(":")) return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
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

  const hrs = Math.floor(net / 60).toString().padStart(2, "0");
  const mins = (net % 60).toString().padStart(2, "0");

  return `${hrs}:${mins}`;
}

function updateTotalDurations() {
  const rows = document.querySelectorAll(".p-datatable-tbody tr");

  rows.forEach(row => {
    const cells = row.querySelectorAll("td div");

    if (cells.length < 7) return;

    const start = cells[2]?.textContent.trim();
    const breakStart = cells[3]?.textContent.trim();
    const breakEnd = cells[4]?.textContent.trim();
    const end = cells[5]?.textContent.trim();

    const duration = calculateDuration(start, breakStart, breakEnd, end);

    const durationCell = cells[6];
    if (durationCell) {
      durationCell.textContent = duration;
    }
  });
}

// Run it
const tableWatcher = new MutationObserver(() => {
  extractTableData();
  updateTotalDurations();
});
tableWatcher.observe(tableBody, { childList: true, subtree: true });

// Initial run
extractTableData();
updateTotalDurations();
