# Roof BOM – Formulas & Verification

All roofs use the same **quantity rule**: `quantity = Math.ceil(needed / pack) * pack` (round up to full packs). Pack comes from `data/data.ts` per product code.

**Shared inputs** (for Flat, Field, Steeldeck, Mounting Anchor): `rows`, `columns`, `width` [mm], `height` [mm].

**Shared derived values** (from `roofUtils.systemDimensionsM`):

- `widthM = (width / 1000) * columns`
- `heightM = (height / 1000) * rows`
- `panelCount = rows * columns`

**Rail pieces (6 m)** from `roofUtils.railPieces6m(lengthM, numRails)`:

- `railPieces = Math.ceil(lengthM / 6) * numRails`

---

## 1. Slanted Roof

See **SLANTED_ROOF_QUANTITY_FORMULAS.md** for full Excel mapping.

**Inputs:** panelOrientation, rows, columns, height, width, roofing (TILED/SLATES/ZINC), roofHook, profileType, profileColor, clamps, Thickness.

**System dimensions:** `computeSystemDimensionsM()` in `slantedRoofQuantities.ts` (includes end-cap and distance-behind-clamp extras).  
**Length along rails:** `lengthM = layout === "HORIZONTAL" ? systemWidthM : systemHeightM`.  
**Panels perpendicular:** `perp = layout === "HORIZONTAL" ? columns : rows`.

| BOM line   | Needed formula (concept) | Code source |
|------------|---------------------------|-------------|
| roofHook   | (ROUNDUP(length/divisor,0)+1) * perp * 2 | K17 |
| row2       | ZINC/HYBRID: ROUNDUP(length×perp×2×1.02/6,0); else roofHook×2 | K18 |
| row3       | ZINC/HYBRID: (ROUNDUP(length/6,0)-1)×2×perp; **then −1** for this line only | K19 |
| row4       | ZINC/HYBRID: row3×2 + (ZINC ? roofHook : 0); else (ROUNDUP(length/6,0)-1)×2×perp | K20 |
| row5       | ZINC/HYBRID: row4; else row4×2 + roofHook | K21 |
| row6       | ZINC/HYBRID: betweenPanels×2; else row4×2 + roofHook | K22 |
| middleClamps | ZINC/HYBRID: perp×2×2; else betweenPanels×2 | K23 |
| endClamps  | perp×2×2 | K24 |
| row9Clamps | perp×2×2 (non-ZINC only, optional) | K25 |

`betweenPanels = HORIZONTAL ? (rows−1)×columns : (columns−1)×rows`.

---

## 2. Flat Roof

**File:** `lib/flat.roof.ts`  
**Excel:** “Flat Roof” sheet (SOLARSPEED-based). See **docs/FLAT_ROOF_EXCEL_VERIFICATION.md** for full mapping.

**Inputs:** rows (B2), columns (B3), height (E2), width (E3); optional orientation (A2: SOUTH/EAST_WEST), clamps (B7), thickness (E6), triangleWidth (B6).

**SOUTH layout (B2=rows, B3=columns):**

| Product (code)   | Needed formula |
|------------------|----------------|
| 1SSP19NZ020/023  | `columns*rows+columns` |
| 1SSP99AC087      | `columns*rows` |
| 1SSP99AC084      | `= needBackplate` |
| 1SSP99AC030      | `= needBackplate` |
| 1SSP99AC038      | `rows+1` |
| 1SSP99AC034      | `needEindrubber*2` |
| 1HME46PL001      | `needTable*6 + needBackplate*4 + needLprofile*4 + needKoppel*2` |
| 1HME32SR096/097  | `columns*2*2` |
| 1HME32SR086/085  | `columns*(rows-1)*2` |
| 1HME10BT019      | `needEindklem+needMiddenklem` |

**Check (Excel):** rows=10, columns=7 → needTable=77, needBackplate=70, needEindrubber=11, needDruknagel=22, needPlaatschroef=1162, needEindklem=28, needMiddenklem=126, needInbus=154.

---

## 3. Field

**File:** `lib/field.roof.ts`

Same structure as Flat; product codes use **AFI** (field) and **AHM** where applicable.

| Product code   | Needed formula |
|----------------|----------------|
| 1AFI19ZZ002    | `panelCount` |
| 1HFR43AL002    | `ceil(widthM/6) * (rows*2)` |
| 1AHM0ACPS001   | `rows * 2 * 2 * 2` |
| 1HMEACMP002    | `panelCount` |
| 1AHM10BT019    | `panelCount * 4` |

---

## 4. Field (no Triangle)

**File:** `lib/fieldNoTriangle.roof.ts`

Formulas identical to Field. No extra triangle/bracket line items in current implementation.

---

## 5. Steeldeck

**File:** `lib/steeldeck.roof.ts`

| Product code   | Description (concept)     | Needed formula |
|----------------|---------------------------|----------------|
| 1HME15SD005    | Steeldeck plaatje 15cm EPDM | `panelCount` |
| 1HME46BM003    | Bi-metal schroeven steeldeck | `panelCount * 4` |
| 1HME43ZW044    | Profiel feather 6m zwart  | `ceil(widthM/6) * (rows*2)` |
| 1HME32KK004    | Klikmiddenklem zwart      | `(columns − 1) * rows * 2` |
| 1HME32KK016    | Klikeindklem zwart 35mm   | `rows * 2 * 2` |

**Check:** rows=5, columns=7 → middleClamps = 6*5*2 = 60; endClamps = 5*4 = 20.

---

## 6. Steeldeck Solarspeed

**File:** `lib/steeldeckSolarspeed.roof.ts`

| Product code   | Needed formula |
|----------------|----------------|
| 1SSP99AC086    | `rows` (backplate per row) |
| 1HME32SR086    | `(columns − 1) * rows * 2` |
| 1HME32SR072    | `rows * 2 * 2` |
| 1HME46PL001    | `panelCount * 4` |
| 1SSP99AC034    | `panelCount * 2` |
| 1SSP99AC038    | `rows * 2` (eindrubber) |

---

## 7. Steeldeck Triangle

**File:** `lib/steeldeckTriangle.roof.ts`

Same as Steeldeck **plus**:

| Product code   | Needed formula |
|----------------|----------------|
| 1HME15AC003    | `rows * 2` (L-stuk dakhaak, 2 per row) |

---

## 8. Mounting Anchor

**File:** `lib/mountingAnchor.roof.ts`

| Product code   | Needed formula |
|----------------|----------------|
| 1HME15AN003    | `panelCount` (anchor EPDM/TPO) |
| 1HME15AS002    | `panelCount` (screw per anchor) |

---

## Verification

**In the app:** Open **/verify-roofs** to see all roof types calculated with fixed inputs (rows=5, columns=7, width=1134 mm, height=1722 mm). Each section shows the formula summary and the BOM table (code, description, needed, pack, quantity) so you can verify formulas and results.
