/**
 * Single entry point for BOM calculation by roof type.
 * Dispatches to the right calculator; returns a unified BomItem[].
 */

import type { RoofType } from "./roofTypes";
import { slantedRoof, type SlantedRoofProps } from "./slanted.roof";
import { flatRoof, type FlatRoofProps } from "./flat.roof";
import { fieldRoof, type FieldRoofProps } from "./field.roof";
import { fieldNoTriangleRoof, type FieldNoTriangleRoofProps } from "./fieldNoTriangle.roof";
import { steeldeckRoof, type SteeldeckRoofProps } from "./steeldeck.roof";
import { steeldeckSolarspeedRoof, type SteeldeckSolarspeedRoofProps } from "./steeldeckSolarspeed.roof";
import { steeldeckTriangleRoof, type SteeldeckTriangleRoofProps } from "./steeldeckTriangle.roof";
import { mountingAnchorRoof, type MountingAnchorRoofProps } from "./mountingAnchor.roof";

export type BomItem = {
    code: string;
    quantity: number;
    description?: string;
    needed: number;
    pack: number;
};

/** Shared props: base dimensions plus optional fields per roof. Pass full props so each roof gets its options. */
export type CommonRoofProps =
    | SlantedRoofProps
    | FlatRoofProps
    | FieldRoofProps
    | FieldNoTriangleRoofProps
    | SteeldeckRoofProps
    | SteeldeckSolarspeedRoofProps
    | SteeldeckTriangleRoofProps
    | MountingAnchorRoofProps;

export function calculateBOM(roofType: RoofType, props: CommonRoofProps): BomItem[] {
    const base = {
        rows: props.rows,
        columns: props.columns,
        height: props.height,
        width: props.width,
    };

    switch (roofType) {
        case "Slanted Roof":
            return slantedRoof(props as SlantedRoofProps);
        case "Flat Roof":
            return flatRoof(props as FlatRoofProps);
        case "Field":
            return fieldRoof(props as FieldRoofProps);
        case "Field (no Triangle)":
            return fieldNoTriangleRoof(props as FieldNoTriangleRoofProps);
        case "Steeldeck":
            return steeldeckRoof(props as SteeldeckRoofProps);
        case "Steeldeck Solarspeed":
            return steeldeckSolarspeedRoof(props as SteeldeckSolarspeedRoofProps);
        case "Steeldeck Triangle":
            return steeldeckTriangleRoof(props as SteeldeckTriangleRoofProps);
        case "Mounting Anchor":
            return mountingAnchorRoof(props as MountingAnchorRoofProps);
        default: {
            const _: never = roofType;
            return [];
        }
    }
}

/** Whether this roof type has full config (Slanted) vs only rows/columns/dimensions. */
export function roofTypeUsesFullConfig(roofType: RoofType): boolean {
    return roofType === "Slanted Roof";
}
