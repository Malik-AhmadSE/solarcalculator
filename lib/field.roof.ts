/**
 * Field (ground mount) BOM – aligned with Excel "Field" sheet.
 * Inputs: orientation (LANDSCAPE/PORTRAIT), rows (B2), columns (B3), height (E2), width (E3), profiles (ALU/BLACK), clamps (ALU/BLACK).
 */

import { products } from "../data/data";
import { quantityFromNeeded, systemDimensionsM, railPieces6m } from "./roofUtils";

export interface FieldRoofProps {
    rows: number;
    columns: number;
    height: number;
    width: number;
    orientation?: "LANDSCAPE" | "PORTRAIT";
    profilesColor?: "ALU" | "BLACK";
    clamps?: "ALU" | "BLACK";
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
    const { widthM, heightM } = systemDimensionsM(rows, columns, props.width, props.height);
    const orientation = props.orientation ?? "LANDSCAPE";
    const profilesColor = props.profilesColor ?? "ALU";
    const clamps = props.clamps ?? "ALU";

    const bom: FieldRoofBomItem[] = [];
    const push = (code: string, needed: number) => {
        if (!code || needed <= 0) return;
        const product = products.find((p) => p.code === code);
        const pack = product?.pack ?? 1;
        bom.push({
            code,
            quantity: quantityFromNeeded(needed, pack),
            description: product?.description,
            needed,
            pack,
        });
    };

    // Excel Field (6 rows, 3 cols LANDSCAPE): schroefpaal (rows-1)*columns, plaatje same, M16/rondel same
    const needSchroefpaal = orientation === "LANDSCAPE" ? (rows - 1) * columns : (columns - 1) * rows;
    push("1FLD45GA005", needSchroefpaal);
    push("1FLD45AC001", needSchroefpaal);
    push("1HME10BT043", needSchroefpaal);
    push("1HME10RD004", needSchroefpaal);

    // Profiel grote overspanning 6.2m: 2*columns (LANDSCAPE) or 2*rows
    const needGroteOverspanning = orientation === "LANDSCAPE" ? 2 * columns : 2 * rows;
    push("1HME43AL006", needGroteOverspanning);

    // Profielverbinder: Excel 9 for 6×3 → columns * floor(rows/2)
    const needVerbinder = orientation === "LANDSCAPE" ? columns * Math.floor(rows / 2) : rows * Math.floor(columns / 2);
    push(profilesColor === "ALU" ? "1HMEACPV001" : "1HMEACPV002", needVerbinder);

    // Zeskant M10, kartelmoer M10: Excel 96 = 8*needEindklem (eindklem 12)
    const needEindklemForM10 = orientation === "LANDSCAPE" ? rows * 2 : columns * 2;
    const needM10 = needEindklemForM10 * 8;
    push("1HME10BT037", needM10);
    push("1HME10MR001", needM10);

    // Verstelbare schans: rows*columns/2 (Excel 9 for 6×3)
    const needSchans = Math.floor((rows * columns) / 2);
    push("1FLD19ZZ002", needSchans);

    // M8x16, klikmoer M8, rondel M8: 3 per schans
    const needM8 = needSchans * 3;
    push("1HME10BT014", needM8);
    push("1HME10MR004", needM8);
    push("1HME10RD001", needM8);

    // L-profiel 6m
    const needLprofiel = orientation === "LANDSCAPE" ? columns : rows;
    push("1HFR43AL002", needLprofiel);

    // Huisprofiel 6m: rail pieces along length (widthM = length along columns, heightM = along rows)
    const railLen = orientation === "LANDSCAPE" ? widthM : heightM;
    const numRails = orientation === "LANDSCAPE" ? rows * 2 : columns * 2;
    const needHuisprofiel = railPieces6m(railLen, numRails);
    push(profilesColor === "ALU" ? "1HME43AL050" : "1HME43ZW041", needHuisprofiel);

    // Klikmiddenklem: (rows-1)*columns*2 (Excel 30 for 6×3)
    const needMiddenklem = orientation === "LANDSCAPE" ? (rows - 1) * columns * 2 : (columns - 1) * rows * 2;
    push(clamps === "ALU" ? "1HME32KK003" : "1HME32KK004", needMiddenklem);

    // Klikeindklem: rows*2 (Excel 12 for 6 rows)
    const needEindklem = orientation === "LANDSCAPE" ? rows * 2 : columns * 2;
    push(clamps === "ALU" ? "1HME32KK010" : "1HME32KK016", needEindklem);

    // Sluitstop: same count as eindklem
    push(profilesColor === "ALU" ? "1HMEACPS002" : "1HME0ACPS001", needEindklem);

    return bom;
}
