"use client";

import React from 'react';
import { slantedRoof, SlantedRoofProps } from '@/lib/slanted.roof';

const TestBOMPage = () => {
    const props: SlantedRoofProps = {
        panelOrientation: "portrait",
        rows: 5,
        columns: 7,
        height: 1722,
        width: 1134,
        roofing: "SLATES",
        roofHook: "NORMAL",
        profileType: "FEATHER",
        profileColor: "BLACK",
        clamps: "BLACK",
        Thickness: 30
    };

    const bom = slantedRoof(props);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        BOM Verification Test
                    </h1>
                    <p className="text-slate-400 text-lg">Testing slanted roof BOM logic with user-provided dummy data.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
                            Input Configurations
                        </h2>
                        <dl className="grid grid-cols-2 gap-y-3 text-sm">
                            <dt className="text-slate-500">Orientation</dt>
                            <dd className="font-medium uppercase">{props.panelOrientation}</dd>
                            <dt className="text-slate-500">Rows / Columns</dt>
                            <dd className="font-medium">{props.rows} / {props.columns}</dd>
                            <dt className="text-slate-500">Roofing</dt>
                            <dd className="font-medium">{props.roofing}</dd>
                            <dt className="text-slate-500">Roof Hook</dt>
                            <dd className="font-medium">{props.roofHook}</dd>
                            <dt className="text-slate-500">Profile Type</dt>
                            <dd className="font-medium">{props.profileType}</dd>
                            <dt className="text-slate-500">Dimensions</dt>
                            <dd className="font-medium">{props.width}x{props.height}mm</dd>
                        </dl>
                    </section>
                </div>

                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span>
                            Generated Bill of Materials
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-right">Quantity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {bom.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-blue-400">{item.code}</td>
                                        <td className="px-6 py-4 text-slate-300">{item.description}</td>
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
