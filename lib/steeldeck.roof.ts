/**
 * Steeldeck BOM – aligned with Excel "Steeldeck" sheet.
 * Profile position always HORIZONTAL (rails along width). Dimensions include clamp 20mm + end cap 32mm.
 * Excel: B7=plate type, B8=profile type, B9=profile color, B10=clamps, E6=thickness, K9=rail length.
 */

import { END_CAP_WIDTH, MIDDLE_END_CLAMP_WIDTH } from "../constants/dataConstant";
import { products } from "../data/data";
import { quantityFromNeeded } from "./roofUtils";

export interface SteeldeckRoofProps {
    rows: number;
    columns: number;
    height: number;
    width: number;
    /** Panel orientation: affects which dimension is along columns (system width). */
    panelOrientation?: "portrait" | "landscape";
    /** Always HORIZONTAL in UI; kept for type compatibility. */
    profilePosition?: "HORIZONTAL" | "VERTICAL";
    steelDeckType?: "15cm" | "40cm" | "Connecting";
    profilesType?: "HOUSE" | "FEATHER";
    profilesColor?: "ALU" | "BLACK";
    clamps?: "ALU" | "BLACK";
    thickness?: number;
    /** Multiplier for quantities (e.g. multiple identical arrays). Default 1. */
    multiple?: number;
}

export type SteeldeckRoofBomItem = {
    code: string;
    quantity: number;
    description?: string;
    needed: number;
    pack: number;
};

/** System dimensions with clamp (20mm) and end cap (32mm). Rails always horizontal so K9 = widthM. When landscape, panel width/height swap for system dimensions. */
export function computeSteeldeckSystemDimensionsM(
    panelWidthMm: number,
    panelHeightMm: number,
    rows: number,
    columns: number,
    panelOrientation?: "portrait" | "landscape"
): { systemWidthM: number; systemHeightM: number } {
    const clamp = MIDDLE_END_CLAMP_WIDTH;
    const endCap = END_CAP_WIDTH;
    const alongColumns = panelOrientation === "landscape" ? panelHeightMm : panelWidthMm;
    const alongRows = panelOrientation === "landscape" ? panelWidthMm : panelHeightMm;
    const systemWidthM = (alongColumns * columns + Math.max(0, columns - 1) * clamp + 2 * endCap) / 1000;
    const systemHeightM = (alongRows * rows + Math.max(0, rows - 1) * clamp + 2 * endCap) / 1000;
    return { systemWidthM, systemHeightM };
}

export function steeldeckRoof(props: SteeldeckRoofProps): SteeldeckRoofBomItem[] {
    const rows = props.rows;
    const columns = props.columns;
    const { systemWidthM, systemHeightM } = computeSteeldeckSystemDimensionsM(
        props.width,
        props.height,
        rows,
        columns,
        props.panelOrientation
    );
    const railLen = systemWidthM; // K9, always horizontal
    const B6 = 1; // rails multiplier (Excel B6); use 1 to match standard sheet, or add UI for 2 if needed

    const plateType = props.steelDeckType ?? "15cm";
    const profilesType = props.profilesType ?? "HOUSE";
    const profilesColor = props.profilesColor ?? "ALU";
    const clamps = props.clamps ?? "BLACK";
    const thickness = props.thickness ?? 30;
    const mult = Math.max(1, props.multiple ?? 1);
    const isConnecting = plateType === "Connecting";

    const bom: SteeldeckRoofBomItem[] = [];
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

    // Middle clamp K17: IF(B7="Plate 15 cm",(B3-1)*B2*2,(B2-1)*B3*2)*B6
    const needMiddenklem = (plateType === "15cm" ? (columns - 1) * rows * 2 : (rows - 1) * columns * 2) * B6;
    // End clamp K18: IF(B7="Plate 15 cm",B2*2*2,B3*2*2)*B6
    const needEindklem = (plateType === "15cm" ? rows * 2 * 2 : columns * 2 * 2) * B6;

    // K15 NEEDED: IF(B8="---------",SUM(K17:K18),(ROUNDUP(K9/0.7,0)+1)*B3*2*B6)
    const needPlates = isConnecting
        ? (Math.ceil(railLen / 0.7) + 1) * columns * 2 * B6
        : needMiddenklem + needEindklem;
    const plateCode = plateType === "40cm" ? "1HME15SD006" : plateType === "15cm" ? "1HME15SD005" : "1HME15SD004";
    push(plateCode, needPlates);
    // K16: K15*IF(B7="Plate 40 cm",4,2)
    push("1HME46BM003", needPlates * (plateType === "40cm" ? 4 : 2));
    // Row 3: IF(B10="BLACK",data!$I$52,data!$I$51) — middle clamp
    push(clamps === "BLACK" ? "1HME32KK004" : "1HME32KK003", needMiddenklem);
    // Row 4: IF(B10="BLACK",IF(E6>30,...),...) — end clamp
    push(clamps === "BLACK" ? (thickness > 30 ? "1HME32KK016" : "1HME32KK025") : (thickness > 30 ? "1HME32KK010" : "1HME32KK024"), needEindklem);

    // Rows 5–9 only when B8<>"---------" (Connecting plate); B8=profile type, B9=profile color
    if (isConnecting) {
        // K19 NEEDED: IF(B8="---------","",ROUNDUP(K9*B3*2*102%/6,0)*B6)
        const profileCode =
            profilesType === "FEATHER"
                ? (profilesColor === "BLACK" ? "1HME43ZW044" : "1HME43AL035")
                : (profilesColor === "BLACK" ? "1HME43ZW041" : "1HME43AL050");
        const needHuisprofiel = Math.ceil((railLen * columns * 2 * 1.02) / 6) * B6;
        push(profileCode, needHuisprofiel);

        // K20 NEEDED: IF(B8="---------","",K18) — connector = end clamp needed
        push(profilesColor === "BLACK" ? "1HMEACPV002" : "1HMEACPV001", needEindklem);

        // K21 NEEDED: IF(B8="---------","",IF(ROUNDUP(K9/6,0)-1=0,"",(ROUNDUP(K9/6,0)-1)*2*B3*B6))
        const needVerbinderBolts = Math.max(0, (Math.ceil(railLen / 6) - 1) * 2 * columns * B6);
        if (needVerbinderBolts > 0) {
            // K22/K23: IF(B8="---------","",IFERROR(K21*2,""))
            push("1HME10BT037", needVerbinderBolts * 2);
            push("1HME10MR001", needVerbinderBolts * 2);
        }
    }

    return bom;
}
