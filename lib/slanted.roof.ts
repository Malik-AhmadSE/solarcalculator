
import { END_CAP_WIDTH, DISTANCE_TRIANLE_BHIND_END_CLAMP } from "../constants/dataConstant";
import { products } from "../data/data";
import { lookupRoofHook } from "./systemCalculation";
import {
    type SlantedSystemContext,
    getCodeRow2,
    getCodeRow3,
    getCodeRow4,
    getCodeRow5,
    getCodeRow6,
    getCodeRow7,
    getCodeRow8,
    getCodeRow9,
} from "./slantedRoofConfig";
import {
    computeSystemDimensionsM,
    computeAllNeeded,
    quantityFromNeeded,
    type NeededMap,
} from "./slantedRoofQuantities";

export interface SlantedRoofProps {
    panelOrientation: "landscape" | "portrait";
    /** Profile/rail direction (Excel A13). If not set, derived from panelOrientation: landscape→HORIZONTAL, portrait→VERTICAL. */
    profilePosition?: "HORIZONTAL" | "VERTICAL";
    rows: number;
    columns: number;
    height: number;
    width: number;
    roofing: "TILED" | "SLATES" | "ZINC";
    roofHook: string;
    profileType: "HOUSE" | "FEATHER";
    profileColor: "ALU" | "BLACK";
    clamps: "ALU" | "BLACK";
    Thickness: number;
}

type GetCodeFn = (props: SlantedRoofProps) => string;
type NeededKey = keyof NeededMap;

interface BomLineDef {
    id: string;
    getCode: GetCodeFn;
    neededKey: NeededKey;
    /** If true, skip this line when code is empty (don't push empty row). */
    optional?: boolean;
}

function buildContext(props: SlantedRoofProps): SlantedSystemContext {
    const layout =
        props.profilePosition ??
        (props.panelOrientation === "landscape" ? "HORIZONTAL" : "VERTICAL");
    const panelOrientation = props.panelOrientation === "landscape" ? "LANDSCAPE" : "PORTRAIT";
    const { systemWidthM, systemHeightM } = computeSystemDimensionsM(
        panelOrientation,
        props.height,
        props.width,
        props.rows,
        props.columns,
        layout,
        END_CAP_WIDTH,
        DISTANCE_TRIANLE_BHIND_END_CLAMP
    );
    return {
        layout,
        systemWidthM,
        systemHeightM,
        rows: props.rows,
        columns: props.columns,
        roofing: props.roofing,
        roofHook: props.roofHook,
        profileType: props.profileType,
        profileColor: props.profileColor,
        clamps: props.clamps,
        thickness: props.Thickness,
    };
}

/** Roof hook code from roofing + roofHook (ROOF_HOOKS lookup). */
function getCodeRoofHook(props: SlantedRoofProps): string {
    const product = lookupRoofHook(props.roofing, props.roofHook);
    const code = product.split("]")[0].replace("[", "").trim();
    return code || "";
}

const BOM_LINES: BomLineDef[] = [
    { id: "roofHook", getCode: getCodeRoofHook, neededKey: "roofHook" },
    { id: "row2", getCode: getCodeRow2, neededKey: "row2" },
    { id: "row3", getCode: getCodeRow3, neededKey: "row3" },
    { id: "row4", getCode: getCodeRow4, neededKey: "row4" },
    { id: "row5", getCode: getCodeRow5, neededKey: "row5" },
    { id: "row6", getCode: getCodeRow6, neededKey: "row6" },
    { id: "row7", getCode: getCodeRow7, neededKey: "middleClamps" },
    { id: "row8", getCode: getCodeRow8, neededKey: "endClamps" },
    { id: "row9", getCode: getCodeRow9, neededKey: "row9Clamps", optional: true },
];

export function slantedRoof(props: SlantedRoofProps) {
    const ctx = buildContext(props);
    const neededs = computeAllNeeded(ctx);
    const bom: { code: string; quantity: number; description?: string; needed: number; pack: number }[] = [];

    for (const line of BOM_LINES) {
        const code = line.getCode(props);
        if (!code && line.optional) continue;
        if (!code) continue;

        const needed = neededs[line.neededKey];
        const product = products.find((p) => p.code === code);
        const pack = product?.pack ?? 1;
        const quantity = quantityFromNeeded(needed, pack);
        const description =
            product?.description ??
            (line.id === "roofHook" ? lookupRoofHook(props.roofing, props.roofHook) : undefined);

        bom.push({
            code,
            quantity,
            description,
            needed,
            pack,
        });
    }

    return bom;
}
