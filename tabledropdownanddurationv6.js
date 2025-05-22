function replaceInputWithDropdown(inputElement, fieldName) {
  if (!inputElement || inputElement.hasAttribute("list")) return;

  const dataListId = `datalist-${fieldName}`;
  inputElement.setAttribute("list", dataListId);

  inputElement.addEventListener("focus", function () {
    this.value = "";
  });

  inputElement.addEventListener("change", () => {
    updateDurationForRow(inputElement);
  });

  if (!document.getElementById(dataListId)) {
    const dataList = document.createElement("datalist");
    dataList.id = dataListId;

    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const hh = hour.toString().padStart(2, "0");
        const mm = minute.toString().padStart(2, "0");
        const time = `${hh}:${mm}`;
        const option = document.createElement("option");
        option.value = time;
        dataList.appendChild(option);
      }
    }

    document.body.appendChild(dataList);
  }
}

function toMinutes(t) {
  if (!t || !t.includes(":")) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function calculateDuration(start, breakStart, breakEnd, end) {
  const startMin = toMinutes(start);
  const breakStartMin = toMinutes(breakStart);
  const breakEndMin = toMinutes(breakEnd);
  const endMin = toMinutes(end);

  if ([startMin, breakStartMin, breakEndMin, endMin].some(val => val === null)) {
    return "";
  }

  const workDuration = endMin - startMin;
  const breakDuration = breakEndMin - breakStartMin;
  const netDuration = workDuration - breakDuration;

  if (netDuration < 0 || isNaN(netDuration)) return "Invalid";

  const hrs = Math.floor(netDuration / 60);
  const mins = netDuration % 60;
  return `${hrs}h ${mins}m`;
}

// ✅ Now reading from cell text instead of input
function updateDurationForRow(cellElement) {
  const row = cellElement.closest(".p-datatable-row");
  if (!row) return;

  const cells = row.querySelectorAll("td");
  const getText = (index) => cells[index]?.querySelector("div")?.textContent.trim() || "";

  const start = getText(1);
  const breakStart = getText(2);
  const breakEnd = getText(3);
  const end = getText(4);

  const duration = calculateDuration(start, breakStart, breakEnd, end);

  const durationDiv = cells[5]?.querySelector("div");
  if (durationDiv) {
    durationDiv.textContent = duration;
  }
}

// 🧿 Mutation observer: still attaches dropdown if inputs appear
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) {
        const inputElement = node.querySelector("input.p-inputtext.p-component");
        if (inputElement) {
          const parentDiv = inputElement.closest(".p-d-flex.p-flex-between");
          if (parentDiv) {
            const fieldLabel = parentDiv.querySelector(".rowValue")?.textContent.trim();
            if (["startTime", "breakStart", "breakEnd", "endTime"].includes(fieldLabel)) {
              replaceInputWithDropdown(inputElement, fieldLabel);
            }
          }
        }
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });
