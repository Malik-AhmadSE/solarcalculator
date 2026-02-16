/**
 * Roof types aligned with BOM calculator Excel sheets.
 */

export const ROOF_TYPES = [
    "Slanted Roof",
    "Flat Roof",
    "Field",
    "Field (no Triangle)",
    "Steeldeck",
    "Steeldeck Solarspeed",
    "Steeldeck Triangle",
    "Mounting Anchor",
] as const;

export type RoofType = (typeof ROOF_TYPES)[number];

export const ROOF_TYPE_LABELS: Record<RoofType, string> = {
    "Slanted Roof": "Slanted Roof",
    "Flat Roof": "Flat Roof",
    "Field": "Field",
    "Field (no Triangle)": "Field (no Triangle)",
    "Steeldeck": "Steeldeck",
    "Steeldeck Solarspeed": "Steeldeck Solarspeed",
    "Steeldeck Triangle": "Steeldeck Triangle",
    "Mounting Anchor": "Mounting Anchor",
};
