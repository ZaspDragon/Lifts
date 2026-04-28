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

const form = document.getElementById("liftForm");
const tableBody = document.getElementById("liftTableBody");
const searchInput = document.getElementById("searchInput");

function saveData() {
  localStorage.setItem("liftInventoryData", JSON.stringify(lifts));
}

function renderTable() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  const filtered = lifts.filter(item =>
    Object.values(item).join(" ").toLowerCase().includes(searchTerm)
  );

  tableBody.innerHTML = "";

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="empty">No lifts found.</td></tr>`;
  }

  filtered.forEach((item, index) => {
    const row = document.createElement("tr");
    row.className = item.ownership === "Rental" ? "rental-row" : "owned-row";

    row.innerHTML = `
      <td>${item.lift}</td>
      <td>${item.type}</td>
      <td>${item.ownership}</td>
      <td>${item.brand}</td>
      <td>${item.model}</td>
      <td>${item.serial}</td>
      <td><button class="delete-btn" onclick="deleteLift(${index})">Delete</button></td>
    `;

    tableBody.appendChild(row);
  });

  updateStats();
}

function updateStats() {
  document.getElementById("totalCount").textContent = lifts.length;
  document.getElementById("ownedCount").textContent = lifts.filter(x => x.ownership === "Owned").length;
  document.getElementById("rentalCount").textContent = lifts.filter(x => x.ownership === "Rental").length;
}

function deleteLift(index) {
  if (!confirm("Delete this lift?")) return;
  lifts.splice(index, 1);
  saveData();
  renderTable();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const newLift = {
    lift: document.getElementById("lift").value.trim(),
    type: document.getElementById("type").value.trim(),
    ownership: document.getElementById("ownership").value,
    brand: document.getElementById("brand").value.trim(),
    model: document.getElementById("model").value.trim(),
    serial: document.getElementById("serial").value.trim()
  };

  lifts.push(newLift);
  saveData();
  form.reset();
  renderTable();
});

searchInput.addEventListener("input", renderTable);

document.getElementById("exportBtn").addEventListener("click", () => {
  const headers = ["Lift", "Type", "Owned/Rental", "Brand", "Model", "Serial"];
  const rows = lifts.map(item => [item.lift, item.type, item.ownership, item.brand, item.model, item.serial]);

  const csv = [headers, ...rows]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "lift-inventory.csv";
  link.click();

  URL.revokeObjectURL(url);
});

renderTable();
