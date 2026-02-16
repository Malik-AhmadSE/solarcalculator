/**
 * Field (no Triangle) BOM – aligned with Excel "Field (no Triangle)" sheet.
 * Galva configuration: schroefpaal 1000/1500, L-stuk, profiles, clamps, no triangle pieces.
 */

import { products } from "../data/data";
import { quantityFromNeeded, systemDimensionsM, railPieces6m } from "./roofUtils";

export interface FieldNoTriangleRoofProps {
    rows: number;
    columns: number;
    height: number;
    width: number;
    /** Pile length: 1000, 1500, or split (e.g. 1000/1500) */
    schroefpaalLength?: 1000 | 1500 | "1000/1500";
    profilesColor?: "ALU" | "BLACK";
    clamps?: "ALU" | "BLACK";
}

export type FieldNoTriangleRoofBomItem = {
    code: string;
    quantity: number;
    description?: string;
    needed: number;
    pack: number;
};

export function fieldNoTriangleRoof(props: FieldNoTriangleRoofProps): FieldNoTriangleRoofBomItem[] {
    const rows = props.rows;
    const columns = props.columns;
    const { widthM, heightM } = systemDimensionsM(rows, columns, props.width, props.height);
    const panelCount = rows * columns;
    const schroefpaal = props.schroefpaalLength ?? "1000/1500";
    const profilesColor = props.profilesColor ?? "ALU";
    const clamps = props.clamps ?? "ALU";

    const bom: FieldNoTriangleRoofBomItem[] = [];
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

    // Excel 10 rows, 1 col: 5×1000, 5×1500 schroefpaal (half each when 1000/1500)
    const needPiles = Math.max(rows, columns) * Math.min(rows, columns);
    if (schroefpaal === 1000) {
        push("1FLD45GA005", needPiles);
    } else if (schroefpaal === 1500) {
        push("1FLD45GA004", needPiles);
    } else {
        const half = Math.ceil(needPiles / 2);
        push("1FLD45GA005", half);
        push("1FLD45GA004", needPiles - half);
    }

    // L-stuk dakhaak: 2 per row (or per column) – Excel 20 for 10×1
    const needLstuk = rows > columns ? rows * 2 : columns * 2;
    push("1HME15AC003", needLstuk);

    // Profiel grote overspanning: Excel 4 for 10×1 → 2*min(rows,cols) when narrow
    const needGroteOverspanning = columns <= 2 ? 2 * columns + 2 : 2 * Math.max(rows, columns);
    push("1HME43AL006", needGroteOverspanning);

    // Profielverbinder: Excel 2 for 10×1
    const needVerbinder = columns === 1 ? 2 : Math.max(1, Math.floor(Math.min(rows, columns) / 2));
    push(profilesColor === "ALU" ? "1HMEACPV001" : "1HMEACPV002", needVerbinder);

    // M10, kartelmoer: Excel 34 = needMiddenklem 18 + needVerbinder*8
    const needMiddenklem = (rows - 1) * columns * 2 + (columns - 1) * rows * 2;
    const needM10 = needMiddenklem + needVerbinder * 8;
    push("1HME10BT037", needM10);
    push("1HME10MR001", needM10);

    // Klikmiddenklem, klikeindklem – Excel 18, 4 for 10×1 (eindklem 4 when single column)
    const needEindklem = columns === 1 ? 4 : (rows > columns ? rows * 2 : columns * 2);
    push(clamps === "ALU" ? "1HME32KK003" : "1HME32KK004", needMiddenklem);
    push(clamps === "ALU" ? "1HME32KK024" : "1HME32KK025", needEindklem);

    push("8ZZZBM99005", 1);

    return bom;
}
