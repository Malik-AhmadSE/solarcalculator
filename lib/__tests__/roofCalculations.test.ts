/**
 * Tests for each roof BOM calculation.
 * Asserts that calculateBOM(roofType, props) returns correct needed/quantity per product code
 * using the verification matrix cases.
 */

import { describe, it, expect } from "vitest";
import { calculateBOM } from "../calculateBOM";
import { VERIFICATION_CASES } from "../verificationMatrix";

describe("roof BOM calculations", () => {
  for (const vc of VERIFICATION_CASES) {
    describe(`${vc.roofType}: ${vc.label}`, () => {
      it("returns BOM matching expected needed and quantity per code", () => {
        const actual = calculateBOM(vc.roofType, vc.props);
        const byCode = Object.fromEntries(actual.map((i) => [i.code, i]));

        for (const [code, exp] of Object.entries(vc.expectedByCode)) {
          const item = byCode[code];
          expect(item, `missing code ${code}`).toBeDefined();
          expect(item!.needed, `code ${code} needed`).toBe(exp.needed);
          if (exp.quantity != null) {
            expect(item!.quantity, `code ${code} quantity`).toBe(exp.quantity);
          }
        }
      });

      it("returns non-empty BOM with valid numbers", () => {
        const actual = calculateBOM(vc.roofType, vc.props);
        expect(actual.length).toBeGreaterThan(0);
        for (const item of actual) {
          expect(item.code).toBeTruthy();
          expect(Number.isFinite(item.needed) && item.needed >= 0).toBe(true);
          expect(Number.isFinite(item.quantity) && item.quantity >= 0).toBe(true);
          expect(item.pack).toBeGreaterThan(0);
        }
      });
    });
  }
});

describe("each roof type produces valid BOM", () => {
  const COMMON = { rows: 5, columns: 7, width: 1134, height: 1722 };

  it("Flat Roof SOUTH and EAST_WEST", () => {
    const south = calculateBOM("Flat Roof", { ...COMMON, orientation: "SOUTH", clamps: "BLACK", thickness: 30, triangleWidth: 1500 });
    const eastWest = calculateBOM("Flat Roof", { ...COMMON, orientation: "EAST_WEST", clamps: "BLACK", thickness: 30, triangleWidth: 2450 });
    expect(south.length).toBeGreaterThan(0);
    expect(eastWest.length).toBeGreaterThan(0);
    expect(eastWest.some((i) => i.code === "1SSP19EW017")).toBe(true);
  });

  it("Field LANDSCAPE and PORTRAIT", () => {
    const landscape = calculateBOM("Field", { ...COMMON, orientation: "LANDSCAPE", profilesColor: "ALU", clamps: "BLACK" });
    const portrait = calculateBOM("Field", { ...COMMON, orientation: "PORTRAIT", profilesColor: "BLACK", clamps: "ALU" });
    expect(landscape.length).toBeGreaterThan(0);
    expect(portrait.length).toBeGreaterThan(0);
  });

  it("Field (no Triangle) with schroefpaal 1000/1500 and 1500", () => {
    const mixed = calculateBOM("Field (no Triangle)", { ...COMMON, schroefpaalLength: "1000/1500", profilesColor: "ALU", clamps: "BLACK" });
    const long = calculateBOM("Field (no Triangle)", { ...COMMON, schroefpaalLength: 1500, profilesColor: "BLACK", clamps: "ALU" });
    expect(mixed.length).toBeGreaterThan(0);
    expect(long.length).toBeGreaterThan(0);
  });

  it("Steeldeck HORIZONTAL and VERTICAL", () => {
    const h = calculateBOM("Steeldeck", { ...COMMON, profilePosition: "HORIZONTAL", steelDeckType: "15cm", profilesType: "FEATHER", profilesColor: "BLACK", clamps: "BLACK", thickness: 30 });
    const v = calculateBOM("Steeldeck", { ...COMMON, profilePosition: "VERTICAL", steelDeckType: "40cm", profilesType: "HOUSE", profilesColor: "ALU", clamps: "ALU", thickness: 35 });
    expect(h.length).toBeGreaterThan(0);
    expect(v.length).toBeGreaterThan(0);
  });

  it("Steeldeck Solarspeed SOUTH and EAST_WEST", () => {
    const south = calculateBOM("Steeldeck Solarspeed", { ...COMMON, orientation: "SOUTH", triangleWidth: 1500, steelDeckType: "40cm", clamps: "BLACK", thickness: 30 });
    const eastWest = calculateBOM("Steeldeck Solarspeed", { ...COMMON, orientation: "EAST_WEST", triangleWidth: 1600, steelDeckType: "15cm", clamps: "ALU", thickness: 35 });
    expect(south.length).toBeGreaterThan(0);
    expect(eastWest.length).toBeGreaterThan(0);
    expect(eastWest.some((i) => i.code === "1SSP19EW017")).toBe(true);
    // EAST_WEST should not include backplate
    expect(eastWest.some((i) => i.code === "1SSP99AC087")).toBe(false);
  });

  it("Steeldeck Triangle", () => {
    const bom = calculateBOM("Steeldeck Triangle", { ...COMMON, profilePosition: "VERTICAL", profilesColor: "BLACK", clamps: "BLACK", thickness: 30 });
    expect(bom.length).toBeGreaterThan(0);
  });

  it("Mounting Anchor EPDM and bitumen", () => {
    const epdm = calculateBOM("Mounting Anchor", { ...COMMON, profilePosition: "VERTICAL", roofStructure: "EPDM/TPO/PVC", material: "CONCRETE", profilesColor: "BLACK", clamps: "BLACK" });
    const bitumen = calculateBOM("Mounting Anchor", { ...COMMON, profilePosition: "HORIZONTAL", roofStructure: "bitumen", material: "WOOD/STEEL", profilesColor: "ALU", clamps: "ALU" });
    expect(epdm.length).toBeGreaterThan(0);
    expect(bitumen.length).toBeGreaterThan(0);
    expect(epdm.some((i) => i.code === "1HME15AN003")).toBe(true);
    expect(bitumen.some((i) => i.code === "1HME15AN001")).toBe(true);
  });
});
