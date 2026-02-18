/**
 * Fetch each roof sheet configuration from Excel and write a JSON summary.
 * Use this to align the UI and BOM logic with the actual Excel input cells.
 *
 * Prerequisites: npm install xlsx; place "BOM calculator v2.Axxiom.xlsx" in solarcalculator parent folder.
 * Run from solarcalculator: node scripts/fetch-roof-configs-from-excel.js
 */

const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// Script lives in solarcalculator/scripts/; Excel is in solarcalculator parent (solar_final)
const excelPath = path.join(__dirname, "..", "..", "BOM calculator v2.Axxiom.xlsx");
const outPath = path.join(__dirname, "..", "data", "roof-config-from-excel.json");

// Cell mappings per sheet (from docs/ROOF_EXCEL_VERIFICATION.md)
const SHEET_INPUTS = {
  "Slanted Roof": ["A2", "B2", "B3", "E2", "E3", "B6", "B7", "E6", "A13"],
  "Flat Roof": ["A2", "B2", "B3", "E2", "E3", "B6", "E6", "B7"],
  Field: ["A2", "B2", "B3", "E2", "E3"],
  "Field (no Triangle)": ["B2", "B3", "E2", "E3"],
  Steeldeck: ["A2", "B2", "B3", "E2", "E3", "B7", "B8", "B9", "B10", "E6"],
  "Steeldeck Solarspeed": ["A2", "B2", "B3", "E2", "E3", "B6", "B7", "B8"],
  "Steeldeck Triangle": ["A2", "B2", "B3", "E2", "E3", "B7", "B8", "B9", "E6"],
  "Mounting Anchor": ["A2", "B2", "B3", "E2", "E3", "B6", "B7", "B9", "B10"],
};

let wb;
try {
  wb = XLSX.readFile(excelPath);
} catch (e) {
  console.error("Could not read Excel at:", excelPath);
  console.error("Place 'BOM calculator v2.Axxiom.xlsx' in the project root (solar_final).");
  process.exit(1);
}

const result = {
  source: "BOM calculator v2.Axxiom.xlsx",
  fetchedAt: new Date().toISOString(),
  sheetNames: wb.SheetNames,
  roofs: {},
};

for (const [sheetName, cells] of Object.entries(SHEET_INPUTS)) {
  const ws = wb.Sheets[sheetName];
  if (!ws) {
    result.roofs[sheetName] = { error: "Sheet not found", inputCells: {} };
    continue;
  }

  const inputCells = {};
  for (const cellRef of cells) {
    const cell = ws[cellRef];
    const value = cell && cell.v !== undefined ? cell.v : null;
    inputCells[cellRef] = value;
  }

  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  const preview = rows.slice(0, 12).map((row, i) => ({ row: i + 1, cells: row }));

  result.roofs[sheetName] = {
    inputCells,
    previewRows: 12,
    preview,
  };
}

const dataDir = path.dirname(outPath);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");

console.log("Wrote roof config from Excel to:", outPath);
console.log("Sheets fetched:", Object.keys(result.roofs).join(", "));
