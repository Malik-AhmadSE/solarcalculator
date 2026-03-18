/**
 * API route: send BOM calculation to Odoo.
 * Receives roof config + BOM and can be wired to your Odoo backend (e.g. quote/BOM API).
 */
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { roofType, config, summary, bom } = body;

        if (!bom || !Array.isArray(bom)) {
            return NextResponse.json(
                { error: "Invalid payload: bom array required" },
                { status: 400 }
            );
        }

        // TODO: Wire to your Odoo API (e.g. create quotation, BOM, or project).
        // Example: POST to ODOO_BASE_URL with session/token from NextAuth.
        // const session = await getServerSession(authOptions);
        // await fetch(`${ODOO_BASE_URL}/api/...`, { ... });

        return NextResponse.json({
            ok: true,
            message: "BOM received (Odoo integration not yet configured)",
            roofType: roofType ?? null,
            itemCount: bom.length,
        });
    } catch (e) {
        console.error("send-to-odoo error:", e);
        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Failed to send to Odoo" },
            { status: 500 }
        );
    }
}
