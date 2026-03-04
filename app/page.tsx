"use client";
import Image from "next/image"
import React, { useMemo, useState } from "react";
import {
    Home as SlantedIcon,
    LayoutGrid as FlatIcon,
    TreePine as FieldIcon,
    MountainSnow as FieldNoTriangleIcon,
    Warehouse as SteeldeckIcon,
    Zap as SteeldeckSolarspeedIcon,
    Triangle as SteeldeckTriangleIcon,
    Anchor as MountingAnchorIcon,
} from "lucide-react";
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
import { ROOF_HOOKS } from "@/data/RoofTypes";
import { computeSystemDimensionsM } from "@/lib/slantedRoofQuantities";
import { END_CAP_WIDTH, DISTANCE_TRIANLE_BHIND_END_CLAMP } from "@/constants/dataConstant";
import {
    normalizeOrientationSouthEastWest,
    normalizeOrientationLandscapePortrait,
    normalizeFlatTriangleWidth,
    normalizeSteeldeckSolarspeedTriangleWidth,
} from "@/lib/roofConfigSchema";
import roofConfigFromExcel from "@/data/roof-config-from-excel.json";

const ROOF_SUBTITLES: Record<RoofType, string> = {
    "Slanted Roof": "Tiled, Slate & Zinc Roofs",
    "Flat Roof": "East/West & South Orientation",
    "Field": "Ground Mount with Triangle",
    "Field (no Triangle)": "Ground Mount / Screw Pile System",
    "Steeldeck": "Commercial Metal Roofing",
    "Steeldeck Solarspeed": "Solarspeed South / East-West",
    "Steeldeck Triangle": "Triangle Configuration",
    "Mounting Anchor": "EPDM / Bitumen Mounting",
};

const ROOF_ICONS = {
    "Slanted Roof": SlantedIcon,
    "Flat Roof": FlatIcon,
    "Field": FieldIcon,
    "Field (no Triangle)": FieldNoTriangleIcon,
    "Steeldeck": SteeldeckIcon,
    "Steeldeck Solarspeed": SteeldeckSolarspeedIcon,
    "Steeldeck Triangle": SteeldeckTriangleIcon,
    "Mounting Anchor": MountingAnchorIcon,
} as const;

/** Panel dimensions per roof from Excel (E2=height, E3=width, E6=thickness). Fallbacks when Excel has no E6. */
const ROOF_PANEL_DIMENSIONS: Record<RoofType, { height: number; width: number; thickness: number }> = (() => {
    const roofs = (roofConfigFromExcel as { roofs: Record<string, { inputCells?: Record<string, number | string> }> }).roofs;
    const out = {} as Record<RoofType, { height: number; width: number; thickness: number }>;
    for (const type of ROOF_TYPES) {
        const cells = roofs[type]?.inputCells;
        const e2 = typeof cells?.E2 === "number" ? cells.E2 : 1722;
        const e3 = typeof cells?.E3 === "number" ? cells.E3 : 1134;
        const e6 = typeof cells?.E6 === "number" ? cells.E6 : 30;
        out[type] = { height: e2, width: e3, thickness: e6 };
    }
    return out;
})();

interface ConfigState {
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
    orientation: "SOUTH" | "EAST_WEST" | "LANDSCAPE" | "PORTRAIT";
    thickness: number;
    triangleWidth: 1500 | 1600 | 2450;
    profilesColor: "ALU" | "BLACK";
    profilesType: "FEATHER" | "HOUSE";
    steelDeckType: "15cm" | "40cm" | "Connecting";
    schroefpaalLength: 1000 | 1500 | "1000/1500";
    roofStructure: "EPDM/TPO/PVC" | "bitumen";
    material: "CONCRETE" | "WOOD/STEEL";
    profilePosition: "HORIZONTAL" | "VERTICAL";
}

const initialRoofType: RoofType = "Slanted Roof";
const defaultConfig: ConfigState = {
    rows: 4,
    columns: 6,
    height: ROOF_PANEL_DIMENSIONS[initialRoofType].height,
    width: ROOF_PANEL_DIMENSIONS[initialRoofType].width,
    thickness: ROOF_PANEL_DIMENSIONS[initialRoofType].thickness,
    panelOrientation: "portrait",
    roofing: "TILED",
    roofHook: "NORMAL",
    profileType: "HOUSE",
    profileColor: "ALU",
    clamps: "BLACK",
    orientation: "SOUTH",
    triangleWidth: 1500,
    profilesColor: "ALU",
    profilesType: "HOUSE",
    steelDeckType: "15cm",
    schroefpaalLength: 1000,
    roofStructure: "EPDM/TPO/PVC",
    material: "CONCRETE",
    profilePosition: "VERTICAL",
};

