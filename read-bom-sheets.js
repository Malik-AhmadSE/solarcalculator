const XLSX = require("xlsx");
const path = require("path").join(__dirname, "..", "BOM calculator v2.Axxiom.xlsx");

const wb = XLSX.readFile(path);
console.log("=== BOM file: BOM calculator v2.Axxiom.xlsx ===\n");
console.log("Sheet names:", wb.SheetNames);
console.log("");

(wb.SheetNames || []).forEach((name) => {
  const sheets = wb.Sheets || {};
  const ws = sheets[name];
  if (!ws) {
    console.log('Sheet "' + name + '": (no data)');
    console.log("---");
    return;
  }
  const ref = ws["!ref"];
  if (!ref) {
    console.log('Sheet "' + name + '": (empty)');
    console.log("---");
    return;
  }
  const range = XLSX.utils.decode_range(ref);
  console.log(
    'Sheet "' +
      name +
      '": rows ' +
      (range.s.r + 1) +
      "-" +
      (range.e.r + 1) +
      ", cols " +
      (range.s.c + 1) +
      "-" +
      (range.e.c + 1)
  );
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  console.log("First 8 rows (preview):");
  rows.slice(0, 8).forEach((row, r) => {
    console.log("  " + (r + 1) + ": " + JSON.stringify(row));
  });
  console.log("---");
});
