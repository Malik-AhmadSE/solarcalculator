/**
 * Verification matrix: test configs and expected BOM (needed, quantity) per product code.
 * Used by verify-roofs page to show Expected vs Actual and pass/fail.
 */

import type { RoofType } from "./roofTypes";
import type { CommonRoofProps } from "./calculateBOM";

export type ExpectedLine = { needed: number; quantity?: number };

export interface VerificationCase {
    id: string;
    roofType: RoofType;
    label: string;
    props: CommonRoofProps;
    /** Expected values by product code; quantity optional (derived from needed/pack if omitted). */
    expectedByCode: Record<string, ExpectedLine>;
}

/** Flat Roof 10×7 SOUTH – from docs/FLAT_ROOF_EXCEL_VERIFICATION.md */
const FLAT_10x7_SOUTH: VerificationCase = {
    id: "flat-10x7-south",
    roofType: "Flat Roof",
    label: "Flat 10×7 SOUTH",
    props: {
        rows: 10,
        columns: 7,
        width: 1134,
        height: 2000,
        orientation: "SOUTH",
        clamps: "BLACK",
        thickness: 30,
        triangleWidth: 1500,
    },
    expectedByCode: {
        "1SSP19NZ020": { needed: 77, quantity: 77 },
        "1SSP99AC087": { needed: 70, quantity: 70 },
        "1SSP99AC084": { needed: 70, quantity: 70 },
        "1SSP99AC030": { needed: 70, quantity: 70 },
        "1SSP99AC038": { needed: 11, quantity: 11 },
        "1SSP99AC034": { needed: 22, quantity: 22 },
        "1HME46PL001": { needed: 1162, quantity: 1200 },
        "1HME32SR096": { needed: 28, quantity: 40 },
        "1HME32SR086": { needed: 126, quantity: 130 },
        "1HME10BT019": { needed: 154, quantity: 200 },
    },
};

/** Flat Roof 5×7 SOUTH – smaller grid */
const FLAT_5x7_SOUTH: VerificationCase = {
    id: "flat-5x7-south",
    roofType: "Flat Roof",
    label: "Flat 5×7 SOUTH",
    props: {
        rows: 5,
        columns: 7,
        width: 1134,
        height: 1722,
        orientation: "SOUTH",
        clamps: "BLACK",
        thickness: 30,
        triangleWidth: 1500,
    },
    expectedByCode: {
        "1SSP19NZ020": { needed: 42 }, // cols*rows+cols = 7*5+7
        "1SSP99AC087": { needed: 35 },
        "1SSP99AC084": { needed: 35 },
        "1SSP99AC030": { needed: 35 },
        "1SSP99AC038": { needed: 6 },  // rows+1
        "1SSP99AC034": { needed: 12 },
        "1HME32SR096": { needed: 28 },  // cols*4
        "1HME32SR086": { needed: 56 }, // cols*(rows-1)*2 = 7*4*2
    },
};

/** Common 5×7 dimensions for other roofs */
const COMMON_5x7 = { rows: 5, columns: 7, width: 1134, height: 1722 };

/** Flat 5×7 EAST_WEST – backplate/Lprofile/Koppel = rows×columns = 35 (one per panel). */
const FLAT_5x7_EAST_WEST: VerificationCase = {
    id: "flat-5x7-east-west",
    roofType: "Flat Roof",
    label: "Flat 5×7 EAST_WEST",
    props: {
        ...COMMON_5x7,
        orientation: "EAST_WEST",
        clamps: "BLACK",
        thickness: 30,
        triangleWidth: 2450,
    },
    expectedByCode: {
        "1SSP19EW017": { needed: 16 },
        "1SSP99AC087": { needed: 35 },
        "1SSP99AC084": { needed: 35 },
        "1SSP99AC030": { needed: 35 },
        "1SSP99AC038": { needed: 8 },
        "1SSP99AC034": { needed: 16 },
        "1HME46PL001": { needed: 354 },
        "1HME10BT019": { needed: 80 },
        "1HME32SR096": { needed: 20 },
        "1HME32SR086": { needed: 60 },
    },
};

/** Slanted 5×7 portrait, VERTICAL profile. lengthM=systemHeightM, row4=(ceil(lengthM/6)-1)*2*perp, roofHook=sections*perp*2, row5/row6=row4*2+roofHook. */
const SLANTED_5x7: VerificationCase = {
    id: "slanted-5x7",
    roofType: "Slanted Roof",
    label: "Slanted 5×7 portrait, VERTICAL",
    props: {
        ...COMMON_5x7,
        panelOrientation: "portrait",
        profilePosition: "VERTICAL",
        roofing: "SLATES",
        roofHook: "NORMAL",
        profileType: "FEATHER",
        profileColor: "BLACK",
        clamps: "BLACK",
        Thickness: 30,
    },
    expectedByCode: {
        "1HME10BT037": { needed: 160 }, // row5
        "1HME10MR001": { needed: 160 }, // row6
    },
};

/** Field 5×7 LANDSCAPE. needM10 = needEindklemForM10*8 = (rows*2)*8 = 80. */
const FIELD_5x7: VerificationCase = {
    id: "field-5x7",
    roofType: "Field",
    label: "Field 5×7 LANDSCAPE",
    props: {
        ...COMMON_5x7,
        orientation: "LANDSCAPE",
        profilesColor: "BLACK",
        clamps: "BLACK",
    },
    expectedByCode: {
        "1HME10BT037": { needed: 80 },
        "1HME10MR001": { needed: 80 },
    },
};

