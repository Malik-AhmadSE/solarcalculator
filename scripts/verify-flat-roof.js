/**
 * Run all Flat Roof BOM calculations (same formulas as lib/flat.roof.ts) and print
 * results for comparison with your Excel sheet.
 *
 * Run from solarcalculator folder:
 *   node scripts/verify-flat-roof.js
 *
 * To also read from Excel: place "BOM calculator v2.Axxiom.xlsx" in the parent
 * folder (solar_final), then run: node read-flat-roof-sheet.js
 */

const path = require("path");

// Pack sizes for flat roof codes (from data/data.ts)
const PACK = {
  "1SSP19NZ020": 1, "1SSP19NZ023": 1, "1SSP19EW017": 1,
  "1SSP99AC084": 1, "1SSP99AC030": 1, "1SSP99AC038": 1, "1SSP99AC034": 1,
  "1SSP99AC087": 1,
  "1HME46PL001": 100, "1HME10BT019": 100,
  "1HME32SR096": 20, "1HME32SR097": 20, "1HME32SR072": 20, "1HME32SR071": 20,
  "1HME32SR086": 10, "1HME32SR085": 10,
};

function quantityFromNeeded(needed, pack) {
  if (pack <= 0) return Math.ceil(needed);
  return Math.ceil(needed / pack) * pack;
}

function flatRoof(props) {
  const rows = props.rows;
  const columns = props.columns;
  const rawOrientation = props.orientation ?? "SOUTH";
  const orientation = rawOrientation === "SOUTH" || rawOrientation === "EAST_WEST" ? rawOrientation : "SOUTH";
  const clamps = props.clamps ?? "BLACK";
  const thickness = props.thickness ?? 30;
  const triangleWidth = props.triangleWidth ?? 1500;

  const bom = [];
  function push(code, needed) {
    if (!code) return;
    const pack = PACK[code] ?? 1;
    const quantity = quantityFromNeeded(needed, pack);
    bom.push({ code, needed, pack, quantity });
  }

  if (orientation === "SOUTH") {
    const needTable = columns * rows + columns;
    const needBackplate = columns * rows;
    const needLprofile = needBackplate;
    const needKoppel = needBackplate;
    const needEindrubber = rows + 1;
    const needDruknagel = needEindrubber * 2;
    const needPlaatschroef = needTable * 6 + needBackplate * 4 + needLprofile * 4 + needKoppel * 2;
    const needEindklem = columns * 2 * 2;
    const needMiddenklem = columns * (rows - 1) * 2;
    const needInbus = needEindklem + needMiddenklem;

    const tableCode = triangleWidth === 1600 ? "1SSP19NZ023" : "1SSP19NZ020";
    push(tableCode, needTable);
    push("1SSP99AC084", needLprofile);
    push("1SSP99AC030", needKoppel);
    push("1SSP99AC038", needEindrubber);
    push("1SSP99AC034", needDruknagel);
    push("1HME46PL001", needPlaatschroef);
    push("1HME10BT019", needInbus);
    const eindklemCode = thickness > 30 ? (clamps === "BLACK" ? "1HME32SR072" : "1HME32SR071") : (clamps === "BLACK" ? "1HME32SR096" : "1HME32SR097");
    push(eindklemCode, needEindklem);
    push(clamps === "BLACK" ? "1HME32SR086" : "1HME32SR085", needMiddenklem);
    push("1SSP99AC087", needBackplate);
  } else {
    const roundedRows = Math.round(rows / 2) * 2;
    const needBackplate = roundedRows * columns - (rows % 2 === 1 ? columns : 0);
    const needLprofile = needBackplate;
    const needKoppel = needBackplate;
    const needEindrubber = columns + 1;
    const needTable = (columns + 1) * Math.floor(rows / 2);
    push("1SSP19EW017", needTable);
    push("1SSP99AC084", needLprofile);
    push("1SSP99AC030", needKoppel);
    push("1SSP99AC038", needEindrubber);
    push("1SSP99AC034", needEindrubber * 2);
    push("1HME46PL001", needTable * 9 + needLprofile * 4 + needKoppel * 2 + (rows % 2 === 0 ? needKoppel * 6 + 7 * 4 : 0));
    push("1HME10BT019", rows * 2 * 2 + rows * (columns - 1) * 2);
    const eindklemCodeEw = thickness > 30 ? (clamps === "BLACK" ? "1HME32SR072" : "1HME32SR071") : (clamps === "BLACK" ? "1HME32SR096" : "1HME32SR097");
    push(eindklemCodeEw, rows * 2 * 2);
    push("1SSP99AC087", needBackplate);
    push(clamps === "BLACK" ? "1HME32SR086" : "1HME32SR085", rows * (columns - 1) * 2);
  }
  return bom;
}

