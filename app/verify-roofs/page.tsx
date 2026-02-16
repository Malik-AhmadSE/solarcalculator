"use client";

import React, { useMemo } from "react";
import { ROOF_TYPES, type RoofType } from "@/lib/roofTypes";
import { calculateBOM, type BomItem } from "@/lib/calculateBOM";
import type { SlantedRoofProps } from "@/lib/slanted.roof";
import { systemDimensionsM, railPieces6m } from "@/lib/roofUtils";
import { VERIFICATION_CASES } from "@/lib/verificationMatrix";

/** Fixed inputs used to verify all roofs (same as doc examples). */
const COMMON = { rows: 5, columns: 7, width: 1134, height: 1722 };
/** Flat Roof: Excel sheet test (SOUTH, 10×7) – see docs/FLAT_ROOF_EXCEL_VERIFICATION.md */
const FLAT_PROPS = {
    rows: 10,
    columns: 7,
    width: 1134,
    height: 2000,
    orientation: "SOUTH" as const,
    clamps: "BLACK" as const,
    thickness: 30,
    triangleWidth: 1500 as const,
};
const SLANTED_PROPS: SlantedRoofProps = {
    ...COMMON,
    panelOrientation: "portrait",
    profilePosition: "VERTICAL",
    roofing: "SLATES",
    roofHook: "NORMAL",
    profileType: "FEATHER",
    profileColor: "BLACK",
    clamps: "BLACK",
    Thickness: 30,
};

/** Slanted roof: all configuration combinations to verify (5×7, 1134×1722). */
const SLANTED_CONFIGURATIONS: { label: string; props: SlantedRoofProps }[] = [
    {
        label: "Portrait, VERTICAL, SLATES, NORMAL, FEATHER, BLACK, 30mm",
        props: { ...COMMON, panelOrientation: "portrait", profilePosition: "VERTICAL", roofing: "SLATES", roofHook: "NORMAL", profileType: "FEATHER", profileColor: "BLACK", clamps: "BLACK", Thickness: 30 },
    },
    {
        label: "Portrait, VERTICAL, TILED, NORMAL, FEATHER, BLACK, 30mm",
        props: { ...COMMON, panelOrientation: "portrait", profilePosition: "VERTICAL", roofing: "TILED", roofHook: "NORMAL", profileType: "FEATHER", profileColor: "BLACK", clamps: "BLACK", Thickness: 30 },
    },
    {
        label: "Portrait, VERTICAL, ZINC, ROUND, FEATHER, BLACK, 30mm",
        props: { ...COMMON, panelOrientation: "portrait", profilePosition: "VERTICAL", roofing: "ZINC", roofHook: "ROUND", profileType: "FEATHER", profileColor: "BLACK", clamps: "BLACK", Thickness: 30 },
    },
    {
        label: "Landscape, HORIZONTAL, SLATES, NORMAL, FEATHER, BLACK, 30mm",
        props: { ...COMMON, panelOrientation: "landscape", profilePosition: "HORIZONTAL", roofing: "SLATES", roofHook: "NORMAL", profileType: "FEATHER", profileColor: "BLACK", clamps: "BLACK", Thickness: 30 },
    },
    {
        label: "Portrait, HORIZONTAL, SLATES, NORMAL, FEATHER, BLACK, 30mm",
        props: { ...COMMON, panelOrientation: "portrait", profilePosition: "HORIZONTAL", roofing: "SLATES", roofHook: "NORMAL", profileType: "FEATHER", profileColor: "BLACK", clamps: "BLACK", Thickness: 30 },
    },
    {
        label: "Portrait, VERTICAL, SLATES, NORMAL, HOUSE, ALU, ALU, 30mm",
        props: { ...COMMON, panelOrientation: "portrait", profilePosition: "VERTICAL", roofing: "SLATES", roofHook: "NORMAL", profileType: "HOUSE", profileColor: "ALU", clamps: "ALU", Thickness: 30 },
    },
    {
        label: "Portrait, VERTICAL, SLATES, NORMAL, FEATHER, BLACK, 35mm (thick)",
        props: { ...COMMON, panelOrientation: "portrait", profilePosition: "VERTICAL", roofing: "SLATES", roofHook: "NORMAL", profileType: "FEATHER", profileColor: "BLACK", clamps: "BLACK", Thickness: 35 },
    },
    {
        label: "Portrait, VERTICAL, TILED, HYBRID, FEATHER, BLACK, 30mm",
        props: { ...COMMON, panelOrientation: "portrait", profilePosition: "VERTICAL", roofing: "TILED", roofHook: "HYBRID", profileType: "FEATHER", profileColor: "BLACK", clamps: "BLACK", Thickness: 30 },
    },
];

