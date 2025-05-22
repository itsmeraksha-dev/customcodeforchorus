function replaceInputWithDropdown(inputElement, fieldName) {
  if (!inputElement || inputElement.hasAttribute("list")) return;

  const dataListId = `datalist-${fieldName}`;
  inputElement.setAttribute("list", dataListId);

  // Clear input on focus to show all options
  inputElement.addEventListener("focus", function () {
    this.value = "";
  });

  // Avoid duplicate datalists
  if (!document.getElementById(dataListId)) {
    const dataList = document.createElement("datalist");
    dataList.id = dataListId;

    // Generate 30-minute intervals
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

// Observe document for dynamically inserted fields
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