/** Steeldeck 5×7 HORIZONTAL. 1HME10BT037/1HME10MR001 = needVerbinder*4, needVerbinder = needHuisprofiel-1. */
const STEELDECK_5x7: VerificationCase = {
    id: "steeldeck-5x7",
    roofType: "Steeldeck",
    label: "Steeldeck 5×7 HORIZONTAL",
    props: {
        ...COMMON_5x7,
        profilePosition: "HORIZONTAL",
        steelDeckType: "15cm",
        profilesType: "FEATHER",
        profilesColor: "BLACK",
        clamps: "BLACK",
        thickness: 30,
    },
    expectedByCode: {
        "1HME10BT037": { needed: 76 }, // needVerbinder=19 (ceil(7.938/6)*10-1), 19*4=76
        "1HME10MR001": { needed: 76 },
    },
};

/** Steeldeck Triangle 5×7 VERTICAL. 1HME10BT037/1HME10MR001 = needMiddenklem*2 = (rows-1)*columns*2*2 = 56*2 = 112. */
const STEELDECK_TRI_5x7: VerificationCase = {
    id: "steeldeck-tri-5x7",
    roofType: "Steeldeck Triangle",
    label: "Steeldeck Triangle 5×7 VERTICAL",
    props: {
        ...COMMON_5x7,
        profilePosition: "VERTICAL",
        profilesColor: "BLACK",
        clamps: "BLACK",
        thickness: 30,
    },
    expectedByCode: {
        "1HME10BT037": { needed: 112 },
        "1HME10MR001": { needed: 112 },
    },
};

/** Mounting Anchor 5×7 VERTICAL */
const MOUNTING_ANCHOR_5x7: VerificationCase = {
    id: "mounting-anchor-5x7",
    roofType: "Mounting Anchor",
    label: "Mounting Anchor 5×7 VERTICAL",
    props: {
        ...COMMON_5x7,
        profilePosition: "VERTICAL",
        roofStructure: "EPDM/TPO/PVC",
        material: "CONCRETE",
        profilesColor: "BLACK",
        clamps: "BLACK",
    },
    expectedByCode: {
        "1HME15AN003": { needed: 35 },
        "1HMEACMP002": { needed: 35 },
        "1HME15AS007": { needed: 140 }, // 4 per panel
        "1HME10BT037": { needed: 70 },
        "1HME10MR001": { needed: 70 },
    },
};

/** Field (no Triangle) 5×7: schroefpaal 1000/1500 (18+17), needM10 = needMiddenklem 116 + needVerbinder*8 (verbinder 2). */
const FIELD_NO_TRI_5x7: VerificationCase = {
    id: "field-no-tri-5x7",
    roofType: "Field (no Triangle)",
    label: "Field (no Triangle) 5×7, 1000/1500",
    props: {
        ...COMMON_5x7,
        schroefpaalLength: "1000/1500",
        profilesColor: "ALU",
        clamps: "BLACK",
    },
    expectedByCode: {
        "1FLD45GA005": { needed: 18 },
        "1FLD45GA004": { needed: 17 },
        "1HME10BT037": { needed: 132 }, // needMiddenklem 116 + needVerbinder 2 * 8
        "1HME10MR001": { needed: 132 },
    },
};

/** Steeldeck Solarspeed 5×7 SOUTH: table 42, backplate 35, M10 = eindklem+middenklem. */
const STEELDECK_SOLARSPEED_5x7: VerificationCase = {
    id: "steeldeck-solarspeed-5x7",
    roofType: "Steeldeck Solarspeed",
    label: "Steeldeck Solarspeed 5×7 SOUTH",
    props: {
        ...COMMON_5x7,
        orientation: "SOUTH",
        triangleWidth: 1500,
        steelDeckType: "40cm",
        clamps: "BLACK",
        thickness: 30,
    },
    expectedByCode: {
        "1SSP19NZ020": { needed: 42 },
        "1SSP99AC087": { needed: 35 },
        "1HME32SR096": { needed: 28 },
        "1HME32SR086": { needed: 56 },
    },
};

/** Steeldeck Solarspeed 5×7 EAST_WEST: table (cols+1)*floor(rows/2)=16, backplate 35. */
const STEELDECK_SOLARSPEED_5x7_EW: VerificationCase = {
    id: "steeldeck-solarspeed-5x7-ew",
    roofType: "Steeldeck Solarspeed",
    label: "Steeldeck Solarspeed 5×7 EAST_WEST",
    props: {
        ...COMMON_5x7,
        orientation: "EAST_WEST",
        triangleWidth: 1500,
        steelDeckType: "40cm",
        clamps: "BLACK",
        thickness: 30,
    },
    expectedByCode: {
        "1SSP19EW017": { needed: 16 },
        "1SSP99AC087": { needed: 35 },
        "1HME32SR096": { needed: 20 },
        "1HME32SR086": { needed: 60 },
    },
};

export const VERIFICATION_CASES: VerificationCase[] = [
    FLAT_10x7_SOUTH,
    FLAT_5x7_SOUTH,
    FLAT_5x7_EAST_WEST,
    SLANTED_5x7,
    FIELD_5x7,
    FIELD_NO_TRI_5x7,
    STEELDECK_5x7,
    STEELDECK_SOLARSPEED_5x7,
    STEELDECK_SOLARSPEED_5x7_EW,
    STEELDECK_TRI_5x7,
    MOUNTING_ANCHOR_5x7,
];