function formatTable(items) {
  const header = "Code              | Needed | Pack | Quantity";
  const sep = "-------------------|--------|------|---------";
  const rows = items.map((i) => `${i.code.padEnd(18)} | ${String(i.needed).padStart(6)} | ${String(i.pack).padStart(4)} | ${String(i.quantity).padStart(8)}`);
  return [header, sep, ...rows].join("\n");
}

const COMMON_5x7 = { rows: 5, columns: 7, width: 1134, height: 1722 };
const FLAT_CONFIGURATIONS = [
  { label: "10×7 SOUTH, BLACK, 30mm, 1500 (Excel verification)", props: { rows: 10, columns: 7, width: 1134, height: 2000, orientation: "SOUTH", clamps: "BLACK", thickness: 30, triangleWidth: 1500 } },
  { label: "5×7 SOUTH, BLACK, 30mm, 1500", props: { ...COMMON_5x7, orientation: "SOUTH", clamps: "BLACK", thickness: 30, triangleWidth: 1500 } },
  { label: "5×7 SOUTH, BLACK, 30mm, 1600", props: { ...COMMON_5x7, orientation: "SOUTH", clamps: "BLACK", thickness: 30, triangleWidth: 1600 } },
  { label: "5×7 SOUTH, ALU, 30mm, 1500", props: { ...COMMON_5x7, orientation: "SOUTH", clamps: "ALU", thickness: 30, triangleWidth: 1500 } },
  { label: "5×7 SOUTH, BLACK, 35mm, 1500", props: { ...COMMON_5x7, orientation: "SOUTH", clamps: "BLACK", thickness: 35, triangleWidth: 1500 } },
  { label: "5×7 EAST_WEST, BLACK, 30mm, 2450", props: { ...COMMON_5x7, orientation: "EAST_WEST", clamps: "BLACK", thickness: 30, triangleWidth: 2450 } },
  { label: "5×7 EAST_WEST, ALU, 30mm, 2450", props: { ...COMMON_5x7, orientation: "EAST_WEST", clamps: "ALU", thickness: 30, triangleWidth: 2450 } },
];

console.log("=== Flat Roof BOM – calculated results (same formulas as lib/flat.roof.ts)\n");
console.log("Compare these with your Excel sheet 'Flat Roof' (columns: Code, NEEDED=I, PACK=J, QUANTITY=K).\n");
console.log("Expected for 10×7 SOUTH (from docs/FLAT_ROOF_EXCEL_VERIFICATION.md):");
console.log("  1SSP19NZ020: needed=77, pack=1, quantity=77");
console.log("  1SSP99AC087: needed=70, pack=1, quantity=70");
console.log("  1HME46PL001: needed=1162, pack=100, quantity=1200");
console.log("  1HME32SR096: needed=28, pack=20, quantity=40");
console.log("  1HME32SR086: needed=126, pack=10, quantity=130");
console.log("  1HME10BT019: needed=154, pack=100, quantity=200\n");

for (const { label, props } of FLAT_CONFIGURATIONS) {
  const bom = flatRoof(props);
  console.log("--- " + label + " ---");
  console.log(formatTable(bom));
  console.log("");
}

console.log("--- End of calculated results ---");
console.log("\nTo get values from your Excel sheet, place 'BOM calculator v2.Axxiom.xlsx' in:");
console.log("  " + path.resolve(__dirname, "..", ".."));
console.log("then run:  node read-flat-roof-sheet.js");
console.log("and compare the NEEDED/QUANTITY columns with the tables above.");
