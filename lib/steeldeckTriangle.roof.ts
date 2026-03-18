/**
 * Steeldeck Triangle BOM – aligned with Excel "Steeldeck Triangle" sheet.
 * PORTRAIT, triangle config, 15cm plate, schans, L-profiel, huisprofiel, verbinder, clamps, sluitstop, M10.
 */

import { products } from "../data/data";
import { quantityFromNeeded, railPieces6m } from "./roofUtils";
import { computeSteeldeckSystemDimensionsM } from "./steeldeck.roof";

export interface SteeldeckTriangleRoofProps {
    rows: number;
    columns: number;
    height: number;
    width: number;
    /** Panel orientation affects footprint (clamp/end-cap included). */
    panelOrientation?: "portrait" | "landscape";
    /** Plate type (Excel steel deck choice). */
    steelDeckType?: "15cm" | "40cm";
    /** Triangle angle (Excel B7). */
    triangleAngle?: 15 | 20 | 25;
    profilesColor?: "ALU" | "BLACK";
    clamps?: "ALU" | "BLACK";
    thickness?: number;
    /** Multiplier for quantities (e.g. multiple identical arrays). Default 1. */
    multiple?: number;
}

export type SteeldeckTriangleRoofBomItem = {
    code: string;
    quantity: number;
    description?: string;
    needed: number;
    pack: number;
};

export function steeldeckTriangleRoof(
    props: SteeldeckTriangleRoofProps
): SteeldeckTriangleRoofBomItem[] {
    const rows = props.rows;
    const columns = props.columns;
    const { systemWidthM, systemHeightM } = computeSteeldeckSystemDimensionsM(
        props.width,
        props.height,
        rows,
        columns,
        props.panelOrientation ?? "portrait"
    );
    // Excel Triangle sheet uses a derived base count (not rows*columns) for plates/M8/BM/schans.
    // From provided formulas: I19 = ROUNDUP(G5/1.5+1,0) where G5 ≈ system width [m].
    const G5 = systemWidthM;
    const I19 = Math.ceil(G5 / 1.5 + 1);
    const plateCount = I19;
    const profilesColor = props.profilesColor ?? "ALU";
    const clamps = props.clamps ?? "BLACK";
    const thickness = props.thickness ?? 30;
    const plateType = props.steelDeckType ?? "15cm";
    const mult = Math.max(1, props.multiple ?? 1);

    const bom: SteeldeckTriangleRoofBomItem[] = [];
    const push = (code: string, needed: number) => {
        const n = needed * mult;
        if (!code || n <= 0) return;
        const product = products.find((p) => p.code === code);
        const pack = product?.pack ?? 1;
        bom.push({
            code,
            quantity: quantityFromNeeded(n, pack),
            description: product?.description,
            needed: n,
            pack,
        });
    };
    const pushEvenIfZero = (code: string, needed: number) => {
        const n = needed * mult;
        if (!code) return;
        const product = products.find((p) => p.code === code);
        const pack = product?.pack ?? 1;
        bom.push({
            code,
            quantity: n <= 0 ? 0 : quantityFromNeeded(n, pack),
            description: product?.description,
            needed: n,
            pack,
        });
    };

    // Plates (Excel I15): uses derived base count.
    push(plateType === "40cm" ? "1HME15SD006" : "1HME15SD005", plateCount);
    // BM screws (Excel I16): I15*IF(40cm,4,2)
    push("1HME46BM003", plateCount * (plateType === "40cm" ? 4 : 2));
    // M8x16 / klikmoer (Excel I17/I18): = I15
    push("1HME10BT014", plateCount);
    push("1HME10MR004", plateCount);

    // Verstelbare schans (Excel row): needed follows the same derived base count (I19).
    const po = props.panelOrientation ?? "portrait";
    const schansByRowsLandscape: Record<number, string | null> = { 2: "1FLD19ZZ001", 3: "1FLD19ZZ002", 4: "1FLD19ZZ003", 5: "1FLD19ZZ004" };
    const schansByRowsPortrait: Record<number, string | null> = { 1: "1FLD19ZZ001", 2: "1FLD19ZZ002", 3: "1FLD19ZZ004" };
    const schansCode = po === "landscape" ? schansByRowsLandscape[rows] ?? null : schansByRowsPortrait[rows] ?? null;
    const needSchans = I19;
    if (schansCode) push(schansCode, needSchans);

    // L-profile (Excel I20): ROUNDUP(I19/3,0)
    const needLprofiel = Math.ceil(I19 / 3);
    push("1HFR43AL002", needLprofiel);

    // Huisprofiel (Excel I21): ROUNDUP((G5+(2*data!$B$2/1000))*102%*B3*2/6,0)*B6
    // data!B2 is clamp width (20mm) and B6=1 for this sheet. B3 corresponds to rows.
    const clampM = 0.02;
    const B6 = 1;
    const needHuisprofiel = Math.ceil(((G5 + 2 * clampM) * 1.02 * rows * 2) / 6) * B6;
    push(profilesColor === "ALU" ? "1HME43AL050" : "1HME43ZW041", needHuisprofiel);
    // Profielverbinder (Excel I22): (ROUNDUP(G5/6,0)-1)*2*B3*B6
    const needVerbinder = Math.max(0, Math.ceil(G5 / 6) - 1) * 2 * rows * B6;
    // Excel still shows this row even if needed=0, so keep it visible in the BOM.
    pushEvenIfZero(profilesColor === "ALU" ? "1HMEACPV001" : "1HMEACPV002", needVerbinder);

    // Clamps (Excel I23/I24): (B2-1)*B3*2*B6 and B3*2*2*B6 (B2=columns, B3=rows, B6=1)
    const needMiddenklem = (columns - 1) * rows * 2 * B6;
    const needEindklem = rows * 2 * 2 * B6;
    push(clamps === "BLACK" ? "1HME32KK004" : "1HME32KK003", needMiddenklem);
    // End clamp code depends on thickness (>30 => 35mm) and clamp color.
    push(
        clamps === "BLACK"
            ? (thickness > 30 ? "1HME32KK016" : "1HME32KK025")
            : (thickness > 30 ? "1HME32KK010" : "1HME32KK024"),
        needEindklem
    );
    // Sluitstop depends on clamp color (not profile color) per requirement.
    push(clamps === "BLACK" ? "1HME0ACPS001" : "1HMEACPS002", needEindklem);

    // Excel (Triangle sheet) A26/A27:
    // M10 bolt/nut = I19*B3*2 + I22*2
    // Here: I19 is derived base count, I22 is profile connector count above, B3=rows.
    const needM10 = I19 * rows * 2 + needVerbinder * 2;
    push("1HME10BT037", needM10);
    push("1HME10MR001", needM10);

    return bom;
}
