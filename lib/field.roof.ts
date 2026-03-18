/**
 * Field (ground mount) BOM – aligned with Excel "Field" sheet.
 * Inputs: orientation (LANDSCAPE/PORTRAIT), rows (B2), columns (B3), height (E2), width (E3), profiles (ALU/BLACK), clamps (ALU/BLACK).
 */

import { products } from "../data/data";
import { quantityFromNeeded } from "./roofUtils";
import { MIDDLE_END_CLAMP_WIDTH } from "../constants/dataConstant";

export interface FieldRoofProps {
    rows: number;
    columns: number;
    height: number;
    width: number;
    orientation?: "LANDSCAPE" | "PORTRAIT";
    /** Screw pile length (galva). */
    schroefpaalLength?: 750 | 1000 | 1500;
    profilesColor?: "ALU" | "BLACK";
    clamps?: "ALU" | "BLACK";
    /** Panel thickness [mm] (for clamp height selection). */
    thickness?: number;
    /** Field sheet triangle angle (Excel B7). */
    angle?: 15 | 20 | 25;
    /** Multiplier for quantities (e.g. multiple identical arrays). Default 1. */
    multiple?: number;
}

export type FieldRoofBomItem = {
    code: string;
    quantity: number;
    description?: string;
    needed: number;
    pack: number;
};

