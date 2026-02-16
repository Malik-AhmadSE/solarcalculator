/**
 * Steeldeck Triangle BOM – aligned with Excel "Steeldeck Triangle" sheet.
 * PORTRAIT, triangle config, 15cm plate, schans, L-profiel, huisprofiel, verbinder, clamps, sluitstop, M10.
 */

import { products } from "../data/data";
import { quantityFromNeeded, systemDimensionsM, railPieces6m } from "./roofUtils";

export interface SteeldeckTriangleRoofProps {
    rows: number;
    columns: number;
    height: number;
    width: number;
    /** Profile/rail direction. HORIZONTAL = rails along width; VERTICAL = along height. Default HORIZONTAL. */
    profilePosition?: "HORIZONTAL" | "VERTICAL";
    profilesColor?: "ALU" | "BLACK";
    clamps?: "ALU" | "BLACK";
    thickness?: number;
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
    const { widthM, heightM, panelCount } = systemDimensionsM(rows, columns, props.width, props.height);
    const profilePosition = props.profilePosition ?? "HORIZONTAL";
    const profilesColor = props.profilesColor ?? "ALU";
    const clamps = props.clamps ?? "BLACK";
    const thickness = props.thickness ?? 30;

    const bom: SteeldeckTriangleRoofBomItem[] = [];
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

    push("1HME15SD005", panelCount);
    push("1HME46BM003", panelCount * 4);
    push("1HME10BT014", panelCount);
    push("1HME10MR004", panelCount);

    const needSchans = Math.floor((rows * columns) / 2);
    push("1FLD19ZZ004", needSchans);
    const railLen = profilePosition === "VERTICAL" ? heightM : widthM;
    const needLprofiel = railPieces6m(railLen, 1);
    push("1HFR43AL002", needLprofiel);
    const numRails = profilePosition === "VERTICAL" ? columns * 2 : rows * 2;
    const needHuisprofiel = railPieces6m(railLen, numRails);
    push(profilesColor === "ALU" ? "1HME43AL050" : "1HME43ZW041", needHuisprofiel);
    const needVerbinder = Math.max(0, needHuisprofiel - 1);
    push(profilesColor === "ALU" ? "1HMEACPV001" : "1HMEACPV002", needVerbinder);

    const needMiddenklem = profilePosition === "VERTICAL" ? (rows - 1) * columns * 2 : (columns - 1) * rows * 2;
    const needEindklem = profilePosition === "VERTICAL" ? columns * 2 * 2 : rows * 2 * 2;
    push(clamps === "BLACK" ? "1HME32KK004" : "1HME32KK003", needMiddenklem);
    push(clamps === "BLACK" ? "1HME32KK025" : "1HME32KK024", needEindklem);
    push(profilesColor === "ALU" ? "1HMEACPS002" : "1HME0ACPS001", needEindklem);

    push("1HME10BT037", needMiddenklem * 2);
    push("1HME10MR001", needMiddenklem * 2);

    return bom;
}
