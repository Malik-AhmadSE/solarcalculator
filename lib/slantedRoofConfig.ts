/**
 * Slanted roof BOM: constants and data-driven product selection.
 * No hardcoded branch trees – rules are (predicate → product code).
 */

import type { SlantedRoofProps } from "./slanted.roof";

export type Layout = "HORIZONTAL" | "VERTICAL";

/** Formula constants (from Excel / data sheet). */
export const SLANTED_CONST = {
    /** Profile rail length [m] for section count. */
    PROFILE_RAIL_LENGTH_M: 6,
    /** Section length divisor [m] for ZINC (Excel: 1). */
    SECTION_LENGTH_ZINC_M: 1,
    /** Section length divisor [m] for TILED/SLATES (Excel: 1.2). */
    SECTION_LENGTH_TILED_M: 1.2,
    /** Waste factor (Excel: 102%). */
    WASTE_FACTOR: 1.02,
    /** Rails per panel row (Excel: *2 in K17). */
    RAILS_MULTIPLIER: 2,
} as const;

/** System context: everything needed to compute "needed" quantities (no product codes). */
export interface SlantedSystemContext {
    layout: Layout;
    systemWidthM: number;
    systemHeightM: number;
    rows: number;
    columns: number;
    roofing: SlantedRoofProps["roofing"];
    roofHook: string;
    profileType: SlantedRoofProps["profileType"];
    profileColor: SlantedRoofProps["profileColor"];
    clamps: SlantedRoofProps["clamps"];
    thickness: number;
}

/** Length along the rail direction [m]. */
export function railLengthM(ctx: SlantedSystemContext): number {
    return ctx.layout === "HORIZONTAL" ? ctx.systemWidthM : ctx.systemHeightM;
}

/** Count of panels in the direction perpendicular to rails. */
export function panelsPerpendicular(ctx: SlantedSystemContext): number {
    return ctx.layout === "HORIZONTAL" ? ctx.columns : ctx.rows;
}

/** Section length divisor [m] by roofing type. */
export function sectionLengthDivisor(ctx: SlantedSystemContext): number {
    return ctx.roofing === "ZINC" ? SLANTED_CONST.SECTION_LENGTH_ZINC_M : SLANTED_CONST.SECTION_LENGTH_TILED_M;
}

/** Is ZINC or HYBRID (formulas often branch on this). */
export function isZincOrHybrid(ctx: SlantedSystemContext): boolean {
    return ctx.roofing === "ZINC" || ctx.roofHook === "HYBRID";
}

// ---- Product selection: first matching rule wins ----

type Predicate = (p: SlantedRoofProps) => boolean;
type Rule = [Predicate, string];

function firstMatch(props: SlantedRoofProps, rules: Rule[]): string {
    for (const [pred, code] of rules) {
        if (pred(props)) return code;
    }
    return "";
}

const Z = (p: SlantedRoofProps) => p.roofing === "ZINC";
const H = (p: SlantedRoofProps) => p.roofHook === "HYBRID";
const ZorH = (p: SlantedRoofProps) => Z(p) || H(p);
const TILED = (p: SlantedRoofProps) => p.roofing === "TILED";
const SLATES = (p: SlantedRoofProps) => p.roofing === "SLATES";
const FEATHER = (p: SlantedRoofProps) => p.profileType === "FEATHER";
const HOUSE = (p: SlantedRoofProps) => p.profileType === "HOUSE";
const BLACK = (p: SlantedRoofProps) => p.profileColor === "BLACK";
const ALU = (p: SlantedRoofProps) => p.profileColor === "ALU";
const CLAMP_BLACK = (p: SlantedRoofProps) => p.clamps === "BLACK";
const THICK = (p: SlantedRoofProps) => p.Thickness > 30;

/** Row 2: tile/slate screw or ZINC profile. */
export const ROW2_RULES: Rule[] = [
    [p => ZorH(p) && FEATHER(p) && BLACK(p), "1HME43ZW044"],
    [p => ZorH(p) && FEATHER(p) && ALU(p), "1HME43ZW041"],
    [p => ZorH(p) && HOUSE(p) && BLACK(p), "1HME43ZW041"],
    [p => ZorH(p) && HOUSE(p) && ALU(p), "1HME43AL050"],
    [TILED, "1HME46HT004"],
    [SLATES, "1HME46HT001"],
];

