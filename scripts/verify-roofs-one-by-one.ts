/**
 * Verify each roof type one by one: run verification matrix and extra configs.
 * Run: npx tsx scripts/verify-roofs-one-by-one.ts
 */

import { calculateBOM } from "../lib/calculateBOM";
import { VERIFICATION_CASES } from "../lib/verificationMatrix";
import type { RoofType } from "../lib/roofTypes";
import type { CommonRoofProps } from "../lib/calculateBOM";

const COMMON = { rows: 5, columns: 7, width: 1134, height: 1722 };

function verifyCase(
  id: string,
  label: string,
  roofType: RoofType,
  props: CommonRoofProps,
  expectedByCode: Record<string, { needed: number; quantity?: number }>
): boolean {
  const actual = calculateBOM(roofType, props);
  const byCode = Object.fromEntries(actual.map((i) => [i.code, i]));
  let ok = true;
  for (const [code, exp] of Object.entries(expectedByCode)) {
    const item = byCode[code];
    const actNeed = item?.needed ?? -1;
    const actQty = item?.quantity ?? -1;
    const needOk = actNeed === exp.needed;
    const qtyOk = exp.quantity == null || actQty === exp.quantity;
    if (!needOk || !qtyOk) {
      ok = false;
      console.log(
        `    FAIL ${code}: expected needed=${exp.needed}${exp.quantity != null ? ` quantity=${exp.quantity}` : ""}, got needed=${actNeed} quantity=${actQty}`
      );
    }
  }
  // Validate BOM
  if (actual.length === 0) {
    ok = false;
    console.log("    FAIL: BOM is empty");
  }
  for (const item of actual) {
    if (!Number.isFinite(item.needed) || item.needed < 0 || !Number.isFinite(item.quantity) || item.quantity < 0 || item.pack <= 0) {
      ok = false;
      console.log(`    FAIL: invalid BOM line ${item.code} needed=${item.needed} quantity=${item.quantity} pack=${item.pack}`);
    }
  }
  return ok;
}

function testExtraConfig(roofType: RoofType, label: string, props: CommonRoofProps): boolean {
  const bom = calculateBOM(roofType, props);
  const nonEmpty = bom.length > 0;
  let valid = true;
  for (const item of bom) {
    if (!Number.isFinite(item.needed) || item.needed < 0 || !Number.isFinite(item.quantity) || item.quantity < 0 || item.pack <= 0) {
      valid = false;
      break;
    }
  }
  return nonEmpty && valid;
}

console.log("=== Roof verification one by one ===\n");

let totalPass = 0;
let totalFail = 0;

// 1. Flat Roof
console.log("1. FLAT ROOF");
const flatCases = VERIFICATION_CASES.filter((c) => c.roofType === "Flat Roof");
for (const vc of flatCases) {
  const pass = verifyCase(vc.id, vc.label, vc.roofType, vc.props, vc.expectedByCode);
  if (pass) {
    console.log(`   PASS: ${vc.label}`);
    totalPass++;
  } else {
    console.log(`   FAIL: ${vc.label}`);
    totalFail++;
  }
}
const flatExtra = testExtraConfig("Flat Roof", "3x4 SOUTH", { ...COMMON, rows: 3, columns: 4, orientation: "SOUTH", clamps: "BLACK", thickness: 30, triangleWidth: 1500 });
console.log(`   Extra 3×4 SOUTH: ${flatExtra ? "PASS" : "FAIL"}`);
if (flatExtra) totalPass++; else totalFail++;
console.log("");

// 2. Slanted Roof
console.log("2. SLANTED ROOF");
const slantedCases = VERIFICATION_CASES.filter((c) => c.roofType === "Slanted Roof");
for (const vc of slantedCases) {
  const pass = verifyCase(vc.id, vc.label, vc.roofType, vc.props, vc.expectedByCode);
  if (pass) {
    console.log(`   PASS: ${vc.label}`);
    totalPass++;
  } else {
    console.log(`   FAIL: ${vc.label}`);
    totalFail++;
  }
}
const slantedExtra = testExtraConfig("Slanted Roof", "5×7 LANDSCAPE HORIZONTAL", {
  ...COMMON,
  panelOrientation: "landscape",
  profilePosition: "HORIZONTAL",
  roofing: "TILED",
  roofHook: "NORMAL",
  profileType: "FEATHER",
  profileColor: "BLACK",
  clamps: "BLACK",
  Thickness: 30,
});
console.log(`   Extra 5×7 LANDSCAPE HORIZONTAL: ${slantedExtra ? "PASS" : "FAIL"}`);
if (slantedExtra) totalPass++; else totalFail++;
console.log("");

// 3. Field
console.log("3. FIELD");
const fieldCases = VERIFICATION_CASES.filter((c) => c.roofType === "Field");
for (const vc of fieldCases) {
  const pass = verifyCase(vc.id, vc.label, vc.roofType, vc.props, vc.expectedByCode);
  if (pass) {
    console.log(`   PASS: ${vc.label}`);
    totalPass++;
  } else {
    console.log(`   FAIL: ${vc.label}`);
    totalFail++;
  }
}
const fieldExtra = testExtraConfig("Field", "5×7 PORTRAIT", { ...COMMON, orientation: "PORTRAIT", profilesColor: "ALU", clamps: "BLACK" });
console.log(`   Extra 5×7 PORTRAIT: ${fieldExtra ? "PASS" : "FAIL"}`);
if (fieldExtra) totalPass++; else totalFail++;
console.log("");

