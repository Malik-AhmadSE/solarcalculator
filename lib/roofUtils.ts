/**
 * Shared helpers for all roof BOM calculators.
 */

export { quantityFromNeeded } from "./slantedRoofQuantities";

/** System dimensions from panel layout (mm → m). No extra caps; simple footprint. */
export function systemDimensionsM(
    rows: number,
    columns: number,
    widthMm: number,
    heightMm: number
): { widthM: number; heightM: number; panelCount: number } {
    const widthM = (widthMm / 1000) * columns;
    const heightM = (heightMm / 1000) * rows;
    const panelCount = rows * columns;
    return { widthM, heightM, panelCount };
}

/** Rail length along the "length" dimension (e.g. along columns). Rail pieces of 6m. */
export function railPieces6m(lengthM: number, numRails: number): number {
    return Math.ceil(lengthM / 6) * numRails;
}
