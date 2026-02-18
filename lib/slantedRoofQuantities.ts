/**
 * Slanted roof: compute "needed" quantities from system context only.
 * All formulas are pure: f(ctx, neededs) → number. No product codes.
 */

import {
    type SlantedSystemContext,
    type Layout,
    SLANTED_CONST,
    railLengthM,
    panelsPerpendicular,
    sectionLengthDivisor,
    isZincOrHybrid,
} from "./slantedRoofConfig";

/** Quantity to order = ceil(needed / pack) * pack (round up to full packs). */
export function quantityFromNeeded(needed: number, pack: number): number {
    if (pack <= 0) return Math.ceil(needed);
    return Math.ceil(needed / pack) * pack;
}

/** System dimensions in meters (Excel K9, K10). */
export function computeSystemDimensionsM(
    panelOrientation: "LANDSCAPE" | "PORTRAIT",
    panelHeightMm: number,
    panelWidthMm: number,
    rows: number,
    columns: number,
    layout: Layout,
    endCapWidthMm: number,
    distanceBehindClampMm: number
): { systemWidthM: number; systemHeightM: number } {
    const toM = (mm: number) => mm / 1000;
    const dimK9 = panelOrientation === "LANDSCAPE" ? panelHeightMm : panelWidthMm;
    const dimK10 = panelOrientation === "LANDSCAPE" ? panelWidthMm : panelHeightMm;

    const extraK9 =
        layout === "HORIZONTAL"
            ? toM(distanceBehindClampMm * rows + distanceBehindClampMm)
            : 0;
    const systemWidthM =
        toM(dimK9 * rows) + extraK9 + (layout === "HORIZONTAL" ? toM(endCapWidthMm) * 2 : 0);

    const extraK10 =
        layout === "VERTICAL"
            ? toM(endCapWidthMm * columns + endCapWidthMm)
            : 0;
    const systemHeightM =
        toM(dimK10 * columns) + extraK10 + (layout === "VERTICAL" ? toM(endCapWidthMm) * 2 : 0);

    return { systemWidthM, systemHeightM };
}

/** All "needed" values for the BOM, derived from context. Keys match BOM line ids. */
export interface NeededMap {
    roofHook: number;
    row2: number;
    row3: number;
    row4: number;
    row5: number;
    row6: number;
    /** Row 7: middle clamps (K23). */
    middleClamps: number;
    /** Row 8: end clamps (K24). */
    endClamps: number;
    /** Row 9: end clamps non-ZINC only (K25). */
    row9Clamps: number;
}

/**
 * Compute every needed quantity from system context.
 * Formulas match Excel K17–K25 (Slanted Roof sheet).
 */
export function computeAllNeeded(ctx: SlantedSystemContext): NeededMap {
    const lengthM = railLengthM(ctx);
    const perp = panelsPerpendicular(ctx);
    const divisor = sectionLengthDivisor(ctx);
    const zincHybrid = isZincOrHybrid(ctx);
    const L = SLANTED_CONST.PROFILE_RAIL_LENGTH_M;
    const W = SLANTED_CONST.WASTE_FACTOR;
    const R = SLANTED_CONST.RAILS_MULTIPLIER;
    const { rows, columns, layout } = ctx;

    // K17: (ROUNDUP(length/divisor,0)+1) * IF(HORIZONTAL,B3,B2) * 2
    const sections = Math.ceil(lengthM / divisor) + 1;
    const roofHook = sections * perp * R;

    // K18: ZINC/HYBRID → ROUNDUP((K9*B3 or K10*B2)*2*102%/6,0); else K17*2
    const lengthTimesPerp =
        layout === "HORIZONTAL" ? ctx.systemWidthM * columns : ctx.systemHeightM * rows;
    const row2 = zincHybrid
        ? Math.ceil((lengthTimesPerp * R * W) / L)
        : roofHook * 2;

    // K19: ZINC/HYBRID → (ROUNDUP(length/6,0)-1)*2*perp; else same as K18
    const row3 = zincHybrid
        ? Math.max(0, (Math.ceil(lengthM / L) - 1) * R * perp)
        : Math.ceil((lengthTimesPerp * R * W) / L);

    // K20: ZINC/HYBRID → K19*2 + (ZINC ? optional K17 : 0); else (ROUNDUP(length/6,0)-1)*2*perp
    const row4NonZinc = Math.max(0, (Math.ceil(lengthM / L) - 1) * R * perp);
    const row4 = zincHybrid
        ? row3 * 2 + (ctx.roofing === "ZINC" ? roofHook : 0)
        : row4NonZinc;

    // K21: ZINC/HYBRID → same as K20; else K20*2 + optional K17
    const row5 = zincHybrid ? row4 : row4 * 2 + roofHook;

    // K22: ZINC/HYBRID → (HORIZONTAL?(B2-1)*B3:(B3-1)*B2)*2; else K20*2 + optional K17
    const betweenPanels =
        layout === "HORIZONTAL" ? (rows - 1) * columns : (columns - 1) * rows;
    const row6 = zincHybrid ? betweenPanels * R : row4 * 2 + roofHook;

    // K23: middle clamps. ZINC/HYBRID → perp*2*2; else (HORIZONTAL?(B2-1)*B3:(B3-1)*B2)*2
    const middleClamps = zincHybrid ? perp * R * 2 : betweenPanels * R;

    // K24: end clamps. ZINC/HYBRID → perp*2*2; else perp*2*2 (same, +SUM in Excel)
    const endClamps = perp * R * 2;

    // K25: non-ZINC only: perp*2*2
    const row9Clamps = perp * R * 2;

    return {
        roofHook,
        row2,
        row3,
        row4,
        row5,
        row6,
        middleClamps,
        endClamps,
        row9Clamps,
    };
}
