"use client";

import React, { useMemo, useState } from "react";
import type { SlantedRoofProps } from "@/lib/slanted.roof";
import type { FlatRoofProps } from "@/lib/flat.roof";
import type { FieldRoofProps } from "@/lib/field.roof";
import type { FieldNoTriangleRoofProps } from "@/lib/fieldNoTriangle.roof";
import type { SteeldeckRoofProps } from "@/lib/steeldeck.roof";
import type { SteeldeckSolarspeedRoofProps } from "@/lib/steeldeckSolarspeed.roof";
import type { SteeldeckTriangleRoofProps } from "@/lib/steeldeckTriangle.roof";
import type { MountingAnchorRoofProps } from "@/lib/mountingAnchor.roof";
import { ROOF_TYPES, type RoofType } from "@/lib/roofTypes";
import { calculateBOM, type BomItem, type CommonRoofProps } from "@/lib/calculateBOM";

/** Single state for all roof configs; only the active roof's fields are used. */
interface RoofConfigState {
    rows: number;
    columns: number;
    height: number;
    width: number;
    panelOrientation: "landscape" | "portrait";
    roofing: "TILED" | "SLATES" | "ZINC";
    roofHook: string;
    profileType: "HOUSE" | "FEATHER";
    profileColor: "ALU" | "BLACK";
    clamps: "ALU" | "BLACK";
    Thickness: number;
    orientation: "SOUTH" | "EAST_WEST" | "LANDSCAPE" | "PORTRAIT";
    thickness: number;
    triangleWidth: 1500 | 1600;
    profilesColor: "ALU" | "BLACK";
    profilesType: "FEATHER" | "HOUSE";
    steelDeckType: "15cm" | "40cm" | "Connecting";
    schroefpaalLength: 1000 | 1500 | "1000/1500";
    roofStructure: "EPDM/TPO/PVC" | "bitumen";
    material: "CONCRETE" | "WOOD/STEEL";
    /** Profile/rail direction (Excel profile position). Used by Slanted, Steeldeck, Steeldeck Triangle, Mounting Anchor. */
    profilePosition: "HORIZONTAL" | "VERTICAL";
}

const defaultConfig: RoofConfigState = {
    rows: 5,
    columns: 7,
    height: 1722,
    width: 1134,
    panelOrientation: "portrait",
    roofing: "SLATES",
    roofHook: "NORMAL",
    profileType: "FEATHER",
    profileColor: "BLACK",
    clamps: "BLACK",
    Thickness: 30,
    orientation: "SOUTH",
    thickness: 30,
    triangleWidth: 1500,
    profilesColor: "ALU",
    profilesType: "FEATHER",
    steelDeckType: "15cm",
    schroefpaalLength: "1000/1500",
    roofStructure: "EPDM/TPO/PVC",
    material: "CONCRETE",
    profilePosition: "VERTICAL",
};

function buildProps(roofType: RoofType, s: RoofConfigState): CommonRoofProps {
    const base = { rows: s.rows, columns: s.columns, height: s.height, width: s.width };
    switch (roofType) {
        case "Slanted Roof":
            return {
                ...base,
                panelOrientation: s.panelOrientation,
                profilePosition: s.profilePosition,
                roofing: s.roofing,
                roofHook: s.roofHook,
                profileType: s.profileType,
                profileColor: s.profileColor,
                clamps: s.clamps,
                Thickness: s.Thickness,
            } as SlantedRoofProps;
        case "Flat Roof":
            return {
                ...base,
                orientation: s.orientation as "SOUTH" | "EAST_WEST",
                clamps: s.clamps,
                thickness: s.thickness,
                triangleWidth: s.triangleWidth,
            } as FlatRoofProps;
        case "Field":
            return {
                ...base,
                orientation: (s.orientation === "PORTRAIT" || s.orientation === "LANDSCAPE") ? s.orientation : "LANDSCAPE",
                profilesColor: s.profilesColor,
                clamps: s.clamps,
            } as FieldRoofProps;
        case "Field (no Triangle)":
            return {
                ...base,
                schroefpaalLength: s.schroefpaalLength,
                profilesColor: s.profilesColor,
                clamps: s.clamps,
            } as FieldNoTriangleRoofProps;
        case "Steeldeck":
            return {
                ...base,
                profilePosition: s.profilePosition,
                steelDeckType: s.steelDeckType,
                profilesType: s.profilesType,
                profilesColor: s.profilesColor,
                clamps: s.clamps,
                thickness: s.thickness,
            } as SteeldeckRoofProps;
        case "Steeldeck Solarspeed":
            return {
                ...base,
                orientation: s.orientation as "SOUTH" | "EAST_WEST",
                triangleWidth: s.triangleWidth,
                steelDeckType: s.steelDeckType as "15cm" | "40cm",
                clamps: s.clamps,
                thickness: s.thickness,
            } as SteeldeckSolarspeedRoofProps;
        case "Steeldeck Triangle":
            return {
                ...base,
                profilePosition: s.profilePosition,
                profilesColor: s.profilesColor,
                clamps: s.clamps,
                thickness: s.thickness,
            } as SteeldeckTriangleRoofProps;
        case "Mounting Anchor":
            return {
                ...base,
                profilePosition: s.profilePosition,
                roofStructure: s.roofStructure,
                material: s.material,
                profilesType: s.profilesType,
                profilesColor: s.profilesColor,
                clamps: s.clamps,
            } as MountingAnchorRoofProps;
        default:
            return base;
    }
}