/** Row 3: profile connector / ACPV / profile. */
export const ROW3_RULES: Rule[] = [
    [p => ZorH(p) && BLACK(p), "1HMEACPV002"],
    [p => ZorH(p) && ALU(p), "1HMEACPV001"],
    [p => FEATHER(p) && BLACK(p), "1HME43ZW044"],
    [p => FEATHER(p) && ALU(p), "1HME43AL035"],
    [p => HOUSE(p) && BLACK(p), "1HME43ZW041"],
    [p => HOUSE(p) && ALU(p), "1HME43AL050"],
];

/** Row 4. */
export const ROW4_RULES: Rule[] = [
    [ZorH, "1HME10BT037"],
    [p => BLACK(p), "1HMEACPV002"],
    [p => ALU(p), "1HMEACPV001"],
];

/** Row 5. */
export const ROW5_RULES: Rule[] = [
    [ZorH, "1HME10MR001"],
    [() => true, "1HME10BT037"],
];

/** Row 6: ZINC/HYBRID → clamp by color; else rail bolt. */
export const ROW6_RULES: Rule[] = [
    [p => ZorH(p) && CLAMP_BLACK(p), "1HME32KK004"],
    [p => ZorH(p) && !CLAMP_BLACK(p), "1HME32KK003"],
    [() => true, "1HME10MR001"],
];

/** Row 7: middle clamp (thickness + color). */
export const ROW7_RULES: Rule[] = [
    [p => ZorH(p) && CLAMP_BLACK(p) && THICK(p), "1HME32KK016"],
    [p => ZorH(p) && CLAMP_BLACK(p) && !THICK(p), "1HME32KK025"],
    [p => ZorH(p) && !CLAMP_BLACK(p) && THICK(p), "1HME32KK010"],
    [p => ZorH(p) && !CLAMP_BLACK(p) && !THICK(p), "1HME32KK024"],
    [p => CLAMP_BLACK(p), "1HME32KK004"],
    [() => true, "1HME32KK003"],
];

/** Row 8. */
export const ROW8_RULES: Rule[] = [
    [p => ZorH(p) && CLAMP_BLACK(p), "1HME0ACPS001"],
    [p => ZorH(p) && !CLAMP_BLACK(p), "1HMEACPS002"],
    [p => !ZorH(p) && CLAMP_BLACK(p) && THICK(p), "1HME32KK016"],
    [p => !ZorH(p) && CLAMP_BLACK(p) && !THICK(p), "1HME32KK025"],
    [p => !ZorH(p) && !CLAMP_BLACK(p) && THICK(p), "1HME32KK010"],
    [() => true, "1HME32KK024"],
];

/** Row 9: only for non-ZINC/non-HYBRID. */
export const ROW9_RULES: Rule[] = [
    [p => !ZorH(p) && CLAMP_BLACK(p), "1HME0ACPS001"],
    [p => !ZorH(p) && !CLAMP_BLACK(p), "1HMEACPS002"],
];

export function getCodeRow2(props: SlantedRoofProps): string {
    return firstMatch(props, ROW2_RULES);
}
export function getCodeRow3(props: SlantedRoofProps): string {
    return firstMatch(props, ROW3_RULES);
}
export function getCodeRow4(props: SlantedRoofProps): string {
    return firstMatch(props, ROW4_RULES);
}
export function getCodeRow5(props: SlantedRoofProps): string {
    return firstMatch(props, ROW5_RULES);
}
export function getCodeRow6(props: SlantedRoofProps): string {
    return firstMatch(props, ROW6_RULES);
}
export function getCodeRow7(props: SlantedRoofProps): string {
    return firstMatch(props, ROW7_RULES);
}
export function getCodeRow8(props: SlantedRoofProps): string {
    return firstMatch(props, ROW8_RULES);
}
export function getCodeRow9(props: SlantedRoofProps): string {
    return firstMatch(props, ROW9_RULES);
}
