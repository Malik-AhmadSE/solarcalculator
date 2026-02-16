const XLSX = require("xlsx");
const path = require("path").join(__dirname, "..", "BOM calculator v2.Axxiom.xlsx");

// Read with formulas
const wb = XLSX.readFile(path, { cellFormula: true, cellStyles: false });
const ws = wb.Sheets["Slanted Roof"];
if (!ws) {
  console.log("Slanted Roof sheet not found");
  process.exit(1);
}

// Get all cell refs
const ref = ws["!ref"];
const range = XLSX.utils.decode_range(ref);
const formulaCells = [];
for (let R = range.s.r; R <= range.e.r; ++R) {
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const addr = XLSX.utils.encode_cell({ r: R, c: C });
    const cell = ws[addr];
    if (cell && cell.f) {
      formulaCells.push({
        addr,
        row: R + 1,
        col: C + 1,
        formula: cell.f,
        value: cell.v
      });
    }
  }
}

console.log("=== Slanted Roof sheet: FORMULAS (all cells with .f) ===\n");
console.log("Total formula cells:", formulaCells.length);
console.log("");

// Group by row for readability
const byRow = {};
formulaCells.forEach((c) => {
  byRow[c.row] = byRow[c.row] || [];
  byRow[c.row].push(c);
});

Object.keys(byRow)
  .sort((a, b) => Number(a) - Number(b))
  .forEach((row) => {
    console.log("--- Row " + row + " ---");
    byRow[row].forEach((c) => {
      console.log("  " + c.addr + "  value=" + c.value + "  formula=" + c.formula);
    });
  });

// Also dump first 25 rows x first 30 cols as grid (values) to see labels
console.log("\n\n=== Slanted Roof: First 20 rows x 25 cols (values) ===\n");
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
rows.slice(0, 20).forEach((row, r) => {
  const slice = (row || []).slice(0, 25);
  console.log("R" + (r + 1) + ": " + JSON.stringify(slice));
});
