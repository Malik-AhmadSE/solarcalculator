/**
 * Field (no Triangle) BOM – aligned with Excel "Field (no Triangle)" sheet.
 * Galva configuration: schroefpaal 1000/1500, L-stuk, profiles, clamps, no triangle pieces.
 */

import { products } from "../data/data";
import { quantityFromNeeded } from "./roofUtils";

export interface FieldNoTriangleRoofProps {
    rows: number;
    columns: number;
    height: number;
    width: number;
    /** Pile length: 1000, 1500, or split (e.g. 1000/1500) */
    schroefpaalLength?: 750 | 1000 | 1500 | "750/1000" | "1000/1500";
    profilesColor?: "ALU" | "BLACK";
    clamps?: "ALU" | "BLACK";
    thickness?: number;
    /** Multiplier for quantities (how many identical configurations). */
    multiple?: number;
    /** Excel “DEPTH IN GROUND” add-on to selected pile length. */
    depthInGround?: 0 | 100 | 200 | 300;
    /** Excel adjust angle input. (Currently not used in BOM formulas, but kept for UI parity.) */
    angle?: 15 | 20 | 25 | 30;
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
    const thickness = typeof props.thickness === "number" ? props.thickness : 30;
    const schroefpaal = props.schroefpaalLength ?? "1000/1500";
    const clamps = props.clamps ?? "ALU";
    const multiple = Math.max(1, props.multiple ?? 1);
    const depthInGround = props.depthInGround ?? 0;

    const bom: FieldNoTriangleRoofBomItem[] = [];
    const minRC = Math.min(rows, columns);
    const maxRC = Math.max(rows, columns);
    const push = (code: string, needed: number) => {
        const neededWithMultiple = needed * multiple;
        if (!code || neededWithMultiple <= 0) return;
        const product = products.find((p) => p.code === code);
        const pack = product?.pack ?? 1;
        bom.push({
            code,
            quantity: quantityFromNeeded(neededWithMultiple, pack),
            description: product?.description,
            needed: neededWithMultiple,
            pack,
        });
    };

    const galvaCodeForActualLength = (actualLenMm: number) => {
        // Excel has only 3 galva SKUs for this config: 750 / 1000 / 1500.
        // With DEPTH IN GROUND, we add the depth to the selected base length and then map:
        // <= 750 -> 750, <= 1000 -> 1000, else -> 1500.
        if (actualLenMm <= 750) return "1FLD45GA002"; // 750
        if (actualLenMm <= 1000) return "1FLD45GA005"; // 1000
        return "1FLD45GA004"; // 1500
    };

    // Excel 10 rows, 1 col: 5×1000, 5×1500 schroefpaal (half each when 1000/1500)
    const needPiles = maxRC * minRC;
    if (schroefpaal === 750) {
        push(galvaCodeForActualLength(750 + depthInGround), needPiles);
    } else if (schroefpaal === 1000) {
        push(galvaCodeForActualLength(1000 + depthInGround), needPiles);
    } else if (schroefpaal === 1500) {
        push(galvaCodeForActualLength(1500 + depthInGround), needPiles);
    } else if (schroefpaal === "750/1000") {
        const half = Math.ceil(needPiles / 2);
        push(galvaCodeForActualLength(750 + depthInGround), half);
        push(galvaCodeForActualLength(1000 + depthInGround), needPiles - half);
    } else {
        // "1000/1500"
        const half = Math.ceil(needPiles / 2);
        push(galvaCodeForActualLength(1000 + depthInGround), half);
        push(galvaCodeForActualLength(1500 + depthInGround), needPiles - half);
    }

    // L-stuk dakhaak: 2 per row (or per column) – Excel 20 for 10×1
    const needLstuk = maxRC * 2;
    push("1HME15AC003", needLstuk);

    // Profiel grote overspanning: Excel 4 for 10×1 → 2*min(rows,cols) when narrow
    const needGroteOverspanning = minRC <= 2 ? 2 * minRC + 2 : 2 * maxRC;
    push("1HME43AL006", needGroteOverspanning);

    // Profielverbinder: Excel 2 for 10×1
    const needVerbinder = minRC === 1 ? 2 : Math.max(1, Math.floor(minRC / 2));
    // Excel: connector is always ALU for this configuration.
    push("1HMEACPV001", needVerbinder);

    // M10, kartelmoer: Excel 34 = needMiddenklem 18 + needVerbinder*8
    const needMiddenklem = (rows - 1) * columns * 2 + (columns - 1) * rows * 2;
    const needM10 = needMiddenklem + needVerbinder * 8;
    push("1HME10BT037", needM10);
    push("1HME10MR001", needM10);

    // Klikmiddenklem, klikeindklem – Excel 18, 4 for 10×1 (eindklem 4 when single column)
    const needEindklem = minRC === 1 ? 4 : 2 * maxRC;
    push(clamps === "ALU" ? "1HME32KK003" : "1HME32KK004", needMiddenklem);
    // klikeindklem depends on thickness (Excel "hoogte" 30 vs 35mm).
    if (clamps === "ALU") {
        push(thickness > 30 ? "1HME32KK010" : "1HME32KK024", needEindklem);
    } else {
        push(thickness > 30 ? "1HME32KK016" : "1HME32KK025", needEindklem);
    }

    // sluitstop voor profile depends on clamp color (Excel product line 17).
    push(clamps === "ALU" ? "1HMEACPS002" : "1HME0ACPS001", needEindklem);

    push("8ZZZBM99005", 1);

    return bom;
}