/** Formula summary per roof for quick verification. */
const FORMULA_SUMMARY: Record<RoofType, string> = {
    "Slanted Roof":
        "K17–K25: roofHook, row2–6, middleClamps, endClamps, row9Clamps. lengthM, perp, sections, betweenPanels.",
    "Flat Roof":
        "Excel Flat Roof (SOLARSPEED): table cols×rows+cols; backplate cols×rows; L-profile, koppelstuk; eindrubber rows+1; druknagel, plaatschroef; eindklem cols×4; middenklem cols×(rows-1)×2; inbus. See FLAT_ROOF_EXCEL_VERIFICATION.md.",
    "Field":
        "Same as Flat: panelCount schans; ceil(widthM/6)*(rows*2) L-profile; 8*rows caps; panelCount plates; 4*panelCount screws.",
    "Field (no Triangle)":
        "Same as Field (no extra triangle items).",
    "Steeldeck":
        "panelCount plates; 4*panelCount BM screws; ceil(widthM/6)*(rows*2) rails; (cols-1)*rows*2 mid; rows*4 end clamps.",
    "Steeldeck Solarspeed":
        "rows backplates; (cols-1)*rows*2 mid; rows*4 end; 4*panelCount plaatschroef; 2*panelCount druknagel; rows*2 eindrubber.",
    "Steeldeck Triangle":
        "Steeldeck + rows*2 L-stuk dakhaak.",
    "Mounting Anchor":
        "panelCount anchors; panelCount screws.",
};