function buildProps(roofType: RoofType, c: ConfigState): CommonRoofProps {
    const base = { rows: c.rows, columns: c.columns, height: c.height, width: c.width };
    switch (roofType) {
        case "Slanted Roof":
            return {
                ...base,
                panelOrientation: c.panelOrientation,
                profilePosition: c.profilePosition,
                roofing: c.roofing,
                roofHook: c.roofHook,
                profileType: c.profileType,
                profileColor: c.profileColor,
                clamps: c.clamps,
                Thickness: c.thickness,
            } as SlantedRoofProps;
        case "Flat Roof": {
            const flatOrientation = c.orientation === "SOUTH" || c.orientation === "EAST_WEST" ? c.orientation : "SOUTH";
            const flatTriangleWidth =
                flatOrientation === "EAST_WEST" ? 2450 : c.triangleWidth === 1600 ? 1600 : 1500;
            return {
                ...base,
                orientation: flatOrientation,
                clamps: c.clamps,
                thickness: c.thickness,
                triangleWidth: flatTriangleWidth,
            } as FlatRoofProps;
        }
        case "Field":
            return {
                ...base,
                orientation: normalizeOrientationLandscapePortrait(c.orientation),
                profilesColor: c.profilesColor,
                clamps: c.clamps,
            } as FieldRoofProps;
        case "Field (no Triangle)":
            return {
                ...base,
                schroefpaalLength: c.schroefpaalLength,
                profilesColor: c.profilesColor,
                clamps: c.clamps,
            } as FieldNoTriangleRoofProps;
        case "Steeldeck":
            return {
                ...base,
                profilePosition: c.profilePosition,
                steelDeckType: c.steelDeckType,
                profilesType: c.profilesType,
                profilesColor: c.profilesColor,
                clamps: c.clamps,
                thickness: c.thickness,
            } as SteeldeckRoofProps;
        case "Steeldeck Solarspeed": {
            const sdOrientation = normalizeOrientationSouthEastWest(c.orientation);
            return {
                ...base,
                orientation: sdOrientation,
                triangleWidth: normalizeSteeldeckSolarspeedTriangleWidth(c.triangleWidth),
                steelDeckType: c.steelDeckType === "40cm" || c.steelDeckType === "15cm" ? c.steelDeckType : "40cm",
                clamps: c.clamps,
                thickness: c.thickness,
            } as SteeldeckSolarspeedRoofProps;
        }
        case "Steeldeck Triangle":
            return {
                ...base,
                profilePosition: c.profilePosition,
                profilesColor: c.profilesColor,
                clamps: c.clamps,
                thickness: c.thickness,
            } as SteeldeckTriangleRoofProps;
        case "Mounting Anchor":
            return {
                ...base,
                profilePosition: c.profilePosition,
                roofStructure: c.roofStructure,
                material: c.material,
                profilesType: c.profilesType,
                profilesColor: c.profilesColor,
                clamps: c.clamps,
            } as MountingAnchorRoofProps;
        default: {
            const _: never = roofType;
            return base;
        }
    }
}

const inputClass =
    "w-full rounded-lg border border-promount-border bg-promount-card px-3 py-2 text-promount-foreground focus:border-promount-primary focus:outline-none focus:ring-1 focus:ring-promount-primary";
const labelClass = "text-sm font-medium text-promount-muted-foreground";

