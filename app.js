const starterLifts = [
  { lift: "R53", type: "Clamp", ownership: "Rental", brand: "Raymond", model: "750-R45TT", serial: "750-25-BC0106407" },
  { lift: "R50", type: "Reach", ownership: "Rental", brand: "Crown", model: "", serial: "2554" },
  { lift: "R51", type: "Reach", ownership: "Rental", brand: "Crown", model: "", serial: "4815" },
  { lift: "R52", type: "Reach", ownership: "Rental", brand: "Raymond", model: "", serial: "" },
  { lift: "R53", type: "Reach", ownership: "Rental", brand: "Crown", model: "", serial: "1489" },
  { lift: "R54", type: "Reach", ownership: "Rental", brand: "Crown", model: "", serial: "10806942" },
  { lift: "R55", type: "Reach", ownership: "Rental", brand: "Crown", model: "", serial: "1559" },
  { lift: "R55", type: "Reach", ownership: "Rental", brand: "Raymond", model: "750-R45TT", serial: "750-18-BC07995" },
  { lift: "DC30", type: "Clamp", ownership: "Owned", brand: "Toyota", model: "8FBCU25", serial: "75035" },
  { lift: "DC15", type: "EPJ Long", ownership: "Owned", brand: "Toyota", model: "8HBE40", serial: "40561" },
  { lift: "DC17", type: "EPJ Long", ownership: "Owned", brand: "Toyota", model: "8410", serial: "841-13-12842" },
  { lift: "DC29", type: "EPJ Short", ownership: "Owned", brand: "Toyota", model: "8410", serial: "844-18-45560" },
  { lift: "DC14", type: "EPJ Short", ownership: "Owned", brand: "Raymond", model: "8410", serial: "841-21-60393" },
  { lift: "DC10", type: "Forklift", ownership: "Owned", brand: "Noble", model: "FE4P50N-189", serial: "122072386-IN" },
  { lift: "DC9", type: "Forklift", ownership: "Owned", brand: "Noble", model: "FE4P50N-189", serial: "223084417-IN" },
  { lift: "DC11", type: "Forklift", ownership: "Owned", brand: "Noble", model: "FE4P50N-189", serial: "223084416-IN" },
  { lift: "DC26", type: "Reach", ownership: "Owned", brand: "Toyota", model: "750-R45TT", serial: "750-15-AC51180" },
  { lift: "DC2", type: "Reach", ownership: "Owned", brand: "Unicarrier", model: "SMIH245NV", serial: "SMIH2-9Y1335" },
  { lift: "DC21", type: "Reach", ownership: "Owned", brand: "Toyota", model: "750-R45TT", serial: "750-15-AC50887" },
  { lift: "DC?", type: "Reach", ownership: "Owned", brand: "Raymond", model: "750-R45TT", serial: "750-25-BC0106407" },
  { lift: "DC8", type: "Reach", ownership: "Owned", brand: "Noble", model: "RT35PRO-374", serial: "35230900015" },
  { lift: "DC23", type: "Reach", ownership: "Owned", brand: "Noble", model: "RT35PRO-374", serial: "35230900014" },
  { lift: "DC20", type: "Reach", ownership: "Owned", brand: "Crown", model: "RR5725-45", serial: "1A578300" },
  { lift: "DC27", type: "Scrubber", ownership: "Owned", brand: "", model: "", serial: "" },
  { lift: "N/A", type: "Stock Chaser", ownership: "Owned", brand: "", model: "", serial: "" }
];

let lifts = JSON.parse(localStorage.getItem("liftInventoryData")) || starterLifts;
let editingIndex = null;

const form = document.getElementById("liftForm");
const tableBody = document.getElementById("liftTableBody");
const searchInput = document.getElementById("searchInput");
const resetBtn = document.getElementById("resetBtn");

function saveData() {
  localStorage.setItem("liftInventoryData", JSON.stringify(lifts));
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sortLiftsByOwnership() {
  const order = { Owned: 1, Rental: 2 };

  lifts.sort((a, b) => {
    const ownershipA = order[a.ownership] || 99;
    const ownershipB = order[b.ownership] || 99;

    if (ownershipA !== ownershipB) return ownershipA - ownershipB;

    return cleanText(a.lift).localeCompare(cleanText(b.lift), undefined, {
      numeric: true,
      sensitivity: "base"
    });
  });
}

function getVisibleLifts() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  return lifts
    .map((item, originalIndex) => ({ ...item, originalIndex }))
    .filter(item => Object.values(item).join(" ").toLowerCase().includes(searchTerm));
}

function inputCell(index, field, value, type = "text") {
  return `<input class="edit-input" id="edit-${field}-${index}" type="${type}" value="${escapeHtml(value)}" />`;
}