// 4. Field (no Triangle)
console.log("4. FIELD (no Triangle)");
const fieldNoTriCases = VERIFICATION_CASES.filter((c) => c.roofType === "Field (no Triangle)");
for (const vc of fieldNoTriCases) {
  const pass = verifyCase(vc.id, vc.label, vc.roofType, vc.props, vc.expectedByCode);
  if (pass) {
    console.log(`   PASS: ${vc.label}`);
    totalPass++;
  } else {
    console.log(`   FAIL: ${vc.label}`);
    totalFail++;
  }
}
const fieldNoTriExtra = testExtraConfig("Field (no Triangle)", "6×4 1500", { ...COMMON, rows: 6, columns: 4, schroefpaalLength: 1500, profilesColor: "BLACK", clamps: "ALU" });
console.log(`   Extra 6×4 schroefpaal 1500: ${fieldNoTriExtra ? "PASS" : "FAIL"}`);
if (fieldNoTriExtra) totalPass++; else totalFail++;
console.log("");

// 5. Steeldeck
console.log("5. STEELDECK");
const steeldeckCases = VERIFICATION_CASES.filter((c) => c.roofType === "Steeldeck");
for (const vc of steeldeckCases) {
  const pass = verifyCase(vc.id, vc.label, vc.roofType, vc.props, vc.expectedByCode);
  if (pass) {
    console.log(`   PASS: ${vc.label}`);
    totalPass++;
  } else {
    console.log(`   FAIL: ${vc.label}`);
    totalFail++;
  }
}
const steeldeckExtra = testExtraConfig("Steeldeck", "5×7 VERTICAL", {
  ...COMMON,
  profilePosition: "VERTICAL",
  steelDeckType: "40cm",
  profilesType: "HOUSE",
  profilesColor: "ALU",
  clamps: "ALU",
  thickness: 35,
});
console.log(`   Extra 5×7 VERTICAL 40cm: ${steeldeckExtra ? "PASS" : "FAIL"}`);
if (steeldeckExtra) totalPass++; else totalFail++;
console.log("");

// 6. Steeldeck Solarspeed
console.log("6. STEELDECK SOLARSPEED");
const sdSpeedCases = VERIFICATION_CASES.filter((c) => c.roofType === "Steeldeck Solarspeed");
for (const vc of sdSpeedCases) {
  const pass = verifyCase(vc.id, vc.label, vc.roofType, vc.props, vc.expectedByCode);
  if (pass) {
    console.log(`   PASS: ${vc.label}`);
    totalPass++;
  } else {
    console.log(`   FAIL: ${vc.label}`);
    totalFail++;
  }
}
const sdSpeedExtra = testExtraConfig("Steeldeck Solarspeed", "4×6 EAST_WEST", {
  ...COMMON,
  rows: 4,
  columns: 6,
  orientation: "EAST_WEST",
  triangleWidth: 1600,
  steelDeckType: "15cm",
  clamps: "ALU",
  thickness: 30,
});
console.log(`   Extra 4×6 EAST_WEST: ${sdSpeedExtra ? "PASS" : "FAIL"}`);
if (sdSpeedExtra) totalPass++; else totalFail++;
console.log("");

// 7. Steeldeck Triangle
console.log("7. STEELDECK TRIANGLE");
const sdTriCases = VERIFICATION_CASES.filter((c) => c.roofType === "Steeldeck Triangle");
for (const vc of sdTriCases) {
  const pass = verifyCase(vc.id, vc.label, vc.roofType, vc.props, vc.expectedByCode);
  if (pass) {
    console.log(`   PASS: ${vc.label}`);
    totalPass++;
  } else {
    console.log(`   FAIL: ${vc.label}`);
    totalFail++;
  }
}
const sdTriExtra = testExtraConfig("Steeldeck Triangle", "5×7 HORIZONTAL", {
  ...COMMON,
  profilePosition: "HORIZONTAL",
  profilesColor: "ALU",
  clamps: "BLACK",
  thickness: 35,
});
console.log(`   Extra 5×7 HORIZONTAL: ${sdTriExtra ? "PASS" : "FAIL"}`);
if (sdTriExtra) totalPass++; else totalFail++;
console.log("");

// 8. Mounting Anchor
console.log("8. MOUNTING ANCHOR");
const anchorCases = VERIFICATION_CASES.filter((c) => c.roofType === "Mounting Anchor");
for (const vc of anchorCases) {
  const pass = verifyCase(vc.id, vc.label, vc.roofType, vc.props, vc.expectedByCode);
  if (pass) {
    console.log(`   PASS: ${vc.label}`);
    totalPass++;
  } else {
    console.log(`   FAIL: ${vc.label}`);
    totalFail++;
  }
}
const anchorExtra = testExtraConfig("Mounting Anchor", "5×7 bitumen WOOD", {
  ...COMMON,
  profilePosition: "HORIZONTAL",
  roofStructure: "bitumen",
  material: "WOOD/STEEL",
  profilesColor: "ALU",
  clamps: "ALU",
});
console.log(`   Extra 5×7 bitumen WOOD/STEEL: ${anchorExtra ? "PASS" : "FAIL"}`);
if (anchorExtra) totalPass++; else totalFail++;
console.log("");

console.log("=== Summary ===");
console.log(`Total passed: ${totalPass}`);
console.log(`Total failed: ${totalFail}`);
console.log(totalFail === 0 ? "\nAll roof verifications passed." : `\n${totalFail} verification(s) failed.`);
process.exit(totalFail > 0 ? 1 : 0);
