/**
 * Steeldeck Solarspeed BOM – aligned with Excel "Steeldeck Solarspeed" sheet.
 * SOUTH, rows×columns, 40cm plate, SOLARSPEED table, backplate, plaatschroef, clamps, inbus.
 */

import { products } from "../data/data";
import { quantityFromNeeded, systemDimensionsM } from "./roofUtils";

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
    const orientation = props.orientation ?? "SOUTH";
    const triangleWidth = props.triangleWidth ?? 1600;
    const plateType = props.steelDeckType ?? "40cm";
    const clamps = props.clamps ?? "ALU";
    const thickness = props.thickness ?? 30;

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

    const needPlates = panelCount;
    push(plateType === "40cm" ? "1HME15SD006" : "1HME15SD005", needPlates);
    push("1HME46BM003", needPlates * 4);
    push("1HME10BT014", needPlates);
    push("1HME10MR004", needPlates);

    const needTable = orientation === "SOUTH" ? columns * rows + columns : (columns + 1) * Math.floor(rows / 2);
    push(triangleWidth === 1600 ? "1SSP19NZ023" : "1SSP19NZ020", needTable);
    const needBackplate = columns * rows;
    push("1SSP99AC087", needBackplate);

    const needPlaatschroef = needTable * 6 + needBackplate * 4 + needBackplate * 4 + needBackplate * 2; // I11*6 + I12*4 + I13*4 + I14*2
    push("1HME46PL001", needPlaatschroef);

    const needMiddenklem = (columns - 1) * rows * 2;
    const needEindklem = columns * 2 * 2;
    push(clamps === "ALU" ? "1HME32SR085" : "1HME32SR086", needMiddenklem);
    push(clamps === "ALU" ? (thickness > 30 ? "1HME32SR071" : "1HME32SR097") : (thickness > 30 ? "1HME32SR072" : "1HME32SR096"), needEindklem);
    push("1HME10BT019", needEindklem + needMiddenklem);

    return bom;
}
