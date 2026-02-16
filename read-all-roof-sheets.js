/**
 * Read Field, Field (no Triangle), Steeldeck, Steeldeck Solarspeed, Steeldeck Triangle,
 * and Mounting Anchor sheets from BOM calculator Excel. Dump inputs and BOM table for verification.
 *
 * Run: node read-all-roof-sheets.js
 */

const XLSX = require("xlsx");
const path = require("path");
const excelPath = path.join(__dirname, "..", "BOM calculator v2.Axxiom.xlsx");

let wb;
try {
  wb = XLSX.readFile(excelPath);
} catch (e) {
  console.error("Could not read Excel file at:", excelPath);
  process.exit(1);
}

const SHEETS = [
  "Field",
  "Field (no Triangle)",
  "Steeldeck",
  "Steeldeck Solarspeed",
  "Steeldeck Triangle",
  "Mounting Anchor",
];

function dumpSheet(name) {
  const ws = wb.Sheets[name];
  if (!ws) {
    console.log("\n=== " + name + " === (not found)\n");
    return;
  }
  const ref = ws["!ref"];
  if (!ref) {
    console.log("\n=== " + name + " === (empty)\n");
    return;
  }
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  console.log("\n=== " + name + " ===\n");
  // First 20 rows, cols A–K (0–10) to see PRODUCT, NEEDED, PACKED, QUANTITY
  const maxRows = Math.min(25, rows.length);
  for (let r = 0; r < maxRows; r++) {
    const line = [];
    for (let c = 0; c <= 10; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellRef];
      const val = cell && cell.v !== undefined ? cell.v : (rows[r] && rows[r][c] !== undefined ? rows[r][c] : "");
      line.push(val === "" ? "-" : String(val).slice(0, 50));
    }
    console.log("  " + (r + 1).toString().padStart(2) + ": " + line.join(" | "));
  }
  let bomStart = -1;
  for (let r = 0; r < Math.min(20, rows.length); r++) {
    const row = rows[r] || [];
    const str = row.map((c) => String(c)).join(" ").toUpperCase();
    if (str.includes("NEEDED") || str.includes("PRODUCT")) {
      bomStart = r;
      break;
    }
  }
  if (bomStart >= 0) {
    console.log("\n  BOM from row", bomStart + 1, "- NEEDED (col I), PACKED (J), QUANTITY (K):");
    for (let r = bomStart; r < Math.min(bomStart + 18, rows.length); r++) {
      const row = rows[r] || [];
      const a = row[0];
      const i = row[8];
      const j = row[9];
      const k = row[10];
      if (a !== undefined && a !== "" && String(a).trim() !== "") {
        console.log("    ", String(a).slice(0, 60), "| I:", i, "J:", j, "K:", k);
      }
    }
  }
}

console.log("Available sheets:", wb.SheetNames);
SHEETS.forEach(dumpSheet);
