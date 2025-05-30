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

function extractTableData() {
  const tableBody = document.querySelector('.p-datatable-tbody');
  if (!tableBody) return;

  const rows = tableBody.querySelectorAll('tr');
  const data = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td div');
    if (cells.length >= 7) {
      const dateText = cells[1]?.textContent.trim(); // Adjusted index
      if (!dateText) return;

      const parsedDate = new Date(dateText);
      if (isNaN(parsedDate)) return;

      const formattedDate = parsedDate.toISOString().split('T')[0];

      const startTime = cells[2]?.textContent.trim();
      const breakStart = cells[3]?.textContent.trim();
      const breakEnd = cells[4]?.textContent.trim();
      const endTime = cells[5]?.textContent.trim();
      const totalDuration = cells[6]?.textContent.trim();

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
  console.log("Extracted Table JSON:", jsonString);
  UXBClientAPI.setDataSourceValues({ tableString: jsonString });
}

function updateTotalDurations() {
  const tableBody = document.querySelector('.p-datatable-tbody');
  if (!tableBody) return;

  const rows = tableBody.querySelectorAll("tr");

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

function initTableWatcher() {
  const tableBody = document.querySelector('.p-datatable-tbody');
  if (!tableBody) return;

  const observer = new MutationObserver(() => {
    extractTableData();
    updateTotalDurations();
  });

  observer.observe(tableBody, { childList: true, subtree: true });

  // Initial run
  extractTableData();
  updat
