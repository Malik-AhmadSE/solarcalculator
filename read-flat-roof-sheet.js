/**
 * Read the "Flat Roof" sheet from BOM calculator Excel and print structure + values
 * for verification against lib/flat.roof.ts.
 *
 * Place "BOM calculator v2.Axxiom.xlsx" in the parent folder (solar_final), then run:
 *   node read-flat-roof-sheet.js
 */

const XLSX = require("xlsx");
const path = require("path");
const excelPath = path.join(__dirname, "..", "BOM calculator v2.Axxiom.xlsx");

let wb;
try {
  wb = XLSX.readFile(excelPath);
} catch (e) {
  console.error("Could not read Excel file at:", excelPath);
  console.error("Place 'BOM calculator v2.Axxiom.xlsx' in the solarcalculator parent folder.");
  process.exit(1);
}

const sheetName = "Flat Roof";
const ws = wb.Sheets[sheetName];
if (!ws) {
  console.error("Sheet not found:", sheetName);
  console.error("Available sheets:", wb.SheetNames);
  process.exit(1);
}

const ref = ws["!ref"];
if (!ref) {
  console.error("Sheet is empty");
  process.exit(1);
}

const range = XLSX.utils.decode_range(ref);
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

console.log("=== Flat Roof sheet ===\n");
console.log("Range: rows", range.s.r + 1, "-", range.e.r + 1, ", cols", range.s.c + 1, "-", range.e.c + 1);
console.log("");

// Print all rows so we can see inputs (e.g. B2, B3, E2, E3) and BOM table (code, needed, pack, quantity)
console.log("Full grid (first 30 rows, cols A–N):");
const maxRows = Math.min(30, rows.length);
const maxCol = 13; // A=0 .. N=13
for (let r = 0; r < maxRows; r++) {
  const row = rows[r] || [];
  const cells = [];
  for (let c = 0; c <= maxCol; c++) {
    const cellRef = XLSX.utils.encode_cell({ r, c });
    const cell = ws[cellRef];
    const val = cell ? (cell.v !== undefined ? cell.v : "") : (row[c] !== undefined ? row[c] : "");
    const f = cell && cell.f ? " [" + cell.f + "]" : "";
    cells.push((val !== "" ? val : "-") + f);
  }
  console.log("  " + (r + 1).toString().padStart(2) + ": " + cells.join(" | "));
}

console.log("\n--- Cell references (inputs and BOM table) ---");
// Common input patterns: B2=rows, B3=columns, E2=height, E3=width, orientation somewhere
const importantCells = ["B2", "B3", "E2", "E3", "A2", "A3", "K9", "K10"];
importantCells.forEach((ref) => {
  const cell = ws[ref];
  if (cell) console.log("  " + ref + ":", "value =", cell.v, cell.f ? "formula = " + cell.f : "");
});

// Find row where BOM table starts (e.g. header "Code" or "Product")
let bomStartRow = -1;
for (let r = 0; r < Math.min(25, rows.length); r++) {
  const row = rows[r] || [];
  const rowStr = row.map((c) => String(c)).join(" ").toUpperCase();
  if (rowStr.includes("CODE") || rowStr.includes("NEEDED") || rowStr.includes("QUANTITY") || rowStr.includes("PRODUCT")) {
    bomStartRow = r;
    break;
  }
}
if (bomStartRow >= 0) {
  console.log("\nBOM table likely starts at row", bomStartRow + 1);
  console.log("Header row:", rows[bomStartRow]);
  for (let r = bomStartRow; r < Math.min(bomStartRow + 15, rows.length); r++) {
    console.log("  Row", r + 1, ":", rows[r]);
  }
}
