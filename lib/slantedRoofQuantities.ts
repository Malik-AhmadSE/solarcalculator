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

/** System dimensions in meters (Excel K9, K10). Includes clamp width (20mm) and end cap width (32mm). Portrait/landscape mapping per Excel. */
export function computeSystemDimensionsM(
    panelOrientation: "LANDSCAPE" | "PORTRAIT",
    panelHeightMm: number,
    panelWidthMm: number,
    rows: number,
    columns: number,
    layout: Layout,
    endCapWidthMm: number,
    clampWidthMm: number
): { systemWidthM: number; systemHeightM: number } {
    const toM = (mm: number) => mm / 1000;
    // Reversed vs original: LANDSCAPE → K9 uses panel width, K10 uses panel height; PORTRAIT → opposite
    const dimK9 = panelOrientation === "LANDSCAPE" ? panelWidthMm : panelHeightMm;
    const dimK10 = panelOrientation === "LANDSCAPE" ? panelHeightMm : panelWidthMm;

    // Width: panel dimension along rows + (rows-1)*clamp + 2*endCap when rails are horizontal
    const clampExtraWidth =
        layout === "HORIZONTAL"
            ? toM(Math.max(0, rows - 1) * clampWidthMm) + toM(endCapWidthMm) * 2
            : 0;
    const systemWidthM = toM(dimK9 * rows) + clampExtraWidth;

    // Height: panel dimension along columns + (columns-1)*clamp + 2*endCap when rails are vertical
    const clampExtraHeight =
        layout === "VERTICAL"
            ? toM(Math.max(0, columns - 1) * clampWidthMm) + toM(endCapWidthMm) * 2
            : 0;
    const systemHeightM = toM(dimK10 * columns) + clampExtraHeight;

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

    // K17: (ROUNDUP(length/divisor,0)+1 or +2 when perp odd and HORIZONTAL only) * IF(HORIZONTAL,B3,B2) * 2
    const sections =
        Math.ceil(lengthM / divisor) + (perp % 2 === 1 && layout === "HORIZONTAL" ? 2 : 1);
    const roofHook = sections * perp * R;

    // K18: =IF(OR(B6="ZINC",B7="HYBRID"),ROUNDUP(IF(A13="HORIZONTAL",K9*B3,K10*B2)*2*102%/6,0),K17*2)
    const lengthTimesPerp =
        layout === "HORIZONTAL" ? ctx.systemWidthM * columns : ctx.systemHeightM * rows;
    const row2 = zincHybrid
        ? Math.ceil((lengthTimesPerp * R * W) / L)
        : roofHook * 2;

    // K19 (profiles): rail-direction length × count — HORIZONTAL → height×rows, VERTICAL → width×columns; +1 when perp odd
    const lengthTimesPerpProfile =
        layout === "HORIZONTAL" ? ctx.systemHeightM * rows : ctx.systemWidthM * columns;
    const row3Base = Math.ceil((lengthTimesPerpProfile * R * W) / L);
    const row3 = zincHybrid
        ? Math.max(0, (Math.ceil(lengthM / L) - 1) * R * perp)
        : row3Base + (perp % 2 === 1 ? 1 : 0);

    // K20: ZINC/HYBRID → K19*2 + (ZINC ? optional K17 : 0); else (ROUNDUP(length/6,0)-1)*2*perp
    const row4NonZinc = Math.max(0, (Math.ceil(lengthM / L) - 1) * R * perp);
    const row4 = zincHybrid
        ? row3 * 2 + (ctx.roofing === "ZINC" ? roofHook : 0)
        : row4NonZinc;

    // K21: ZINC/HYBRID → same as K20; else K20*2 + optional K17
    const row5 = zincHybrid ? row4 : row4 * 2 + roofHook;

    // K22/connectors: Excel IF(A13="HORIZONTAL",(B2-1)*B3,(B3-1)*B2)
    const betweenPanels =
        layout === "HORIZONTAL" ? (rows - 1) * columns : (columns - 1) * rows;
    const row6 = zincHybrid ? betweenPanels * R : row4 * 2 + roofHook;

    // K23: middle clamps. ZINC/HYBRID → perp*2*2; else (HORIZONTAL?(B2-1)*B3:(B3-1)*B2)*2 = betweenPanels*2
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
