/**
 * Roof configuration schema aligned with Excel "BOM calculator v2.Axxiom.xlsx" sheets.
 * Used to normalize shared UI state per roof type so wrong enum values from another
 * roof (e.g. orientation SOUTH from Flat when viewing Field) don't produce incorrect BOM.
 *
 * Excel mapping: docs/ROOF_EXCEL_VERIFICATION.md
 */

import type { RoofType } from "./roofTypes";

/** Input cell → label (from Excel verification doc). */
export type ExcelInputCell = string;

export interface RoofSheetConfig {
    /** Excel sheet name. */
    sheetName: string;
    /** Main input cells and their meaning (e.g. A2=orientation, B2=rows). */
    inputCells: Record<ExcelInputCell, string>;
    /** Valid options for fields that are enums (e.g. orientation). */
    enums?: Record<string, readonly string[]>;
}

/**
 * Per-roof configuration aligned with Excel.
 * Enums define the only valid values for that roof; buildProps should coerce shared state to these.
 */
export const ROOF_CONFIG_FROM_EXCEL: Record<RoofType, RoofSheetConfig> = {
    "Slanted Roof": {
        sheetName: "Slanted Roof",
        inputCells: { A2: "orientation", B2: "rows", B3: "columns", E2: "height", E3: "width", A13: "layout", B6: "profile", B7: "clamps", E6: "thickness" },
        enums: {
            panelOrientation: ["landscape", "portrait"],
            profilePosition: ["HORIZONTAL", "VERTICAL"],
            roofing: ["TILED", "SLATES", "ZINC"],
            roofHook: ["NORMAL", "HYBRID", "ROUND"],
            profileType: ["FEATHER", "HOUSE"],
            profileColor: ["ALU", "BLACK"],
            clamps: ["ALU", "BLACK"],
        },
    },
    "Flat Roof": {
        sheetName: "Flat Roof",
        inputCells: { A2: "orientation", B2: "rows", B3: "columns", E2: "height", E3: "width", B6: "triangle/steekafstand", E6: "thickness", B7: "clamps" },
        enums: {
            orientation: ["SOUTH", "EAST_WEST"],
            clamps: ["BLACK", "ALU"],
            triangleWidth: ["1500", "1600", "2450"],
        },
    },
    Field: {
        sheetName: "Field",
        inputCells: { A2: "orientation", B2: "rows", B3: "columns", E2: "height", E3: "width", profiles: "profiles color", clamps: "clamps" },
        enums: {
            orientation: ["LANDSCAPE", "PORTRAIT"],
            profilesColor: ["ALU", "BLACK"],
            clamps: ["ALU", "BLACK"],
        },
    },
    "Field (no Triangle)": {
        sheetName: "Field (no Triangle)",
        inputCells: { B2: "rows", B3: "columns", E2: "height", E3: "width", schroefpaal: "schroefpaal length", profiles: "profiles color", clamps: "clamps" },
        enums: {
            schroefpaalLength: ["1000", "1500", "1000/1500"],
            profilesColor: ["ALU", "BLACK"],
            clamps: ["ALU", "BLACK"],
        },
    },
    Steeldeck: {
        sheetName: "Steeldeck",
        inputCells: { A2: "orientation", B2: "rows", B3: "columns", E2: "height", E3: "width", B7: "steel deck type", B8: "profiles type", B9: "profiles color", B10: "clamps", E6: "thickness" },
        enums: {
            profilePosition: ["HORIZONTAL", "VERTICAL"],
            steelDeckType: ["15cm", "40cm", "Connecting"],
            profilesType: ["FEATHER", "HOUSE"],
            profilesColor: ["ALU", "BLACK"],
            clamps: ["ALU", "BLACK"],
        },
    },
    "Steeldeck Solarspeed": {
        sheetName: "Steeldeck Solarspeed",
        inputCells: { A2: "orientation", B2: "rows", B3: "columns", E2: "height", E3: "width", B6: "triangle", B7: "40cm plate", B8: "clamps" },
        enums: {
            orientation: ["SOUTH", "EAST_WEST"],
            triangleWidth: ["1500", "1600"],
            steelDeckType: ["15cm", "40cm"],
            clamps: ["ALU", "BLACK"],
        },
    },
    "Steeldeck Triangle": {
        sheetName: "Steeldeck Triangle",
        inputCells: { A2: "PORTRAIT", B2: "rows", B3: "columns", E2: "height", E3: "width", B7: "profiles", B8: "color", B9: "clamps", E6: "thickness" },
        enums: {
            profilePosition: ["HORIZONTAL", "VERTICAL"],
            profilesColor: ["ALU", "BLACK"],
            clamps: ["ALU", "BLACK"],
        },
    },
    "Mounting Anchor": {
        sheetName: "Mounting Anchor",
        inputCells: { A2: "orientation", B2: "rows", B3: "columns", E2: "height", E3: "width", B6: "roof structure", B7: "material", B9: "profiles", B10: "clamps" },
        enums: {
            profilePosition: ["HORIZONTAL", "VERTICAL"],
            roofStructure: ["EPDM/TPO/PVC", "bitumen"],
            material: ["CONCRETE", "WOOD/STEEL"],
            profilesType: ["FEATHER", "HOUSE"],
            profilesColor: ["ALU", "BLACK"],
            clamps: ["ALU", "BLACK"],
        },
    },
};

/** Normalize orientation for roofs that use SOUTH | EAST_WEST (Flat, Steeldeck Solarspeed). */
export function normalizeOrientationSouthEastWest(value: string): "SOUTH" | "EAST_WEST" {
    return value === "SOUTH" || value === "EAST_WEST" ? value : "SOUTH";
}

/** Normalize orientation for roofs that use LANDSCAPE | PORTRAIT (Field). */
export function normalizeOrientationLandscapePortrait(value: string): "LANDSCAPE" | "PORTRAIT" {
    return value === "LANDSCAPE" || value === "PORTRAIT" ? value : "LANDSCAPE";
}

/** Normalize triangle width for Flat: SOUTH uses 1500|1600, EAST_WEST uses 2450. */
export function normalizeFlatTriangleWidth(orientation: "SOUTH" | "EAST_WEST", value: number): 1500 | 1600 | 2450 {
    if (orientation === "EAST_WEST") return 2450;
    return value === 1600 ? 1600 : 1500;
}

/** Normalize triangle width for Steeldeck Solarspeed: only 1500 | 1600. */
export function normalizeSteeldeckSolarspeedTriangleWidth(value: number): 1500 | 1600 {
    return value === 1600 ? 1600 : 1500;
}