/** Visual solar layout: vertical vs horizontal like Excel (rails direction + panel orientation). */
function SolarLayoutVisual({
    rows,
    columns,
    layout,
    panelOrientation,
}: {
    rows: number;
    columns: number;
    layout: "HORIZONTAL" | "VERTICAL";
    panelOrientation: "portrait" | "landscape";
}) {
    const cellW = panelOrientation === "portrait" ? 14 : 22;
    const cellH = panelOrientation === "portrait" ? 22 : 14;
    const gap = 2;
    const pad = 10;
    const totalW = columns * cellW + (columns - 1) * gap;
    const totalH = rows * cellH + (rows - 1) * gap;
    const w = totalW + pad * 2;
    const h = totalH + pad * 2;

    const railColor = "var(--promount-primary)";
    const panelFill = "var(--promount-accent-muted)";
    const panelStroke = "var(--promount-accent)";

    return (
        <div className="rounded-lg border border-promount-border bg-promount-accent-muted/30 p-3">
            <p className="mb-2 text-xs font-medium text-promount-muted-foreground">
                Layout: <span className="font-semibold text-promount-foreground">{layout}</span> · Panels:{" "}
                <span className="font-semibold text-promount-foreground">{panelOrientation === "portrait" ? "Portrait" : "Landscape"}</span>
            </p>
            <svg viewBox={`0 0 ${w} ${h}`} className="block w-full max-w-[300px]" preserveAspectRatio="xMidYMid meet">
                {/* Rails (Excel: profile/rail direction – HORIZONTAL = rails run left–right, VERTICAL = rails run top–bottom) */}
                {layout === "HORIZONTAL" &&
                    Array.from({ length: rows + 1 }, (_, i) => {
                        const y = pad + i * (cellH + gap) + (i === rows ? cellH : 0);
                        return (
                            <line
                                key={`h-${i}`}
                                x1={pad}
                                y1={y}
                                x2={pad + totalW}
                                y2={y}
                                stroke={railColor}
                                strokeWidth={2}
                                strokeDasharray="3 2"
                            />
                        );
                    })}
                {layout === "VERTICAL" &&
                    Array.from({ length: columns + 1 }, (_, i) => {
                        const x = pad + i * (cellW + gap) + (i === columns ? cellW : 0);
                        return (
                            <line
                                key={`v-${i}`}
                                x1={x}
                                y1={pad}
                                x2={x}
                                y2={pad + totalH}
                                stroke={railColor}
                                strokeWidth={2}
                                strokeDasharray="3 2"
                            />
                        );
                    })}
                {/* Panels */}
                {Array.from({ length: rows }, (_, r) =>
                    Array.from({ length: columns }, (_, c) => (
                        <rect
                            key={`${r}-${c}`}
                            x={pad + c * (cellW + gap)}
                            y={pad + r * (cellH + gap)}
                            width={cellW}
                            height={cellH}
                            fill={panelFill}
                            stroke={panelStroke}
                            strokeWidth={1}
                            rx={1}
                        />
                    ))
                )}
            </svg>
            <p className="mt-1 text-xs text-promount-muted-foreground">
                {rows}×{columns} panels · Rails run {layout === "HORIZONTAL" ? "horizontally" : "vertically"}
            </p>
        </div>
    );
}

