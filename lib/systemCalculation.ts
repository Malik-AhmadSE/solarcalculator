import { DISTANCE_TRIANLE_BHIND_END_CLAMP, END_CAP_WIDTH, MIDDLE_END_CLAMP_WIDTH } from "../constants/dataConstant";
import { ROOF_HOOKS } from "../data/RoofTypes";
export interface SystemProps {
    panelOrientation: "LANDSCAPE" | "PORTRAIT";
    panelHeight: number;
    panelWidth: number;
    rows: number;
    columns: number;
    layout: "HORIZONTAL" | "VERTICAL";
}


export const calculateK9 = (props: SystemProps): number => {
    const { panelOrientation, panelHeight, panelWidth, rows, layout } = props;
    const dimension = panelOrientation === "LANDSCAPE" ? panelHeight : panelWidth;
    const extraLength = layout === "HORIZONTAL"
        ? (DISTANCE_TRIANLE_BHIND_END_CLAMP * rows + DISTANCE_TRIANLE_BHIND_END_CLAMP)
        : 0;

    return (dimension * rows + extraLength) / 1000;
};


export const calculateK10 = (props: SystemProps): number => {
    const { panelOrientation, panelHeight, panelWidth, columns, layout } = props;

    const dimension = panelOrientation === "LANDSCAPE" ? panelWidth : panelHeight;

    const extraLength = layout === "VERTICAL"
        ? (END_CAP_WIDTH * columns + END_CAP_WIDTH)
        : 0;

    return (dimension * columns + extraLength) / 1000;
};

export const SystemWidth = (props: SystemProps): number => {
    const k9 = calculateK9(props);

    const extra =
        props.layout === "HORIZONTAL"
            ? (END_CAP_WIDTH / 1000) * 2
            : 0;

    return k9 + extra;
};

export const SystemHeight = (props: SystemProps): number => {
    const k10 = calculateK10(props);

    const extra =
        props.layout === "VERTICAL"
            ? (END_CAP_WIDTH / 1000) * 2
            : 0;

    return k10 + extra;
};

export function lookupRoofHook(roofing: string, hookType: string) {
    for (const group of ROOF_HOOKS) {
        // Check if this group contains the requested roofing type
        if (group[roofing as keyof typeof group]) {
            const hooks = group[roofing as keyof typeof group];

            const found = hooks.find(
                (item: any) => item.type === hookType
            );

            if (found) {
                return found.product;
            }
        }
    }

    return "";
}

