
import { END_CAP_WIDTH, MIDDLE_END_CLAMP_WIDTH } from "../constants/dataConstant";
import { products } from "../data/data";
import { quantityFromNeeded } from "./roofUtils";

/** System dimensions for Flat Roof including clamp (20mm) and end cap (32mm). Orientation affects which dimension is width vs height. */
export function computeFlatRoofSystemDimensionsM(
    panelWidthMm: number,
    panelHeightMm: number,
    rows: number,
    columns: number,
    orientation: "SOUTH" | "EAST_WEST"
): { systemWidthM: number; systemHeightM: number } {
    const clamp = MIDDLE_END_CLAMP_WIDTH;
    const endCap = END_CAP_WIDTH;
    const widthAlongColumns = (panelWidthMm * columns + Math.max(0, columns - 1) * clamp + 2 * endCap) / 1000;
    const heightAlongRows = (panelHeightMm * rows + Math.max(0, rows - 1) * clamp + 2 * endCap) / 1000;
    if (orientation === "EAST_WEST") {
        return { systemWidthM: heightAlongRows, systemHeightM: widthAlongColumns };
    }
    return { systemWidthM: widthAlongColumns, systemHeightM: heightAlongRows };
}

/** L-profile product code by panel height [mm]. Product lengths: 1200, 1345, 1805, 1885, 1965, 2045, 2125, 2205, 2285. */
export function getLprofileCodeByPanelHeight(panelHeightMm: number): string {
    const brackets: [number, string][] = [
        [1200, "1SSP99AC081"],
        [1345, "1SSP99AC107"],
        [1805, "1SSP99AC077"],
        [1885, "1SSP99AC082"],
        [1965, "1SSP99AC083"],
        [2045, "1SSP99AC084"],
        [2125, "1SSP99AC079"],
        [2205, "1SSP99AC080"],
        [2285, "1SSP99AC101"],
    ];
    for (let i = brackets.length - 1; i >= 0; i--) if (panelHeightMm <= brackets[i][0]) return brackets[i][1];
    return brackets[brackets.length - 1][1];
}

/** Backplate product code by panel height [mm]. Lengths: 1805, 1885, 1965, 2045, 2125, 2205, 2280. */
export function getBackplateCodeByPanelHeight(panelHeightMm: number): string {
    const brackets: [number, string][] = [
        [1805, "1SSP99AC086"],
        [1885, "1SSP99AC090"],
        [1965, "1SSP99AC091"],
        [2045, "1SSP99AC087"],
        [2125, "1SSP99AC088"],
        [2205, "1SSP99AC089"],
        [2280, "1SSP99AC100"],
    ];
    for (let i = brackets.length - 1; i >= 0; i--) if (panelHeightMm <= brackets[i][0]) return brackets[i][1];
    return brackets[brackets.length - 1][1];
}

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

    const panelHeightMm = props.height;
    const lprofileCode = getLprofileCodeByPanelHeight(panelHeightMm);
    const backplateCode = getBackplateCodeByPanelHeight(panelHeightMm);

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
        // Excel: B2 = rows, B3 = columns. L-profile and backplate by panel height; L-profile qty × 2 (was set, now pc).
        const needTable = columns * rows + columns; // I11: B3*B2+B3
        const needBackplate = columns * rows;
        const needLprofile = needBackplate; // needed × 2 when pushing (v3: product was set of 2, now sold per piece)
        const needKoppel = needBackplate;
        const needEindrubber = rows + 1;
        const needDruknagel = needEindrubber * 2;
        const needPlaatschroef = needTable * 6 + needBackplate * 4 + needLprofile * 4 + needKoppel * 2;
        const needEindklem = columns * 2 * 2;
        const needMiddenklem = columns * (rows - 1) * 2;
        const needInbus = needEindklem + needMiddenklem;

        const tableCode = triangleWidth === 1600 ? "1SSP19NZ023" : "1SSP19NZ020";
        push(tableCode, needTable);
        push(lprofileCode, needLprofile * 2);
        push("1SSP99AC030", needKoppel);
        push("1SSP99AC038", needEindrubber);
        push("1SSP99AC034", needDruknagel);
        push("1HME46PL001", needPlaatschroef);
        push("1HME10BT019", needInbus);
        const eindklemCode = thickness > 30 ? (clamps === "BLACK" ? "1HME32SR072" : "1HME32SR071") : (clamps === "BLACK" ? "1HME32SR096" : "1HME32SR097");
        push(eindklemCode, needEindklem);
        push(clamps === "BLACK" ? "1HME32SR086" : "1HME32SR085", needMiddenklem);
        push(backplateCode, needBackplate);
    } else {
        // EAST_WEST: Backplate and 1SSP19NZ023 only for odd columns; needed = rows+1 per Excel. L-profile qty × 2.
        const needBackplate = columns % 2 === 1 ? rows + 1 : 0;
        const needZuidLandscape = columns % 2 === 1 ? rows + 1 : 0;
        const needLprofile = rows * columns;
        const needKoppel = rows * columns;
        const needEindrubber = columns + 1;
        const needTable = (columns + 1) * Math.floor(rows / 2);
        push("1SSP19EW017", needTable);
        if (needZuidLandscape > 0) push("1SSP19NZ023", needZuidLandscape);
        push(lprofileCode, needLprofile * 2);
        push("1SSP99AC030", needKoppel);
        push("1SSP99AC038", needEindrubber);
        push("1SSP99AC034", needEindrubber * 2);
        // Excel: I12*9+I13*2+I14*2+IF(ISODD(B2)=TRUE,I22*6+I21*4,0) — B2=columns, extra when columns odd
        const needPlaatschroefEw =
            needTable * 9 + needLprofile * 4 + needKoppel * 2 +
            (columns % 2 === 1 ? (rows + 1) * 6 + (rows + 1) * 4 : 0);
        push("1HME46PL001", needPlaatschroefEw);
        push("1HME10BT019", rows * 2 * 2 + rows * (columns - 1) * 2);
        const eindklemCodeEw = thickness > 30 ? (clamps === "BLACK" ? "1HME32SR072" : "1HME32SR071") : (clamps === "BLACK" ? "1HME32SR096" : "1HME32SR097");
        push(eindklemCodeEw, rows * 2 * 2);
        if (needBackplate > 0) push(backplateCode, needBackplate);
        push(clamps === "BLACK" ? "1HME32SR086" : "1HME32SR085", rows * (columns - 1) * 2);
    }

    return bom;
}