export default function Home() {
    const [roofType, setRoofType] = useState<RoofType>("Field (no Triangle)");
    const [config, setConfig] = useState<ConfigState>(defaultConfig);

    const update = (key: keyof ConfigState, value: number | string) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const props = useMemo(() => buildProps(roofType, config), [roofType, config]);
    const bom: BomItem[] = useMemo(() => calculateBOM(roofType, props), [roofType, props]);

    const layoutVisual = useMemo((): { layout: "HORIZONTAL" | "VERTICAL"; panelOrientation: "portrait" | "landscape" } | null => {
        switch (roofType) {
            case "Slanted Roof":
                return {
                    layout: config.profilePosition,
                    panelOrientation: config.panelOrientation,
                };
            case "Field":
                return {
                    layout: config.orientation === "LANDSCAPE" ? "HORIZONTAL" : "VERTICAL",
                    panelOrientation: config.orientation === "LANDSCAPE" ? "landscape" : "portrait",
                };
            case "Steeldeck":
            case "Steeldeck Triangle":
            case "Mounting Anchor":
                return {
                    layout: config.profilePosition,
                    panelOrientation: "portrait",
                };
            case "Flat Roof":
            case "Field (no Triangle)":
            case "Steeldeck Solarspeed":
                return {
                    layout: "VERTICAL",
                    panelOrientation: "portrait",
                };
            default:
                return null;
        }
    }, [roofType, config]);

    const summary = useMemo(() => {
        const totalPanels = config.rows * config.columns;
        if (roofType === "Slanted Roof") {
            const layout = config.profilePosition ?? (config.panelOrientation === "landscape" ? "HORIZONTAL" : "VERTICAL");
            const panelOrientation = config.panelOrientation === "landscape" ? "LANDSCAPE" : "PORTRAIT";
            const { systemWidthM, systemHeightM } = computeSystemDimensionsM(
                panelOrientation,
                config.height,
                config.width,
                config.rows,
                config.columns,
                layout,
                END_CAP_WIDTH,
                DISTANCE_TRIANLE_BHIND_END_CLAMP
            );
            return { totalPanels, systemWidthM, systemHeightM };
        }
        const systemWidthM = (config.width / 1000) * config.columns;
        const systemHeightM = (config.height / 1000) * config.rows;
        return { totalPanels, systemWidthM, systemHeightM };
    }, [roofType, config]);

    const handleExportCSV = () => {
        const headers = ["N°", "Code", "Description", "Needed", "Pack", "Quantity"];
        const rows = bom.map((item, i) => [
            i + 1,
            item.code,
            item.description ?? item.code,
            item.needed,
            item.pack,
            item.quantity,
        ]);
        const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "bom_materials.csv";
        link.click();
        URL.revokeObjectURL(link.href);
    };

    // SVG logo converted to data URI for jsPDF embedding
    const PROMOUNT_LOGO_SVG = `data:image/svg+xml;base64,${btoa(`<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.3359 19.6448C19.6205 19.6449 19.8511 19.4142 19.8511 19.1297L19.8511 4.64084C19.8511 4.18243 19.2973 3.95237 18.9725 4.27584L4.42584 18.7622C4.10032 19.0864 4.32985 19.6423 4.78924 19.6424L19.3359 19.6448Z" fill="#000000"/>
<path d="M19.5879 0.188594C19.3365 -0.0628645 18.9289 -0.0628645 18.6774 0.188594L0.188593 18.6774C-0.0628644 18.9289 -0.0628645 19.3365 0.188593 19.5879C0.440052 19.8394 0.847651 19.8394 1.09911 19.5879L19.5879 1.09911C19.8394 0.847649 19.8394 0.440052 19.5879 0.188594Z" fill="#000000"/>
</svg>`)}`;

    async function getLogoImageData(): Promise<string> {
        return new Promise((resolve) => {
            if (typeof window === 'undefined') {
                resolve("");
                return;
            }
            
            const img = document.createElement('img');
            const canvas = document.createElement("canvas");
            const size = 60;
            canvas.width = size;
            canvas.height = size;
            img.onload = () => {
                const ctx = canvas.getContext("2d")!;
                ctx.drawImage(img, 0, 0, size, size);
                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = () => {
                resolve("");
            };
            img.src = PROMOUNT_LOGO_SVG;
        });
    }

    const handleExportPDF = async () => {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        const pageW = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentW = pageW - margin * 2;
        const rowH = 8;
        let y = 25;

        // --- Header: Logo + ProMount ---
        try {
            const logoData = await getLogoImageData();
            doc.addImage(logoData, "PNG", margin, y - 8, 10, 10);
        } catch (e) {
            // fallback: no logo
        }

        doc.setFontSize(30);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("ProMount", margin + 12, y);
        y += 10;

        // --- Subtitle: Project report | Project name ---
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("Project report", margin, y);
        // Vertical separator
        const prWidth = doc.getTextWidth("Project report");
        doc.setDrawColor(180, 100, 100);
        doc.setLineWidth(0.3);
        doc.line(margin + prWidth + 4, y - 3, margin + prWidth + 4, y + 1);
        doc.text("Project name", margin + prWidth + 8, y);
        y += 16;

        // --- Section title ---
        doc.setFontSize(18);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 30);
        doc.text("Project total | Bill of materials", margin, y);
        y += 14;

        // --- Table columns ---
        const colCode = margin;
        const colDesc = margin + 50;
        const colQty = pageW - margin - 30;

        // Table header
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.text("Nº", colCode, y);
        doc.text("Description", colDesc, y);
        doc.text("Quantity", colQty, y);
        y += 3;

        // Header underline
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageW - margin, y);
        y += rowH - 2;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);

        const drawRow = (item: BomItem) => {
            doc.text(item.code, colCode, y);
            const desc = (item.description ?? item.code).slice(0, 55);
            doc.text(desc, colDesc, y);
            doc.text(`${item.quantity} pcs`, colQty, y);
            y += 2;
            // Row separator
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.15);
            doc.line(margin, y, pageW - margin, y);
            y += rowH - 2;
        };

        const drawTableHeader = () => {
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(60, 60, 60);
            doc.text("Nº", colCode, y);
            doc.text("Description", colDesc, y);
            doc.text("Quantity", colQty, y);
            y += 3;
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(margin, y, pageW - margin, y);
            y += rowH - 2;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(40, 40, 40);
        };

        for (let i = 0; i < bom.length; i++) {
            if (y > 270) {
                doc.addPage();
                y = 25;
                drawTableHeader();
            }
            drawRow(bom[i]);
        }

        doc.save("bom_materials.pdf");
    };

    return (
        <div className="min-h-screen bg-promount-background font-sans text-promount-foreground">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header – logo in front of “ProMount BOM calculator”, regular black logo (Feedback PDF) */}
                <header className="mb-8 flex flex-wrap items-center gap-3 border-b border-promount-border pb-6">

                    <Image src="/Vector.svg" alt="Logo" width={50} height={50} />

                    <h1 className="text-2xl font-bold text-[#272727]">ProMount BOM calculator</h1>
                </header>

                {/* Roof type boxes – selected = whole button purple #7E4AF6 (Feedback PDF) */}
                <section className="mb-8">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {ROOF_TYPES.map((type) => {
                            const Icon = ROOF_ICONS[type];
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => {
                                        setRoofType(type);
                                        const dims = ROOF_PANEL_DIMENSIONS[type];
                                        setConfig((prev) => ({ ...prev, height: dims.height, width: dims.width, thickness: dims.thickness }));
                                    }}
                                    className={`flex min-h-[100px] flex-col justify-center rounded-xl border px-5 py-5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#7E4AF6] focus:ring-offset-2 ${roofType === type
                                        ? "border-[#7E4AF6] bg-[#7E4AF6] text-white shadow-sm"
                                        : "border-promount-border bg-promount-card shadow-sm hover:border-promount-muted-foreground/40 hover:bg-promount-muted"
                                        }`}
                                >
                                    <div
                                        className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${roofType === type ? "bg-white/20 text-white" : "bg-promount-muted text-promount-muted-foreground"
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" aria-hidden />
                                    </div>
                                    <h3 className={`text-base font-semibold leading-tight ${roofType === type ? "text-white" : "text-promount-foreground"}`}>{type}</h3>
                                    <p className={`mt-1.5 line-clamp-2 text-xs leading-snug ${roofType === type ? "text-white/90" : "text-promount-muted-foreground"}`}>{ROOF_SUBTITLES[type]}</p>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Configuration */}
                <section className="mb-8 rounded-xl border border-promount-border bg-promount-card p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-promount-foreground">Configuration</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Common – only Rows and Columns; height/width/thickness are per-roof and in Panel Dimensions section */}
                        <div>
                            <label className={labelClass}>Rows</label>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={config.rows}
                                onChange={(e) => update("rows", parseInt(e.target.value, 10) || 1)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Columns</label>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={config.columns}
                                onChange={(e) => update("columns", parseInt(e.target.value, 10) || 1)}
                                className={inputClass}
                            />
                        </div>

                        {/* Slanted Roof */}
                        {roofType === "Slanted Roof" && (
                            <>
                                <div>
                                    <label className={labelClass}>Orientation</label>
                                    <select
                                        value={config.panelOrientation}
                                        onChange={(e) => update("panelOrientation", e.target.value as "landscape" | "portrait")}
                                        className={inputClass}
                                    >
                                        <option value="landscape">Landscape</option>
                                        <option value="portrait">Portrait</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Roofing</label>
                                    <select
                                        value={config.roofing}
                                        onChange={(e) => {
                                            const v = e.target.value as "TILED" | "SLATES" | "ZINC";
                                            const group = ROOF_HOOKS.find((g) => g[v]);
                                            const hooks = group ? (group[v] as { type: string }[] | undefined) : [];
                                            const first = Array.isArray(hooks) && hooks[0] ? hooks[0].type : config.roofHook;
                                            setConfig((c) => ({ ...c, roofing: v, roofHook: first }));
                                        }}
                                        className={inputClass}
                                    >
                                        <option value="TILED">Tiled</option>
                                        <option value="SLATES">Slates</option>
                                        <option value="ZINC">Zinc</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Roof hook</label>
                                    <select value={config.roofHook} onChange={(e) => update("roofHook", e.target.value)} className={inputClass}>
                                        {(() => {
                                            const group = ROOF_HOOKS.find((g) => g[config.roofing]);
                                            const hooks = group ? (group[config.roofing] as { type: string }[] | undefined) : [];
                                            return (Array.isArray(hooks) ? hooks : []).map((hook) => (
                                                <option key={hook.type} value={hook.type}>{hook.type}</option>
                                            ));
                                        })()}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Profile type</label>
                                    <select
                                        value={config.profileType}
                                        onChange={(e) => update("profileType", e.target.value as "HOUSE" | "FEATHER")}
                                        className={inputClass}
                                    >
                                        <option value="HOUSE">House</option>
                                        <option value="FEATHER">Feather</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Profile color</label>
                                    <select
                                        value={config.profileColor}
                                        onChange={(e) => update("profileColor", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Aluminum</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Profile position</label>
                                    <select
                                        value={config.profilePosition}
                                        onChange={(e) => update("profilePosition", e.target.value as "HORIZONTAL" | "VERTICAL")}
                                        className={inputClass}
                                    >
                                        <option value="HORIZONTAL">Horizontal</option>
                                        <option value="VERTICAL">Vertical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Clamp color</label>
                                    <select
                                        value={config.clamps}
                                        onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Aluminum</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Flat Roof */}
                        {roofType === "Flat Roof" && (
                            <>
                                <div>
                                    <label className={labelClass}>Orientation</label>
                                    <select
                                        value={config.orientation === "SOUTH" || config.orientation === "EAST_WEST" ? config.orientation : "SOUTH"}
                                        onChange={(e) => update("orientation", e.target.value as "SOUTH" | "EAST_WEST")}
                                        className={inputClass}
                                    >
                                        <option value="SOUTH">South</option>
                                        <option value="EAST_WEST">East / West</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Clamp color</label>
                                    <select
                                        value={config.clamps}
                                        onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Aluminum</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Triangle width (mm)</label>
                                    <select
                                        value={config.orientation === "EAST_WEST" ? 2450 : config.triangleWidth}
                                        onChange={(e) => update("triangleWidth", parseInt(e.target.value, 10) as 1500 | 1600 | 2450)}
                                        className={inputClass}
                                    >
                                        {config.orientation === "SOUTH" && <option value={1500}>1500</option>}
                                        {config.orientation === "SOUTH" && <option value={1600}>1600</option>}
                                        {config.orientation === "EAST_WEST" && <option value={2450}>2450</option>}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Field */}
                        {roofType === "Field" && (
                            <>
                                <div>
                                    <label className={labelClass}>Orientation</label>
                                    <select
                                        value={config.orientation === "LANDSCAPE" || config.orientation === "PORTRAIT" ? config.orientation : "LANDSCAPE"}
                                        onChange={(e) => update("orientation", e.target.value as "LANDSCAPE" | "PORTRAIT")}
                                        className={inputClass}
                                    >
                                        <option value="LANDSCAPE">Landscape</option>
                                        <option value="PORTRAIT">Portrait</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Profile color</label>
                                    <select
                                        value={config.profilesColor}
                                        onChange={(e) => update("profilesColor", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Aluminum</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Clamp color</label>
                                    <select
                                        value={config.clamps}
                                        onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Aluminum</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Field (no Triangle) */}
                        {roofType === "Field (no Triangle)" && (
                            <>
                                <div>
                                    <label className={labelClass}>Screw pile length</label>
                                    <select
                                        value={config.schroefpaalLength}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            update("schroefpaalLength", v === "1000/1500" ? v : (parseInt(v, 10) as 1000 | 1500));
                                        }}
                                        className={inputClass}
                                    >
                                        <option value={1000}>1000 mm</option>
                                        <option value={1500}>1500 mm</option>
                                        <option value="1000/1500">1000/1500</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Profile color</label>
                                    <select
                                        value={config.profilesColor}
                                        onChange={(e) => update("profilesColor", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Aluminum</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Clamp color</label>
                                    <select
                                        value={config.clamps}
                                        onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Aluminum</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Steeldeck */}
                        {roofType === "Steeldeck" && (
                            <>
                                <div>
                                    <label className={labelClass}>Orientation</label>
                                    <select
                                        value={config.panelOrientation}
                                        onChange={(e) => update("panelOrientation", e.target.value as "landscape" | "portrait")}
                                        className={inputClass}
                                    >
                                        <option value="landscape">Landscape</option>
                                        <option value="portrait">Portrait</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Profile position</label>
                                    <select
                                        value={config.profilePosition}
                                        onChange={(e) => update("profilePosition", e.target.value as "HORIZONTAL" | "VERTICAL")}
                                        className={inputClass}
                                    >
                                        <option value="HORIZONTAL">Horizontal</option>
                                        <option value="VERTICAL">Vertical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Plate type</label>
                                    <select
                                        value={config.steelDeckType}
                                        onChange={(e) => update("steelDeckType", e.target.value as "15cm" | "40cm" | "Connecting")}
                                        className={inputClass}
                                    >
                                        <option value="15cm">15 cm</option>
                                        <option value="40cm">40 cm</option>
                                        <option value="Connecting">Connecting</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Profile type</label>
                                    <select
                                        value={config.profilesType}
                                        onChange={(e) => update("profilesType", e.target.value as "FEATHER" | "HOUSE")}
                                        className={inputClass}
                                    >
                                        <option value="HOUSE">House</option>
                                        <option value="FEATHER">Feather</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Profile color</label>
                                    <select
                                        value={config.profilesColor}
                                        onChange={(e) => update("profilesColor", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Aluminum</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Clamp color</label>
                                    <select
                                        value={config.clamps}
                                        onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Aluminum</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Steeldeck Solarspeed */}
                        {roofType === "Steeldeck Solarspeed" && (
                            <>
                                <div>
                                    <label className={labelClass}>Orientation</label>
                                    <select
                                        value={config.orientation === "SOUTH" || config.orientation === "EAST_WEST" ? config.orientation : "SOUTH"}
                                        onChange={(e) => update("orientation", e.target.value as "SOUTH" | "EAST_WEST")}
                                        className={inputClass}
                                    >
                                        <option value="SOUTH">South</option>
                                        <option value="EAST_WEST">East / West</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Triangle width (mm)</label>
                                    <select
                                        value={config.triangleWidth === 2450 ? 1500 : config.triangleWidth}
                                        onChange={(e) => update("triangleWidth", parseInt(e.target.value, 10) as 1500 | 1600)}
                                        className={inputClass}
                                    >
                                        <option value={1500}>1500</option>
                                        <option value={1600}>1600</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Plate type</label>
                                    <select
                                        value={config.steelDeckType === "15cm" || config.steelDeckType === "40cm" ? config.steelDeckType : "40cm"}
                                        onChange={(e) => update("steelDeckType", e.target.value as "15cm" | "40cm")}
                                        className={inputClass}
                                    >
                                        <option value="15cm">15 cm</option>
                                        <option value="40cm">40 cm</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Clamp color</label>
                                    <select
                                        value={config.clamps}
                                        onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Aluminum</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Steeldeck Triangle */}
                        {roofType === "Steeldeck Triangle" && (
                            <>
                                <div>
                                    <label className={labelClass}>Profile position</label>
                                    <select
                                        value={config.profilePosition}
                                        onChange={(e) => update("profilePosition", e.target.value as "HORIZONTAL" | "VERTICAL")}
                                        className={inputClass}
                                    >
                                        <option value="HORIZONTAL">Horizontal</option>
                                        <option value="VERTICAL">Vertical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Profile color</label>
                                    <select
                                        value={config.profilesColor}
                                        onChange={(e) => update("profilesColor", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Aluminum</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Clamp color</label>
                                    <select
                                        value={config.clamps}
                                        onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Aluminum</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Mounting Anchor */}
                        {roofType === "Mounting Anchor" && (
                            <>
                                <div>
                                    <label className={labelClass}>Profile position</label>
                                    <select
                                        value={config.profilePosition}
                                        onChange={(e) => update("profilePosition", e.target.value as "HORIZONTAL" | "VERTICAL")}
                                        className={inputClass}
                                    >
                                        <option value="HORIZONTAL">Horizontal</option>
                                        <option value="VERTICAL">Vertical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Roof structure</label>
                                    <select
                                        value={config.roofStructure}
                                        onChange={(e) => update("roofStructure", e.target.value as "EPDM/TPO/PVC" | "bitumen")}
                                        className={inputClass}
                                    >
                                        <option value="EPDM/TPO/PVC">EPDM/TPO/PVC</option>
                                        <option value="bitumen">Bitumen</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Material</label>
                                    <select
                                        value={config.material}
                                        onChange={(e) => update("material", e.target.value as "CONCRETE" | "WOOD/STEEL")}
                                        className={inputClass}
                                    >
                                        <option value="CONCRETE">Concrete</option>
                                        <option value="WOOD/STEEL">Wood / Steel</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Profile type</label>
                                    <select
                                        value={config.profilesType}
                                        onChange={(e) => update("profilesType", e.target.value as "FEATHER" | "HOUSE")}
                                        className={inputClass}
                                    >
                                        <option value="HOUSE">House</option>
                                        <option value="FEATHER">Feather</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Profile color</label>
                                    <select
                                        value={config.profilesColor}
                                        onChange={(e) => update("profilesColor", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Aluminum</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Clamp color</label>
                                    <select
                                        value={config.clamps}
                                        onChange={(e) => update("clamps", e.target.value as "ALU" | "BLACK")}
                                        className={inputClass}
                                    >
                                        <option value="ALU">Aluminum</option>
                                        <option value="BLACK">Black</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* Solar layout visual – vertical vs horizontal (like Excel) */}
                {layoutVisual && (
                    <section className="mb-8">
                        <h2 className="mb-3 text-lg font-semibold text-promount-foreground">Solar layout (vertical / horizontal)</h2>
                        <SolarLayoutVisual
                            rows={config.rows}
                            columns={config.columns}
                            layout={layoutVisual.layout}
                            panelOrientation={layoutVisual.panelOrientation}
                        />
                    </section>
                )}

                {/* Panel Dimensions */}
                <section className="mb-8 rounded-xl border border-promount-border bg-promount-card p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-promount-foreground">Panel Dimensions</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label className={labelClass}>Height (mm)</label>
                            <input
                                type="number"
                                min={1}
                                value={config.height}
                                onChange={(e) => update("height", parseInt(e.target.value, 10) || 1000)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Width (mm)</label>
                            <input
                                type="number"
                                min={1}
                                value={config.width}
                                onChange={(e) => update("width", parseInt(e.target.value, 10) || 1000)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Thickness (mm)</label>
                            <input
                                type="number"
                                min={1}
                                value={config.thickness}
                                onChange={(e) => update("thickness", parseInt(e.target.value, 10) || 35)}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </section>

                {/* Summary cards – ProMount accent */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-4 rounded-xl border border-promount-border bg-promount-card p-4 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7E4AF6] text-promount-accent">
                            <Image src="/panal.png" alt="Package" width={40} height={40} className="invert brightness-0" />
                        </div>
                        <div>
                            <p className="text-sm text-promount-muted-foreground">Total Panal</p>
                            <p className="text-2xl font-bold text-promount-foreground">{summary.totalPanels}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl border border-promount-border bg-promount-card p-4 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7E4AF6] text-promount-primary">
                            <span className="text-xl text-white">↔</span>
                        </div>
                        <div>
                            <p className="text-sm text-promount-muted-foreground">System Width</p>
                            <p className="text-2xl font-bold text-promount-foreground">{summary.systemWidthM.toFixed(2)}m</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl border border-promount-border bg-promount-card p-4 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7E4AF6] text-promount-accent">
                            <span className="text-xl text-white">↕</span>
                        </div>
                        <div>
                            <p className="text-sm text-promount-muted-foreground">System Height</p>
                            <p className="text-2xl font-bold text-promount-foreground">{summary.systemHeightM.toFixed(2)}m</p>
                        </div>
                    </div>
                </div>

                {/* ProMount + Bill of materials – brand block (black logo per Feedback PDF) */}
                <div className="mb-6 flex  items-center gap-2 border-b border-promount-border pb-4">
                    <Image src="/Vector.svg" className="brightness-0" alt="Logo" width={30} height={30} />
                    <h2 className="text-4xl font-bold text-black">ProMount</h2>
                </div>
                <h3 className="mb-4 text-lg font-semibold text-promount-foreground">Project total | Bill of materials</h3>

                <div className="overflow-hidden rounded-xl border border-promount-border bg-promount-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-promount-border bg-promount-muted font-semibold text-promount-foreground">
                                    <th className="w-12 px-4 py-4">N°</th>
                                    <th className="w-28 px-4 py-4 font-mono">Code</th>
                                    <th className="min-w-[200px] px-4 py-4">Description</th>
                                    <th className="w-20 px-4 py-4 text-right">Needed</th>
                                    <th className="w-16 px-4 py-4 text-right">Pack</th>
                                    <th className="w-20 px-4 py-4 text-right">Quantity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-promount-border">
                                {bom.map((item, index) => (
                                    <tr key={`${item.code}-${index}`} className="hover:bg-promount-muted/50">
                                        <td className="px-4 py-4 font-mono text-promount-muted-foreground">{index + 1}</td>
                                        <td className="px-4 py-4 font-mono text-promount-primary">{item.code}</td>
                                        <td className="max-w-md px-4 py-4 text-promount-foreground">{item.description ?? item.code}</td>
                                        <td className="px-4 py-4 text-right tabular-nums text-promount-muted-foreground">{item.needed}</td>
                                        <td className="px-4 py-4 text-right tabular-nums text-promount-muted-foreground">{item.pack}</td>
                                        <td className="px-4 py-4 text-right tabular-nums font-semibold text-promount-foreground">{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 rounded-lg border border-promount-border bg-promount-card px-4 py-2 text-sm font-medium text-[#272727] shadow-sm hover:bg-promount-muted focus:outline-none focus:ring-2 focus:ring-[#7E4AF6] focus:ring-offset-2"
                    >
                        <span aria-hidden>↓</span>
                        Export CSV
                    </button>
                    <button
                        type="button"
                        onClick={handleExportPDF}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#7E4AF6] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#7E4AF6] focus:ring-offset-2"
                    >

                        Export PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
