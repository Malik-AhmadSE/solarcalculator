# Roof BOM – Excel verification summary

All roof types are aligned with the corresponding sheets in **BOM calculator v2.Axxiom.xlsx**. Use the scripts below to dump sheet contents and compare with app output.

## Scripts

- **`node read-flat-roof-sheet.js`** – Flat Roof sheet (SOLARSPEED). See **FLAT_ROOF_EXCEL_VERIFICATION.md** for formulas.
- **`node read-all-roof-sheets.js`** – Field, Field (no Triangle), Steeldeck, Steeldeck Solarspeed, Steeldeck Triangle, Mounting Anchor. Prints first 25 rows and BOM table (PRODUCT, NEEDED, PACKED, QUANTITY).

Place **BOM calculator v2.Axxiom.xlsx** in the `solarcalculator` parent folder before running.

## Sheet ↔ code mapping

| Excel sheet              | Code module                  | Main inputs (Excel cells) |
|--------------------------|------------------------------|----------------------------|
| Slanted Roof             | `lib/slanted.roof.ts`        | A2 orientation, B2/B3, E2/E3, A13, B6, B7, profile, clamps, E6 |
| Flat Roof                | `lib/flat.roof.ts`           | A2 SOUTH/EAST_WEST, B2/B3, E2/E3, B6, E6, B7 |
| Field                    | `lib/field.roof.ts`          | A2 LANDSCAPE/PORTRAIT, B2/B3, E2/E3, profiles, clamps |
| Field (no Triangle)      | `lib/fieldNoTriangle.roof.ts`| B2/B3, E2/E3, schroefpaal length, profiles, clamps |
| Steeldeck                | `lib/steeldeck.roof.ts`      | A2, B2/B3, E2/E3, B7 steel deck type, B8/B9 profiles, B10 clamps, E6 |
| Steeldeck Solarspeed     | `lib/steeldeckSolarspeed.roof.ts` | A2 SOUTH, B2/B3, E2/E3, B6 triangle, B7 40cm, B8 clamps |
| Steeldeck Triangle       | `lib/steeldeckTriangle.roof.ts`   | A2 PORTRAIT, B2/B3, E2/E3, B7/B8/B9/B10, E6 |
| Mounting Anchor          | `lib/mountingAnchor.roof.ts` | A2, B2/B3, E2/E3, B6 roof structure, B7/B8 material, B9 screws, B10/B11/B12 profiles & clamps |

## Verification steps

1. Set the same inputs in Excel as used in the app (e.g. rows=10, columns=7 for Flat; rows=6, columns=3 for Field).
2. Run the appropriate read script and note NEEDED and QUANTITY for each BOM line.
3. Open **/verify-roofs** (or **/test-bom** and select the roof type) and compare **needed**, **pack**, **quantity** with the Excel sheet.

## Quantity rule (all sheets)

**Quantity** = `ROUNDUP(NEEDED / PACKED, 0) * PACKED` (round up to full packs). Implemented as `quantityFromNeeded(needed, pack)` in `lib/roofUtils.ts` and `lib/slantedRoofQuantities.ts`.