function ownershipCell(index, value) {
  return `
    <select class="edit-input" id="edit-ownership-${index}">
      <option value="Owned" ${value === "Owned" ? "selected" : ""}>Owned</option>
      <option value="Rental" ${value === "Rental" ? "selected" : ""}>Rental</option>
    </select>
  `;
}

function renderTable() {
  sortLiftsByOwnership();
  saveData();

  const visibleLifts = getVisibleLifts();
  tableBody.innerHTML = "";

  if (visibleLifts.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="empty">No lifts found.</td></tr>`;
    updateStats();
    return;
  }

  visibleLifts.forEach(item => {
    const index = item.originalIndex;
    const row = document.createElement("tr");
    row.className = item.ownership === "Rental" ? "rental-row" : "owned-row";

    if (editingIndex === index) {
      row.innerHTML = `
        <td>${inputCell(index, "lift", item.lift)}</td>
        <td>${inputCell(index, "type", item.type)}</td>
        <td>${ownershipCell(index, item.ownership)}</td>
        <td>${inputCell(index, "brand", item.brand)}</td>
        <td>${inputCell(index, "model", item.model)}</td>
        <td>${inputCell(index, "serial", item.serial)}</td>
        <td class="action-cell">
          <button class="save-btn" onclick="saveLiftEdit(${index})">Save</button>
          <button class="cancel-btn" onclick="cancelEdit()">Cancel</button>
        </td>
      `;
    } else {
      row.innerHTML = `
        <td>${escapeHtml(item.lift)}</td>
        <td>${escapeHtml(item.type)}</td>
        <td>${escapeHtml(item.ownership)}</td>
        <td>${escapeHtml(item.brand)}</td>
        <td>${escapeHtml(item.model)}</td>
        <td>${escapeHtml(item.serial)}</td>
        <td class="action-cell">
          <button class="edit-btn" onclick="editLift(${index})">Edit</button>
          <button class="delete-btn" onclick="deleteLift(${index})">Delete</button>
        </td>
      `;
    }

    tableBody.appendChild(row);
  });

  updateStats();
}

function updateStats() {
  document.getElementById("totalCount").textContent = lifts.length;
  document.getElementById("ownedCount").textContent = lifts.filter(x => x.ownership === "Owned").length;
  document.getElementById("rentalCount").textContent = lifts.filter(x => x.ownership === "Rental").length;
}

function editLift(index) {
  editingIndex = index;
  renderTable();
}

function cancelEdit() {
  editingIndex = null;
  renderTable();
}

function saveLiftEdit(index) {
  const updatedLift = {
    lift: cleanText(document.getElementById(`edit-lift-${index}`).value),
    type: cleanText(document.getElementById(`edit-type-${index}`).value),
    ownership: document.getElementById(`edit-ownership-${index}`).value,
    brand: cleanText(document.getElementById(`edit-brand-${index}`).value),
    model: cleanText(document.getElementById(`edit-model-${index}`).value),
    serial: cleanText(document.getElementById(`edit-serial-${index}`).value)
  };

  if (!updatedLift.lift || !updatedLift.type) {
    alert("Lift and Type are required.");
    return;
  }

  lifts[index] = updatedLift;
  editingIndex = null;
  saveData();
  renderTable();
}

function deleteLift(index) {
  if (!confirm("Delete this lift?")) return;
  lifts.splice(index, 1);
  editingIndex = null;
  saveData();
  renderTable();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const newLift = {
    lift: cleanText(document.getElementById("lift").value),
    type: cleanText(document.getElementById("type").value),
    ownership: document.getElementById("ownership").value,
    brand: cleanText(document.getElementById("brand").value),
    model: cleanText(document.getElementById("model").value),
    serial: cleanText(document.getElementById("serial").value)
  };

  lifts.push(newLift);
  editingIndex = null;
  saveData();
  form.reset();
  renderTable();
});

searchInput.addEventListener("input", () => {
  editingIndex = null;
  renderTable();
});

document.getElementById("exportBtn").addEventListener("click", () => {
  sortLiftsByOwnership();
  const headers = ["Lift", "Type", "Owned/Rental", "Brand", "Model", "Serial"];
  const rows = lifts.map(item => [item.lift, item.type, item.ownership, item.brand, item.model, item.serial]);

  const csv = [headers, ...rows]
    .map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "lift-inventory.csv";
  link.click();

  URL.revokeObjectURL(url);
});

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    if (!confirm("Reset the lift list back to the starter data? This removes local edits.")) return;
    lifts = [...starterLifts];
    editingIndex = null;
    saveData();
    renderTable();
  });
}

renderTable();