export function fieldRoof(props: FieldRoofProps): FieldRoofBomItem[] {
    const rows = props.rows;
    const columns = props.columns;
    const rawOrientation = props.orientation ?? "LANDSCAPE";
    const orientation = rawOrientation === "LANDSCAPE" || rawOrientation === "PORTRAIT" ? rawOrientation : "LANDSCAPE";
    const profilesColor = props.profilesColor ?? "ALU";
    const clamps = props.clamps ?? "ALU";
    const thickness = props.thickness ?? 30;
    const schroefpaal = props.schroefpaalLength ?? 1000;
    const mult = Math.max(1, props.multiple ?? 1);
    const angle = props.angle ?? 25;

    const bom: FieldRoofBomItem[] = [];
    // Include even when NEEDED = 0 (Excel still shows those product lines with quantity 0).
    const push = (code: string, needed: number) => {
        if (!code) return;
        const n = Math.max(0, needed * mult);
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

    // Excel intermediate geometry variables (Field sheet) for angle-dependent NEEDED formulas.
    // You provided:
    //   G5 = ((IF(A2="LANDSCAPE",E2,E3)+data!B3)*B2+data!B3)/1000
    //   G6 = IF(A2="LANDSCAPE",E3,E2)*B3/1000
    // Mapping:
    //   A2 = orientation, B2 = rows, B3 = columns, E2 = height, E3 = width, data!B3 = clamp width (20mm).
    // Excel mapping clarification (your message):
    //   B2 = column count, B3 = row count
    // Excel formulas you gave:
    //   G5 = ((IF(A2="LANDSCAPE",E2,E3)+data!B3)*B2+data!B3)/1000
    //   G6 = IF(A2="LANDSCAPE",E3,E2)*B3/1000
    //
    // In our props: E2 = heightMm, E3 = widthMm.
    const heightMm = props.height;
    const widthMm = props.width;
    const clampM = MIDDLE_END_CLAMP_WIDTH; // mm
    const termForG5 = (rawOrientation === "LANDSCAPE" ? heightMm : widthMm) + clampM;
    const G5 = (termForG5 * columns + clampM) / 1000;
    const G6 = ((rawOrientation === "LANDSCAPE" ? widthMm : heightMm) * rows) / 1000;
    // Excel intermediate H5/H6 (based on your mapping):
    // - H5 = G5/3 + 1
    // - H6 = G6/1.5 + 1
    const H5 = G5 / 3 + 1;
    const H6 = G6 / 1.5 + 1;

    // Excel I5: =ROUNDDOWN(H5,0)+IF(MOD(H5,1)>0.333333333333333,1,0)
    // "special round up" when fractional part is > 1/3.
    const I5 = Math.floor(H5) + (((H5 % 1) > 1 / 3 ? 1 : 0) as number);

    // NOTE: `angle`, `G5/G6`, `H5/H6`, `I5` are computed here, but we still need to wire them
    // into the final NEEDED formulas for the relevant BOM lines.

    // ===== Excel NEEDED formulas mapping (your list) =====
    // Using Field sheet variable mapping:
    // - B2 = columns, B3 = rows
    // - B6 is effectively 1 on the screenshot configs
    const B2 = columns;
    const B3 = rows;
    const B6 = 1;
    // clampM (20mm) already defined above for G5/G6

    // I6 = B3 for this Field sheet (matches your screenshot NEEDED values).
    const I6 = B3;

    // I14 = I5*I6*B6
    const I14 = I5 * I6 * B6;

    // I22 = ROUNDUP(G5/1.5+1,0)*B6
    const roundup0 = (x: number) => Math.ceil(x); // ROUNDUP(x,0) for positive
    const I22 = roundup0(G5 / 1.5 + 1) * B6;

    // I18 = ROUNDUP(G5*103%*I6/6.2,0)*B6
    const I18 = roundup0((G5 * 1.03 * I6) / 6.2) * B6;

    // I19 = (ROUNDUP(G5/6.2,0)-1)*I6*B6 + (ROUNDUP(G5/6,0)-1)*2*B3*B6
    const I19 = (roundup0(G5 / 6.2) - 1) * I6 * B6 + (roundup0(G5 / 6) - 1) * 2 * B3 * B6;

    // I20/I21 = I14 + I22 + (I22*B3*2) + I19*2
    const I20 = I14 + I22 + I22 * B3 * 2 + I19 * 2;

    // H6 special rounding used in I23/I24/I25:
    // ROUNDDOWN(H6,0)+IF(MOD(H6,1)>0.4,1,0)
    const H6Floor = Math.floor(H6);
    const H6Frac = H6 - H6Floor;
    const H6Special = H6Floor + (H6Frac > 0.4 ? 1 : 0);

    // I23/I24/I25 = I22 * H6Special
    const I23 = I22 * H6Special;

    // I26 = ROUNDUP(I22/3,0)
    const I26 = roundup0(I22 / 3);

    // I27 huisprofiel
    const I27 = roundup0(((G5 + (2 * clampM) / 1000) * 1.02 * B3 * 2) / 6) * B6;

    // I28 klikmiddenklem = (B2-1)*B3*2*B6
    const I28 = (B2 - 1) * B3 * 2 * B6;

    // I29 klikeindklem = B3*2*2*B6
    const I29 = B3 * 2 * 2 * B6;

    // ===== Push BOM lines =====
    // A14..A17 (schroefpaal + accessory + M16 bolt/nut washers)
    const schroefpaalCode = schroefpaal === 750 ? "1FLD45GA002" : schroefpaal === 1500 ? "1FLD45GA004" : "1FLD45GA005";
    push(schroefpaalCode, I14); // A14
    push("1FLD45AC001", I14); // A15
    push("1HME10BT043", I14); // A16
    push("1HME10RD004", I14); // A17

    // A18 profiel grote overspanning
    push("1HME43AL006", I18);

    // A19 profielverbinder
    push(profilesColor === "ALU" ? "1HMEACPV001" : "1HMEACPV002", I19);

    // A20/A21 M10 bolt/nut
    push("1HME10BT037", I20);
    push("1HME10MR001", I20);

    // A22 verstelbare schans (code depends on rows + orientation)
    const schansByRowsLandscape: Record<number, string | null> = { 2: "1FLD19ZZ001", 3: "1FLD19ZZ002", 4: "1FLD19ZZ003", 5: "1FLD19ZZ004" };
    const schansByRowsPortrait: Record<number, string | null> = { 1: "1FLD19ZZ001", 2: "1FLD19ZZ002", 3: "1FLD19ZZ004" };
    const schansCode = orientation === "LANDSCAPE" ? schansByRowsLandscape[B3] ?? null : schansByRowsPortrait[B3] ?? null;
    if (schansCode) push(schansCode, I22);

    // A23..A25 M8 bolt/nut/rondel
    push("1HME10BT014", I23);
    push("1HME10MR004", I23);
    push("1HME10RD001", I23);

    // A26 L-profiel
    push("1HFR43AL002", I26);

    // A27 huisprofiel
    push(profilesColor === "ALU" ? "1HME43AL050" : "1HME43ZW041", I27);

    // A28/A29 clamps + A30 sluitstop
    push(clamps === "ALU" ? "1HME32KK003" : "1HME32KK004", I28);
    push(
        clamps === "BLACK"
            ? thickness > 30
                ? "1HME32KK016"
                : "1HME32KK025"
            : thickness > 30
              ? "1HME32KK010"
              : "1HME32KK024",
        I29
    );
    push(clamps === "BLACK" ? "1HME0ACPS001" : "1HMEACPS002", I29);

    // A31 boormachine huur per dag
    push("8ZZZBM99005", 1);

    return bom;
}
