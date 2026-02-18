/**
 * Run all Flat Roof BOM calculations and print results for comparison with Excel.
 * Uses the same flatRoof() from lib/flat.roof.ts.
 *
 * Run from solarcalculator folder:
 *   npx tsx scripts/verify-flat-roof.mts
 *
 * To compare with Excel: place "BOM calculator v2.Axxiom.xlsx" in the parent folder
 * (solar_final), then run: node read-flat-roof-sheet.js
 */

import path from "path";
import { fileURLToPath } from "url";
import { flatRoof } from "../lib/flat.roof";
import type { FlatRoofProps } from "../lib/flat.roof";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Configs to test (match verify-roofs FLAT_CONFIGURATIONS + Excel doc 10×7 SOUTH)
const COMMON_5x7 = { rows: 5, columns: 7, width: 1134, height: 1722 };
const FLAT_CONFIGURATIONS: { label: string; props: FlatRoofProps }[] = [
  { label: "10×7 SOUTH, BLACK, 30mm, 1500 (Excel verification)", props: { rows: 10, columns: 7, width: 1134, height: 2000, orientation: "SOUTH", clamps: "BLACK", thickness: 30, triangleWidth: 1500 } },
  { label: "5×7 SOUTH, BLACK, 30mm, 1500", props: { ...COMMON_5x7, orientation: "SOUTH", clamps: "BLACK", thickness: 30, triangleWidth: 1500 } },
  { label: "5×7 SOUTH, BLACK, 30mm, 1600", props: { ...COMMON_5x7, orientation: "SOUTH", clamps: "BLACK", thickness: 30, triangleWidth: 1600 } },
  { label: "5×7 SOUTH, ALU, 30mm, 1500", props: { ...COMMON_5x7, orientation: "SOUTH", clamps: "ALU", thickness: 30, triangleWidth: 1500 } },
  { label: "5×7 SOUTH, BLACK, 35mm, 1500", props: { ...COMMON_5x7, orientation: "SOUTH", clamps: "BLACK", thickness: 35, triangleWidth: 1500 } },
  { label: "5×7 EAST_WEST, BLACK, 30mm, 2450", props: { ...COMMON_5x7, orientation: "EAST_WEST", clamps: "BLACK", thickness: 30, triangleWidth: 2450 } },
  { label: "5×7 EAST_WEST, ALU, 30mm, 2450", props: { ...COMMON_5x7, orientation: "EAST_WEST", clamps: "ALU", thickness: 30, triangleWidth: 2450 } },
];

function formatTable(items: { code: string; needed: number; pack: number; quantity: number }[]): string {
  const header = "Code              | Needed | Pack | Quantity";
  const sep = "-------------------|--------|------|---------";
  const rows = items.map((i) => `${i.code.padEnd(18)} | ${String(i.needed).padStart(6)} | ${String(i.pack).padStart(4)} | ${String(i.quantity).padStart(8)}`);
  return [header, sep, ...rows].join("\n");
}

console.log("=== Flat Roof BOM – calculated results (lib/flat.roof.ts)\n");
console.log("Compare these with your Excel sheet 'Flat Roof' (columns: Code, NEEDED, PACK, QUANTITY).\n");
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
console.log("\nTo get values from your Excel sheet, place 'BOM calculator v2.Axxiom.xlsx' in the folder");
console.log("  " + path.resolve(projectRoot, ".."));
console.log("then run:  node read-flat-roof-sheet.js");
console.log("and compare the NEEDED/QUANTITY columns with the tables above.");