const inputClass =
    "w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

function ConfigField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</label>
            {children}
        </div>
    );
}

const TestBOMPage = () => {
    const [roofType, setRoofType] = useState<RoofType>("Slanted Roof");
    const [config, setConfig] = useState<RoofConfigState>(defaultConfig);

    const update = (key: keyof RoofConfigState, value: number | string) => {
        setConfig((c) => ({ ...c, [key]: value }));
    };

    const props = useMemo(() => buildProps(roofType, config), [roofType, config]);
    const bom: BomItem[] = useMemo(() => calculateBOM(roofType, props), [roofType, props]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        BOM Calculator – All Roof Types
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Select a roof type, change the configuration, and see the Bill of Materials update.
                    </p>
                </header>

                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full inline-block" />
                        Roof type
                    </h2>
                    <select
                        value={roofType}
                        onChange={(e) => setRoofType(e.target.value as RoofType)}
                        className="max-w-md rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                        {ROOF_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </section>

                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-amber-500 rounded-full inline-block" />
                        Configuration
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* Common */}
                        <ConfigField label="Rows">
                            <input
                                type="number"
                                min={1}
                                value={config.rows}
                                onChange={(e) => update("rows", parseInt(e.target.value, 10) || 1)}
                                className={inputClass}
                            />
                        </ConfigField>
                        <ConfigField label="Columns">
                            <input
                                type="number"
                                min={1}
                                value={config.columns}
                                onChange={(e) => update("columns", parseInt(e.target.value, 10) || 1)}
                                className={inputClass}
                            />
                        </ConfigField>
                        <ConfigField label="Panel width (mm)">
                            <input
                                type="number"
                                min={1}
                                value={config.width}
                                onChange={(e) => update("width", parseInt(e.target.value, 10) || 1)}
                                className={inputClass}
                            />
                        </ConfigField>
                        <ConfigField label="Panel height (mm)">
                            <input
                                type="number"
                                min={1}
                                value={config.height}
                                onChange={(e) => update("height", parseInt(e.target.value, 10) || 1)}
                                className={inputClass}
                            />
                        </ConfigField>

                        {/* Slanted */}
                        {(roofType === "Slanted Roof" && (
                            <>
                                <ConfigField label="Panel orientation">
                                    <select
                                        value={config.panelOrientation}
                                        onChange={(e) => update("panelOrientation", e.target.value as "landscape" | "portrait")}
                                        className={inputClass}
                                    >
                                        <option value="landscape">Landscape</option>
                                        <option value="portrait">Portrait</option>
                                    </select>
                                </ConfigField>
                                <ConfigField label="Roofing">
                                    <select
                                        value={config.roofing}
                                        onChange={(e) => update("roofing", e.target.value as "TILED" | "SLATES" | "ZINC")}
                                        className={inputClass}
                                    >
                                        <option value="TILED">Tiled</option>
                                        <option value="SLATES">Slates</option>
                                        <option value="ZINC">Zinc</option>
                                    </select>
                                </ConfigField>
                                <ConfigField label="Roof hook">
                                    <input
                                        type="text"
                                        value={config.roofHook}
                                        onChange={(e) => update("roofHook", e.target.value)}
                                        className={inputClass}
                                        placeholder="NORMAL, HYBRID..."
                                    />
                                </ConfigField>
                                <ConfigField label="Profile type">
                                    <select
                                        value={config.profileType}
                                        onChange={(e) => update("profileType", e.target.value as "HOUSE" | "FEATHER")}
                                        className={inputClass}
                                    >
                                        <option value="HOUSE">House</option>
                                        <option value="FEATHER">Feather</option>
                                    </select>
                                </ConfigField>
                                <ConfigField label="Profile color">
                                    <select
                                        value={config.profileColor}
                                        onChange={(e) => update("profileColor", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Alu</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </ConfigField>
                                <ConfigField label="Profile position">
                                    <select
                                        value={config.profilePosition}
                                        onChange={(e) => update("profilePosition", e.target.value as "HORIZONTAL" | "VERTICAL")}
                                        className={inputClass}
                                    >
                                        <option value="HORIZONTAL">Horizontal</option>
                                        <option value="VERTICAL">Vertical</option>
                                    </select>
                                </ConfigField>
                                <ConfigField label="Clamps">
                                    <select
                                        value={config.clamps}
                                        onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Alu</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </ConfigField>
                                <ConfigField label="Thickness (mm)">
                                    <input
                                        type="number"
                                        min={1}
                                        value={config.Thickness}
                                        onChange={(e) => update("Thickness", parseInt(e.target.value, 10) || 30)}
                                        className={inputClass}
                                    />
                                </ConfigField>
                            </>
                        )) ||
                            /* Flat */
                            (roofType === "Flat Roof" && (
                                <>
                                    <ConfigField label="Orientation">
                                        <select
                                            value={config.orientation}
                                            onChange={(e) => update("orientation", e.target.value as "SOUTH" | "EAST_WEST")}
                                            className={inputClass}
                                        >
                                            <option value="SOUTH">South</option>
                                            <option value="EAST_WEST">East / West</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Clamps">
                                        <select
                                            value={config.clamps}
                                            onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                            className={inputClass}
                                        >
                                            <option value="ALU">Alu</option>
                                            <option value="BLACK">Black</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Thickness (mm)">
                                        <input
                                            type="number"
                                            min={1}
                                            value={config.thickness}
                                            onChange={(e) => update("thickness", parseInt(e.target.value, 10) || 30)}
                                            className={inputClass}
                                        />
                                    </ConfigField>
                                    <ConfigField label="Triangle width (mm)">
                                        <select
                                            value={config.triangleWidth}
                                            onChange={(e) => update("triangleWidth", parseInt(e.target.value, 10) as 1500 | 1600)}
                                            className={inputClass}
                                        >
                                            <option value={1500}>1500</option>
                                            <option value={1600}>1600</option>
                                        </select>
                                    </ConfigField>
                                </>
                            )) ||
                            /* Field */
                            (roofType === "Field" && (
                                <>
                                    <ConfigField label="Orientation">
                                        <select
                                            value={config.orientation}
                                            onChange={(e) => update("orientation", e.target.value as "LANDSCAPE" | "PORTRAIT")}
                                            className={inputClass}
                                        >
                                            <option value="LANDSCAPE">Landscape</option>
                                            <option value="PORTRAIT">Portrait</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Profiles color">
                                        <select
                                            value={config.profilesColor}
                                            onChange={(e) => update("profilesColor", e.target.value as "ALU" | "BLACK")}
                                            className={inputClass}
                                        >
                                            <option value="ALU">Alu</option>
                                            <option value="BLACK">Black</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Clamps">
                                        <select
                                            value={config.clamps}
                                            onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                            className={inputClass}
                                        >
                                            <option value="ALU">Alu</option>
                                            <option value="BLACK">Black</option>
                                        </select>
                                    </ConfigField>
                                </>
                            )) ||
                            /* Field (no Triangle) */
                            (roofType === "Field (no Triangle)" && (
                                <>
                                    <ConfigField label="Schroefpaal length">
                                        <select
                                            value={config.schroefpaalLength}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                update("schroefpaalLength", v === "1000/1500" ? v : parseInt(v, 10) as 1000 | 1500);
                                            }}
                                            className={inputClass}
                                        >
                                            <option value="1000">1000 mm</option>
                                            <option value="1500">1500 mm</option>
                                            <option value="1000/1500">1000/1500</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Profiles color">
                                        <select
                                            value={config.profilesColor}
                                            onChange={(e) => update("profilesColor", e.target.value as "ALU" | "BLACK")}
                                            className={inputClass}
                                        >
                                            <option value="ALU">Alu</option>
                                            <option value="BLACK">Black</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Clamps">
                                        <select
                                            value={config.clamps}
                                            onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                            className={inputClass}
                                        >
                                            <option value="ALU">Alu</option>
                                            <option value="BLACK">Black</option>
                                        </select>
                                    </ConfigField>
                                </>
                            )) ||
                            /* Steeldeck */
                            (roofType === "Steeldeck" && (
                                <>
                                    <ConfigField label="Profile position">
                                        <select
                                            value={config.profilePosition}
                                            onChange={(e) => update("profilePosition", e.target.value as "HORIZONTAL" | "VERTICAL")}
                                            className={inputClass}
                                        >
                                            <option value="HORIZONTAL">Horizontal</option>
                                            <option value="VERTICAL">Vertical</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Steel deck type">
                                        <select
                                            value={config.steelDeckType}
                                            onChange={(e) => update("steelDeckType", e.target.value as "15cm" | "40cm" | "Connecting")}
                                            className={inputClass}
                                        >
                                            <option value="15cm">15 cm</option>
                                            <option value="40cm">40 cm</option>
                                            <option value="Connecting">Connecting</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Profiles type">
                                        <select
                                            value={config.profilesType}
                                            onChange={(e) => update("profilesType", e.target.value as "FEATHER" | "HOUSE")}
                                            className={inputClass}
                                        >
                                            <option value="HOUSE">House</option>
                                            <option value="FEATHER">Feather</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Profiles color">
                                        <select
                                            value={config.profilesColor}
                                            onChange={(e) => update("profilesColor", e.target.value as "ALU" | "BLACK")}
                                            className={inputClass}
                                        >
                                            <option value="ALU">Alu</option>
                                            <option value="BLACK">Black</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Clamps">
                                        <select
                                            value={config.clamps}
                                            onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                            className={inputClass}
                                        >
                                            <option value="ALU">Alu</option>
                                            <option value="BLACK">Black</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Thickness (mm)">
                                        <input
                                            type="number"
                                            min={1}
                                            value={config.thickness}
                                            onChange={(e) => update("thickness", parseInt(e.target.value, 10) || 30)}
                                            className={inputClass}
                                        />
                                    </ConfigField>
                                </>
                            )) ||
                            /* Steeldeck Solarspeed */
                            (roofType === "Steeldeck Solarspeed" && (
                                <>
                                    <ConfigField label="Orientation">
                                        <select
                                            value={config.orientation}
                                            onChange={(e) => update("orientation", e.target.value as "SOUTH" | "EAST_WEST")}
                                            className={inputClass}
                                        >
                                            <option value="SOUTH">South</option>
                                            <option value="EAST_WEST">East / West</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Triangle width (mm)">
                                        <select
                                            value={config.triangleWidth}
                                            onChange={(e) => update("triangleWidth", parseInt(e.target.value, 10) as 1500 | 1600)}
                                            className={inputClass}
                                        >
                                            <option value={1500}>1500</option>
                                            <option value={1600}>1600</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Steel deck type">
                                        <select
                                            value={config.steelDeckType}
                                            onChange={(e) => update("steelDeckType", e.target.value as "15cm" | "40cm")}
                                            className={inputClass}
                                        >
                                            <option value="15cm">15 cm</option>
                                            <option value="40cm">40 cm</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Clamps">
                                        <select
                                            value={config.clamps}
                                            onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                            className={inputClass}
                                        >
                                            <option value="ALU">Alu</option>
                                            <option value="BLACK">Black</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Thickness (mm)">
                                        <input
                                            type="number"
                                            min={1}
                                            value={config.thickness}
                                            onChange={(e) => update("thickness", parseInt(e.target.value, 10) || 30)}
                                            className={inputClass}
                                        />
                                    </ConfigField>
                                </>
                            )) ||
                            /* Steeldeck Triangle */
                            (roofType === "Steeldeck Triangle" && (
                                <>
                                    <ConfigField label="Profile position">
                                        <select
                                            value={config.profilePosition}
                                            onChange={(e) => update("profilePosition", e.target.value as "HORIZONTAL" | "VERTICAL")}
                                            className={inputClass}
                                        >
                                            <option value="HORIZONTAL">Horizontal</option>
                                            <option value="VERTICAL">Vertical</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Profiles color">
                                        <select
                                            value={config.profilesColor}
                                            onChange={(e) => update("profilesColor", e.target.value as "ALU" | "BLACK")}
                                            className={inputClass}
                                        >
                                            <option value="ALU">Alu</option>
                                            <option value="BLACK">Black</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Clamps">
                                        <select
                                            value={config.clamps}
                                            onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                            className={inputClass}
                                        >
                                            <option value="ALU">Alu</option>
                                            <option value="BLACK">Black</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Thickness (mm)">
                                        <input
                                            type="number"
                                            min={1}
                                            value={config.thickness}
                                            onChange={(e) => update("thickness", parseInt(e.target.value, 10) || 30)}
                                            className={inputClass}
                                        />
                                    </ConfigField>
                                </>
                            )) ||
                            /* Mounting Anchor */
                            (roofType === "Mounting Anchor" && (
                                <>
                                    <ConfigField label="Profile position">
                                        <select
                                            value={config.profilePosition}
                                            onChange={(e) => update("profilePosition", e.target.value as "HORIZONTAL" | "VERTICAL")}
                                            className={inputClass}
                                        >
                                            <option value="HORIZONTAL">Horizontal</option>
                                            <option value="VERTICAL">Vertical</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Roof structure">
                                        <select
                                            value={config.roofStructure}
                                            onChange={(e) => update("roofStructure", e.target.value as "EPDM/TPO/PVC" | "bitumen")}
                                            className={inputClass}
                                        >
                                            <option value="EPDM/TPO/PVC">EPDM/TPO/PVC</option>
                                            <option value="bitumen">Bitumen</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Material">
                                        <select
                                            value={config.material}
                                            onChange={(e) => update("material", e.target.value as "CONCRETE" | "WOOD/STEEL")}
                                            className={inputClass}
                                        >
                                            <option value="CONCRETE">Concrete</option>
                                            <option value="WOOD/STEEL">Wood / Steel</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Profiles type">
                                        <select
                                            value={config.profilesType}
                                            onChange={(e) => update("profilesType", e.target.value as "FEATHER" | "HOUSE")}
                                            className={inputClass}
                                        >
                                            <option value="FEATHER">Feather</option>
                                            <option value="HOUSE">House</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Profiles color">
                                        <select
                                            value={config.profilesColor}
                                            onChange={(e) => update("profilesColor", e.target.value as "ALU" | "BLACK")}
                                            className={inputClass}
                                        >
                                            <option value="ALU">Alu</option>
                                            <option value="BLACK">Black</option>
                                        </select>
                                    </ConfigField>
                                    <ConfigField label="Clamps">
                                        <select
                                            value={config.clamps}
                                            onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                            className={inputClass}
                                        >
                                            <option value="ALU">Alu</option>
                                            <option value="BLACK">Black</option>
                                        </select>
                                    </ConfigField>
                                </>
                            ))}
                    </div>
                </section>

                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block" />
                            Bill of Materials – {roofType}
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-right">Needed</th>
                                    <th className="px-6 py-4 text-right">Pack</th>
                                    <th className="px-6 py-4 text-right">Quantity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {bom.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-blue-400">{item.code}</td>
                                        <td className="px-6 py-4 text-slate-300 max-w-md">{item.description}</td>
                                        <td className="px-6 py-4 text-right text-slate-300">{item.needed}</td>
                                        <td className="px-6 py-4 text-right text-slate-300">{item.pack}</td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-400">{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TestBOMPage;
