
import { products } from "../data/data";
import { quantityFromNeeded } from "./roofUtils";

export interface FlatRoofProps {
    rows: number;
    columns: number;
    height: number;
    width: number;
    /** Excel A2: SOUTH or EAST_WEST */
    orientation?: "SOUTH" | "EAST_WEST";
    /** Excel B7: CLAMPS */
    clamps?: "BLACK" | "ALU";
    /** Excel E6: Thickness [mm] */
    thickness?: number;
    /** Excel B6: Steekafstand for SOUTH (1500 or 1600) */
    triangleWidth?: 1500 | 1600 | 2450;
}

export type FlatRoofBomItem = {
    code: string;
    quantity: number;
    description?: string;
    needed: number;
    pack: number;
};

export function flatRoof(props: FlatRoofProps): FlatRoofBomItem[] {
    const rows = props.rows;
    const columns = props.columns;
    // Only SOUTH and EAST_WEST are valid; other values (e.g. PORTRAIT/LANDSCAPE from shared state) default to SOUTH
    const rawOrientation = props.orientation ?? "SOUTH";
    const orientation = rawOrientation === "SOUTH" || rawOrientation === "EAST_WEST" ? rawOrientation : "SOUTH";
    const clamps = props.clamps ?? "BLACK";
    const thickness = props.thickness ?? 30;
    const triangleWidth = props.triangleWidth ?? 1500;

    const bom: FlatRoofBomItem[] = [];
    const push = (code: string, needed: number) => {
        if (!code || needed <= 0) return;
        const product = products.find((p) => p.code === code);
        const pack = product?.pack ?? 1;
        const quantity = quantityFromNeeded(needed, pack);
        bom.push({
            code,
            quantity,
            description: product?.description,
            needed,
            pack,
        });
    };

    if (orientation === "SOUTH") {
        // Excel: B2 = rows, B3 = columns. All NEEDED formulas use (B2=rows, B3=columns).
        const needTable = columns * rows + columns; // I11: B3*B2+B3
        const needBackplate = columns * rows; // I12: B3*B2
        const needLprofile = needBackplate; // I13: =I12
        const needKoppel = needBackplate; // I14: =I13
        const needEindrubber = rows + 1; // I15: B2+1
        const needDruknagel = needEindrubber * 2; // I16: I15*2
        const needPlaatschroef = needTable * 6 + needBackplate * 4 + needLprofile * 4 + needKoppel * 2; // I17
        const needEindklem = columns * 2 * 2; // I18: B3*2*2
        const needMiddenklem = columns * (rows - 1) * 2; // I19: B3*(B2-1)*2
        const needInbus = needEindklem + needMiddenklem; // I20: SUM(I18:I19)

        const tableCode = triangleWidth === 1600 ? "1SSP19NZ023" : "1SSP19NZ020";
        push(tableCode, needTable);
        push("1SSP99AC084", needLprofile);
        push("1SSP99AC030", needKoppel);
        push("1SSP99AC038", needEindrubber);
        push("1SSP99AC034", needDruknagel);
        push("1HME46PL001", needPlaatschroef);
        push("1HME10BT019", needInbus);
        const eindklemCode = thickness > 30 ? (clamps === "BLACK" ? "1HME32SR072" : "1HME32SR071") : (clamps === "BLACK" ? "1HME32SR096" : "1HME32SR097");
        push(eindklemCode, needEindklem);
        push(clamps === "BLACK" ? "1HME32SR086" : "1HME32SR085", needMiddenklem);

        push("1SSP99AC087", needBackplate);
    } else {

        // EAST_WEST: Excel B2=rows, B3=columns. Backplate/Lprofile/Koppel = one per panel (B2*B3).
        const needBackplate = rows * columns;
        const needLprofile = needBackplate;
        const needKoppel = needBackplate;
        const needEindrubber = columns + 1;
        const needTable = (columns + 1) * Math.floor(rows / 2);
        push("1SSP19EW017", needTable);
        push("1SSP99AC084", needLprofile);
        push("1SSP99AC030", needKoppel);
        push("1SSP99AC038", needEindrubber);
        push("1SSP99AC034", needEindrubber * 2);
        push("1HME46PL001", (needTable * 9 + needLprofile * 4 + needKoppel * 2 + ((rows % 2 === 0) ? (needKoppel * 6 + 7 * 4) : 0)));
        push("1HME10BT019", rows * 2 * 2 + rows * (columns - 1) * 2);
        const eindklemCodeEw = thickness > 30 ? (clamps === "BLACK" ? "1HME32SR072" : "1HME32SR071") : (clamps === "BLACK" ? "1HME32SR096" : "1HME32SR097");
        push(eindklemCodeEw, rows * 2 * 2);
        push("1SSP99AC087", needBackplate);
        push(clamps === "BLACK" ? "1HME32SR086" : "1HME32SR085", rows * (columns - 1) * 2);

    }

    return bom;
}
