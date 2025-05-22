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

function updateDurationForRow(inputElement) {
  const rowContainer = inputElement.closest(".p-datatable-row");
  if (!rowContainer) return;

  const inputs = rowContainer.querySelectorAll("input.p-inputtext");

  const start = inputs[0]?.value || "";
  const breakStart = inputs[1]?.value || "";
  const breakEnd = inputs[2]?.value || "";
  const end = inputs[3]?.value || "";

  const duration = calculateDuration(start, breakStart, breakEnd, end);

  const totalDurationInput = inputs[4];
  if (totalDurationInput) {
    totalDurationInput.value = duration;
  }
}

// Observe for table fields dynamically inserted into the DOM
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
