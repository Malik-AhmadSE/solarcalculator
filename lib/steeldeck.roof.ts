/**
 * Steeldeck BOM – aligned with Excel "Steeldeck" sheet.
 * Inputs: orientation (PORTRAIT/LANDSCAPE), rows (B2), columns (B3), height, width,
 * steelDeckType (15cm/40cm/Connecting), profilesType (HOUSE/FEATHER), profilesColor (ALU/BLACK), clamps (ALU/BLACK).
 */

import { products } from "../data/data";
import { quantityFromNeeded, systemDimensionsM, railPieces6m } from "./roofUtils";

export interface SteeldeckRoofProps {
    rows: number;
    columns: number;
    height: number;
    width: number;
    /** Profile/rail direction. HORIZONTAL = rails along width (columns); VERTICAL = along height (rows). Default HORIZONTAL. */
    profilePosition?: "HORIZONTAL" | "VERTICAL";
    steelDeckType?: "15cm" | "40cm" | "Connecting";
    profilesType?: "HOUSE" | "FEATHER";
    profilesColor?: "ALU" | "BLACK";
    clamps?: "ALU" | "BLACK";
    thickness?: number;
}

export type SteeldeckRoofBomItem = {
    code: string;
    quantity: number;
    description?: string;
    needed: number;
    pack: number;
};

export function steeldeckRoof(props: SteeldeckRoofProps): SteeldeckRoofBomItem[] {
    const { rows, columns, widthM, heightM, panelCount } = (() => {
        const d = systemDimensionsM(props.rows, props.columns, props.width, props.height);
        return { ...d, rows: props.rows, columns: props.columns };
    })();
    const profilePosition = props.profilePosition ?? "HORIZONTAL";
    const plateType = props.steelDeckType ?? "15cm";
    const profilesColor = props.profilesColor ?? "ALU";
    const clamps = props.clamps ?? "BLACK";
    const thickness = props.thickness ?? 30;

    const bom: SteeldeckRoofBomItem[] = [];
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

    const needPlates = panelCount;
    const plateCode = plateType === "40cm" ? "1HME15SD006" : "1HME15SD005";
    push(plateCode, needPlates);
    push("1HME46BM003", needPlates * 4);

    const railLen = profilePosition === "VERTICAL" ? heightM : widthM;
    const numRails = profilePosition === "VERTICAL" ? columns * 2 : rows * 2;
    const needMiddenklem = profilePosition === "VERTICAL" ? (rows - 1) * columns * 2 : (columns - 1) * rows * 2;
    const needEindklem = profilePosition === "VERTICAL" ? columns * 2 * 2 : rows * 2 * 2;
    push(clamps === "BLACK" ? "1HME32KK004" : "1HME32KK003", needMiddenklem);
    push(clamps === "BLACK" ? (thickness > 30 ? "1HME32KK016" : "1HME32KK025") : (thickness > 30 ? "1HME32KK010" : "1HME32KK024"), needEindklem);

    const needHuisprofiel = railPieces6m(railLen, numRails);
    push(profilesColor === "ALU" ? "1HME43AL050" : "1HME43ZW041", needHuisprofiel);

    const needVerbinder = Math.max(0, needHuisprofiel - 1);
    push(profilesColor === "ALU" ? "1HMEACPV001" : "1HMEACPV002", needVerbinder);
    push("1HME10BT037", needVerbinder * 4);
    push("1HME10MR001", needVerbinder * 4);

    return bom;
}
