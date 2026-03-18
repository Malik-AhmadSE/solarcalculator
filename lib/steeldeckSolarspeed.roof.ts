/**
 * Steeldeck Solarspeed BOM – aligned with Excel "Steeldeck Solarspeed" sheet.
 * SOUTH, rows×columns, 40cm plate, SOLARSPEED table, backplate, plaatschroef, clamps, inbus.
 */

import { products } from "../data/data";
import { getBackplateCodeByPanelHeight } from "./flat.roof";
import { quantityFromNeeded } from "./roofUtils";

export interface SteeldeckSolarspeedRoofProps {
    rows: number;
    columns: number;
    height: number;
    width: number;
    orientation?: "SOUTH" | "EAST_WEST";
    triangleWidth?: 1500 | 1600;
    steelDeckType?: "15cm" | "40cm";
    clamps?: "ALU" | "BLACK";
    thickness?: number;
}

export type SteeldeckSolarspeedRoofBomItem = {
    code: string;
    quantity: number;
    description?: string;
    needed: number;
    pack: number;
};

export function steeldeckSolarspeedRoof(
    props: SteeldeckSolarspeedRoofProps
): SteeldeckSolarspeedRoofBomItem[] {
    const rows = props.rows;
    const columns = props.columns;
    const panelCount = rows * columns;
    const rawOrientation = props.orientation ?? "SOUTH";
    const orientation = rawOrientation === "SOUTH" || rawOrientation === "EAST_WEST" ? rawOrientation : "SOUTH";
    const rawTw = props.triangleWidth ?? 1600;
    const triangleWidth = rawTw === 1500 || rawTw === 1600 ? rawTw : 1600;
    const plateType = props.steelDeckType ?? "40cm";
    const clamps = props.clamps ?? "ALU";
    const thickness = props.thickness ?? 30;
    const panelHeightMm = props.height;
    const backplateCode = getBackplateCodeByPanelHeight(panelHeightMm);

    const bom: SteeldeckSolarspeedRoofBomItem[] = [];
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

    // Excel NEEDED formulas (Solarspeed sheet). Mapping: B2=columns, B3=rows, A2=orientation, B7=plate type (40 cm / 15 cm).
    // I17 (table): IF(A2="SOUTH",B3*B2+B3,(B3+1)*ROUNDDOWN(B2/2,0))
    const needTable = orientation === "SOUTH" ? rows * columns + rows : (rows + 1) * Math.floor(columns / 2);
    // I13 (plates): IF(A2="SOUTH",I17+B2+1,I17*2+B2/2)
    const needPlates = orientation === "SOUTH" ? needTable + columns + 1 : needTable * 2 + columns / 2;
    push(plateType === "40cm" ? "1HME15SD006" : "1HME15SD005", needPlates);
    // I14 (BM screws): I13*IF(B7="40 cm",4,2)
    push("1HME46BM003", needPlates * (plateType === "40cm" ? 4 : 2));
    // I15/I16: I13
    push("1HME10BT014", needPlates);
    push("1HME10MR004", needPlates);

    const tableCode =
        orientation === "EAST_WEST"
            ? "1SSP19EW017"
            : triangleWidth === 1600
              ? "1SSP19NZ023"
              : "1SSP19NZ020";
    push(tableCode, needTable);
    // I18 (backplate / screws): IF(A2="SOUTH",$B$3*$B$2,I17*9)
    // In the BOM, EAST_WEST should NOT include backplate (requirement), so we only push backplate when SOUTH.
    const needBackplate = orientation === "SOUTH" ? rows * columns : 0;
    if (needBackplate > 0) push(backplateCode, needBackplate);

    // I19 (plaatschroef): IF(A2="SOUTH",I17*6+I18*4,B2*(B3-1)*2)
    // For EAST_WEST, the expected sheet uses I18 = I17*9 as plaatschroef (and clamps come from I19/I20).
    const needPlaatschroef = orientation === "SOUTH" ? needTable * 6 + needBackplate * 4 : needTable * 9;
    push("1HME46PL001", needPlaatschroef);

    // I20 (middle clamp): IF(A2="SOUTH",B3*(B2-1)*2,B2*2*2)
    const needMiddenklem = orientation === "SOUTH" ? rows * (columns - 1) * 2 : columns * 2 * 2;
    // I21 (end clamp): IF(A2="SOUTH",B3*2*2,SUM(I19:I20))
    // For EAST_WEST, end clamp is the classic columns*4 (matches your expected); I21 becomes inbus (sum) later.
    const needEindklem = orientation === "SOUTH" ? rows * 2 * 2 : columns * 2 * 2;
    push(clamps === "ALU" ? "1HME32SR085" : "1HME32SR086", needMiddenklem);
    push(clamps === "ALU" ? (thickness > 30 ? "1HME32SR071" : "1HME32SR097") : (thickness > 30 ? "1HME32SR072" : "1HME32SR096"), needEindklem);
    // I22 (inbus M8x30): IF(A2="SOUTH",SUM(I20:I21),"") but EAST_WEST still needs inbus = SUM(clamps)
    push("1HME10BT019", needEindklem + needMiddenklem);

    return bom;
}
