// Add dropdowns and listen for changes
function replaceInputWithDropdown(inputElement, fieldName) {
  if (!inputElement || inputElement.hasAttribute("list")) return;

  const dataListId = `datalist-${fieldName}`;
  inputElement.setAttribute("list", dataListId);

  inputElement.addEventListener("focus", function () {
    this.value = "";
  });

  inputElement.addEventListener("change", () => {
    liveUpdateDurationIfAllFilled(inputElement);
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

// Convert time string to minutes
function toMinutes(t) {
  if (!t || !t.includes(":")) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Calculate net work duration
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

  const hrs = Math.floor(netDuration / 60).toString().padStart(2, "0");
  const mins = (netDuration % 60).toString().padStart(2, "0");

  return `${hrs}:${mins}`; // HH:MM format
}

// Live update per row (on change)
function liveUpdateDurationIfAllFilled(inputElement) {
  const rowContainer = inputElement.closest(".p-datatable-row") || inputElement.closest(".row-editor-container");
  if (!rowContainer) return;

  const getFieldInputValue = (label) => {
    const cell = [...rowContainer.querySelectorAll(".p-d-flex.p-flex-between")].find(div =>
      div.querySelector(".rowValue")?.textContent.trim() === label
    );
    return cell?.querySelector("input")?.value || "";
  };

  const start = getFieldInputValue("startTime");
  const breakStart = getFieldInputValue("breakStart");
  const breakEnd = getFieldInputValue("breakEnd");
  const end = getFieldInputValue("endTime");

  if (start && breakStart && breakEnd && end) {
    const duration = calculateDuration(start, breakStart, breakEnd, end);
    const totalDurationCell = [...rowContainer.querySelectorAll(".p-d-flex.p-flex-between")].find(div =>
      div.querySelector(".rowValue")?.textContent.trim() === "totalDuration"
    );
    if (totalDurationCell) {
      const input = totalDurationCell.querySelector("input");
      if (input) {
        input.value = duration;
        input.readOnly = true;
        input.style.backgroundColor = "#f0f0f0";
      }
    }
  }
}

// Bulk update when button is clicked
function onUpdateAllDurations(formData, updateFormData) {
  const rows = formData?.TimesheetTable || [];

  const updatedRows = rows.map(row => {
    const duration = calculateDuration(
      row.startTime,
      row.breakStart,
      row.breakEnd,
      row.endTime
    );
    return {
      ...row,
      totalDuration: duration || ""
    };
  });

  updateFormData({
    TimesheetTable: updatedRows
  });
}

// Attach dropdowns and mark totalDuration as read-only
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
            } else if (fieldLabel === "totalDuration") {
              inputElement.readOnly = true;
              inputElement.style.backgroundColor = "#f0f0f0";
            }
          }
        }
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });
