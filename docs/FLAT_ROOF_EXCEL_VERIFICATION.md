# Flat Roof – Excel verification

The **Flat Roof** sheet in `BOM calculator v2.Axxiom.xlsx` is a **SOLARSPEED-based** flat roof (tables, backplates, L-profiles, clamps, screws). It is **not** the pedestal/schans (FLD) system.

## Rows and columns (must match Excel)

For **NEEDED** calculations to match Excel, the app must use the same meaning as the sheet:

- **Rows** = Excel **B2** (number of rows of panels)
- **Columns** = Excel **B3** (number of columns of panels)

Example: **10×7** means 10 rows, 7 columns → B2=10, B3=7. Then e.g. backplate = B3×B2 = 70, eindrubber = B2+1 = 11, middenklem = B3×(B2−1)×2 = 126. If your app’s “Rows” and “Columns” are swapped or stored differently, the NEEDED values will not match.

## Excel inputs (Flat Roof sheet)

| Cell | Meaning | Example |
|------|---------|---------|
| A2 | Orientation | `SOUTH` or `EAST/WEST` |
| B2 | Rows | 10 |
| B3 | Columns | 7 |
| E2 | Height [mm] | 2000 |
| E3 | Width [mm] | 1134 |
| B6 | Triangle / steekafstand [mm] | 1500 or 1600 (for SOUTH) |
| E6 | Thickness [mm] | 30 |
| B7 | CLAMPS | `BLACK` or `ALU` |

## BOM table (Excel columns A, I=NEEDED, J=PACKED, K=QUANTITY)

Rows 11–20. Column I = NEEDED, J = PACKED (from data sheet), K = QUANTITY = ROUNDUP(I/J,0)*J.

### NEEDED formulas (SOUTH layout, B2=rows, B3=columns)

| Row | Product (concept) | NEEDED formula (SOUTH) |
|-----|-------------------|-------------------------|
| 11 | SOLARSPEED table (1SSP19NZ020 or NZ023) | `B3*B2+B3` |
| 12 | Backplate (1SSP99AC087) | `B3*B2` |
| 13 | L-profile (1SSP99AC084) | `=I12` |
| 14 | Koppelstuk (1SSP99AC030) | `=I13` |
| 15 | Eindrubber (1SSP99AC038) | `B2+1` |
| 16 | Druknagel (1SSP99AC034) | `I15*2` |
| 17 | Plaatschroef (1HME46PL001) | `I11*6 + I12*4 + I13*4 + I14*2` |
| 18 | Eindklem (1HME32SR096/097) | `B3*2*2` |
| 19 | Middenklem (1HME32SR086/085) | `B3*(B2-1)*2` |
| 20 | Inbus M8x30 (1HME10BT019) | `I18+I19` |

Eindklem code: BLACK + thickness 30 → 1HME32SR096; BLACK + 35 → 1HME32SR072; ALU analogous (097, 071).

## Expected values for verification (SOUTH, 10 rows, 7 columns)

With **rows=10, columns=7**, orientation=SOUTH, clamps=BLACK, thickness=30, triangleWidth=1500:

| Code | NEEDED | PACK | QUANTITY |
|------|--------|------|----------|
| 1SSP19NZ020 | 77 | 1 | 77 |
| 1SSP99AC087 | 70 | 1 | 70 |
| 1SSP99AC084 | 70 | 1 | 70 |
| 1SSP99AC030 | 70 | 1 | 70 |
| 1SSP99AC038 | 11 | 1 | 11 |
| 1SSP99AC034 | 22 | 1 | 22 |
| 1HME46PL001 | 1162 | 100 | 1200 |
| 1HME32SR096 | 28 | 20 | 40 |
| 1HME32SR086 | 126 | 10 | 130 |
| 1HME10BT019 | 154 | 100 | 200 |

## How to verify

1. **Run the Excel dump script** (from project root, with `BOM calculator v2.Axxiom.xlsx` in parent folder):
   ```bash
   cd solarcalculator && node read-flat-roof-sheet.js
   ```
   Check that Excel NEEDED (column I) and QUANTITY (column K) match the table above for B2=10, B3=7, A2=SOUTH.

2. **Run the app** and open `/verify-roofs`. Use **rows=10, columns=7** for Flat Roof (you can temporarily change `COMMON` in the verify-roofs page for Flat only, or add a “Flat Roof Excel test” block that uses 10, 7 and optional orientation=SOUTH, clamps=BLACK, thickness=30).

3. **Compare** each line: code, needed, pack, quantity from our `flatRoof()` output vs the table above.

## Code mapping (lib/flat.roof.ts)

- **FlatRoofProps**: rows, columns, height, width; optional orientation (default SOUTH), clamps (default BLACK), thickness (default 30), triangleWidth (default 1500).
- **Quantity rule**: `quantityFromNeeded(needed, pack)` = ceil(needed/pack)*pack, same as Excel.
- EAST_WEST layout uses different formulas (see Excel row formulas when A2=EAST/WEST); our implementation uses a simplified EAST_WEST branch.