function BomTable({ items }: { items: BomItem[] }) {
    return (
        <table className="w-full text-left text-sm">
            <thead>
                <tr className="bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="px-4 py-2">Code</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2 text-right">Needed</th>
                    <th className="px-4 py-2 text-right">Pack</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {items.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                        <td className="px-4 py-2 font-mono text-blue-400">{item.code}</td>
                        <td className="px-4 py-2 text-slate-300 max-w-xs truncate" title={item.description}>
                            {item.description}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-300">{item.needed}</td>
                        <td className="px-4 py-2 text-right text-slate-300">{item.pack}</td>
                        <td className="px-4 py-2 text-right font-bold text-emerald-400">{item.quantity}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function SlantedAllConfigurations() {
    const results = useMemo(() => {
        return SLANTED_CONFIGURATIONS.map(({ label, props }) => ({
            label,
            props,
            bom: calculateBOM("Slanted Roof", props),
        }));
    }, []);

    return (
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
                <h2 className="text-xl font-semibold text-white">Slanted roof – all configurations</h2>
                <p className="text-slate-400 text-sm mt-1">
                    BOM result (code, needed, pack, quantity) for each configuration. Same base: 5×7, 1134×1722 mm.
                </p>
            </div>
            <div className="divide-y divide-slate-800">
                {results.map((r, idx) => (
                    <details key={idx} className="group">
                        <summary className="p-4 cursor-pointer list-none flex items-center justify-between hover:bg-slate-800/30 text-slate-200 font-medium">
                            <span>{r.label}</span>
                            <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="px-4 pb-4">
                            <div className="rounded-lg overflow-hidden border border-slate-700">
                                <BomTable items={r.bom} />
                            </div>
                        </div>
                    </details>
                ))}
            </div>
        </section>
    );
}

function VerificationMatrixTable() {
    const results = useMemo(() => {
        return VERIFICATION_CASES.map((vc) => {
            const actual = calculateBOM(vc.roofType, vc.props);
            const byCode = Object.fromEntries(actual.map((i) => [i.code, i]));
            const checks: { code: string; expNeed: number; actNeed: number; expQty?: number; actQty: number; ok: boolean }[] = [];
            let allOk = true;
            for (const [code, exp] of Object.entries(vc.expectedByCode)) {
                const item = byCode[code];
                const actNeed = item?.needed ?? -1;
                const actQty = item?.quantity ?? -1;
                const needOk = actNeed === exp.needed;
                const qtyOk = exp.quantity == null || actQty === exp.quantity;
                if (!needOk || !qtyOk) allOk = false;
                checks.push({
                    code,
                    expNeed: exp.needed,
                    actNeed,
                    expQty: exp.quantity,
                    actQty,
                    ok: needOk && qtyOk,
                });
            }
            return { vc, actual, checks, allOk };
        });
    }, []);

    return (
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
                <h2 className="text-xl font-semibold text-white">Verification matrix (expected vs actual)</h2>
                <p className="text-slate-400 text-sm mt-1">
                    For each configuration combination: needed and quantity are compared to expected values.
                </p>
            </div>
            <div className="divide-y divide-slate-800">
                {results.map(({ vc, checks, allOk }) => (
                    <div key={vc.id} className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-slate-200">{vc.label}</span>
                            <span
                                className={
                                    allOk
                                        ? "text-emerald-400 text-sm font-medium"
                                        : "text-amber-400 text-sm font-medium"
                                }
                            >
                                {allOk ? "✓ All pass" : "✗ Some mismatches"}
                            </span>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-slate-400">
                                    <th className="px-2 py-1">Code</th>
                                    <th className="px-2 py-1 text-right">Need (exp)</th>
                                    <th className="px-2 py-1 text-right">Need (act)</th>
                                    <th className="px-2 py-1 text-right">Qty (exp)</th>
                                    <th className="px-2 py-1 text-right">Qty (act)</th>
                                    <th className="px-2 py-1 w-12" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {checks.map((c) => (
                                    <tr key={c.code} className={c.ok ? "text-slate-300" : "bg-amber-900/20 text-amber-200"}>
                                        <td className="px-2 py-1 font-mono text-blue-400">{c.code}</td>
                                        <td className="px-2 py-1 text-right">{c.expNeed}</td>
                                        <td className="px-2 py-1 text-right">{c.actNeed}</td>
                                        <td className="px-2 py-1 text-right">{c.expQty ?? "—"}</td>
                                        <td className="px-2 py-1 text-right">{c.actQty}</td>
                                        <td className="px-2 py-1">{c.ok ? "✓" : "✗"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function VerifyRoofsPage() {
    const { widthM, heightM, panelCount } = useMemo(
        () => systemDimensionsM(COMMON.rows, COMMON.columns, COMMON.width, COMMON.height),
        []
    );
    const railPieces = useMemo(
        () => railPieces6m(widthM, COMMON.rows * 2),
        [widthM]
    );

    const bomByRoof = useMemo(() => {
        const out: Record<RoofType, BomItem[]> = {} as Record<RoofType, BomItem[]>;
        for (const roofType of ROOF_TYPES) {
            const props =
                roofType === "Slanted Roof"
                    ? SLANTED_PROPS
                    : roofType === "Flat Roof"
                      ? FLAT_PROPS
                      : COMMON;
            out[roofType] = calculateBOM(roofType, props);
        }
        return out;
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-10">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
                        Roof formulas & results verification
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Fixed inputs: rows={COMMON.rows}, columns={COMMON.columns}, width={COMMON.width} mm, height={COMMON.height} mm.
                        Derived: widthM = {widthM.toFixed(3)} m, heightM = {heightM.toFixed(3)} m, panelCount = {panelCount}, railPieces(6m) = {railPieces} for 10 rails.
                    </p>
                </header>

                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-slate-200 mb-2">Formulas reference</h2>
                    <p className="text-slate-400 text-sm mb-4">
                        See <code className="bg-slate-800 px-1 rounded">docs/ROOF_FORMULAS_VERIFICATION.md</code> for full formulas. Quantity = ceil(needed/pack)*pack for all.
                    </p>
                </section>

                <SlantedAllConfigurations />

                <VerificationMatrixTable />

                {ROOF_TYPES.map((roofType) => (
                    <section
                        key={roofType}
                        className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-800 flex flex-wrap items-baseline gap-4">
                            <h2 className="text-xl font-semibold text-white">{roofType}</h2>
                            <p className="text-slate-400 text-sm flex-1">{FORMULA_SUMMARY[roofType]}</p>
                        </div>
                        <div className="overflow-x-auto">
                            <BomTable items={bomByRoof[roofType]} />
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
