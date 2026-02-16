/**
 * Mounting Anchor BOM – aligned with Excel "Mounting Anchor" sheet.
 * Roof structure (EPDM/TPO/PVC, bitumen), connection (plate), material (concrete, wood/steel), screws, profiles (FEATHER/HOUSE, color), clamps.
 */

import { products } from "../data/data";
import { quantityFromNeeded, systemDimensionsM, railPieces6m } from "./roofUtils";

export interface MountingAnchorRoofProps {
    rows: number;
    columns: number;
    height: number;
    width: number;
    /** Profile/rail direction. HORIZONTAL = rails along width; VERTICAL = along height. Default HORIZONTAL. */
    profilePosition?: "HORIZONTAL" | "VERTICAL";
    roofStructure?: "EPDM/TPO/PVC" | "bitumen";
    connection?: "PLATE";
    material?: "CONCRETE" | "WOOD/STEEL";
    screwSize?: string;
    profilesType?: "FEATHER" | "HOUSE";
    profilesColor?: "BLACK" | "ALU";
    clamps?: "BLACK" | "ALU";
}

export type MountingAnchorRoofBomItem = {
    code: string;
    quantity: number;
    description?: string;
    needed: number;
    pack: number;
};

export function mountingAnchorRoof(props: MountingAnchorRoofProps): MountingAnchorRoofBomItem[] {
    const rows = props.rows;
    const columns = props.columns;
    const { widthM, heightM, panelCount } = systemDimensionsM(rows, columns, props.width, props.height);
    const profilePosition = props.profilePosition ?? "HORIZONTAL";
    const roofStructure = props.roofStructure ?? "EPDM/TPO/PVC";
    const material = props.material ?? "CONCRETE";
    const profilesColor = props.profilesColor ?? "BLACK";
    const clamps = props.clamps ?? "BLACK";

    const bom: MountingAnchorRoofBomItem[] = [];
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

    const anchorCode = roofStructure === "bitumen" ? "1HME15AN001" : "1HME15AN003";
    push(anchorCode, panelCount);
    push("1HMEACMP002", panelCount);

    const screwCode = material === "CONCRETE" ? "1HME15AS007" : "1HME15AS002";
    push(screwCode, panelCount * 4);

    const railLen = profilePosition === "VERTICAL" ? heightM : widthM;
    const numRails = profilePosition === "VERTICAL" ? columns * 2 : rows * 2;
    const needRails = railPieces6m(railLen, numRails);
    push(profilesColor === "BLACK" ? "1HME43ZW044" : "1HME43AL035", needRails);
    const needVerbinder = Math.max(0, needRails - 1);
    push(profilesColor === "BLACK" ? "1HMEACPV002" : "1HMEACPV001", needVerbinder);

    push("1HME10BT037", panelCount * 2);
    push("1HME10MR001", panelCount * 2);

    const needMiddenklem = profilePosition === "VERTICAL" ? (rows - 1) * columns * 2 : (columns - 1) * rows * 2;
    const needEindklem = profilePosition === "VERTICAL" ? columns * 2 * 2 : rows * 2 * 2;
    push(clamps === "BLACK" ? "1HME32KK004" : "1HME32KK003", needMiddenklem);
    push(clamps === "BLACK" ? "1HME32KK025" : "1HME32KK024", needEindklem);
    push(profilesColor === "BLACK" ? "1HME0ACPS001" : "1HMEACPS002", needEindklem);
    push("1HFR12ZZ003", Math.ceil(panelCount / 50));

    return bom;
}
