# Slanted Roof – Needed & Quantity from Excel

In the **Slanted Roof** sheet, the BOM table has:
- **NEEDED** (column K): pieces required, from formulas using system dimensions
- **PACKED** (column L): pack size from `data` sheet
- **QUANTITY** (column M): order quantity (round up to full packs)

Excel mapping: **A2**=orientation (LANDSCAPE/PORTRAIT), **B2**=rows, **B3**=columns, **E2**=height [mm], **E3**=width [mm], **A13**=layout (HORIZONTAL/VERTICAL), **B6**=roofing (TILED/SLATES/ZINC), **B7**=roof hook (e.g. NORMAL, HYBRID). **K9** = system width [m], **K10** = system height [m].

---

## 1. System dimensions (already in code)

- **K9** = `(IF(LANDSCAPE, E2, E3)*B2 + IF(HORIZONTAL, data!B3*B2+data!B3, 0))/1000` → **SystemWidth** [m]
- **K10** = `(IF(LANDSCAPE, E3, E2)*B3 + IF(VERTICAL, data!B2*B3+data!B2, 0))/1000` → **SystemHeight** [m]

So: `systemWidthM = SystemWidth(props)/1000` and `systemHeightM = SystemHeight(props)/1000` (if your existing functions return meters; if they return mm, use as-is in the formulas below).

---

## 2. Quantity rule (all rows)

**Quantity** = round up to full packs:

```ts
quantity = pack <= 0 ? needed : Math.ceil(needed / pack) * pack;
```

So “needed” is in pieces; “quantity” is in pieces (rounded up to a multiple of pack). Alternatively you can output “packs to order”: `Math.ceil(needed / pack)`.

---

## 3. NEEDED formulas per BOM row (from Excel)

Row 17 (first product – roof hook / profile):

- **K17** = `(ROUNDUP(IF(A13="HORIZONTAL",K9,K10)/IF(B6="ZINC",1,1.2),0)+1) * IF(A13="HORIZONTAL",B3,B2) * 2`
- Meaning:  
  - Length used = if HORIZONTAL then K9 else K10; if not ZINC divide by 1.2.  
  - `(ROUNDUP(length/1 or 1.2, 0) + 1)` → number of “sections” along that length.  
  - Multiply by columns (if HORIZONTAL) or rows (if VERTICAL), then by 2 → **needed** pieces.

Row 18 (e.g. houtschroef):

- **K18** = if ZINC or HYBRID: `ROUNDUP(IF(HORIZONTAL, K9*B3, K10*B2)*2*102%/6, 0)`; else `K17*2`.

Row 19 (e.g. profiel feather):

- **K19** = if ZINC or HYBRID: `(ROUNDUP(IF(HORIZONTAL,K9,K10)/6,0)-1)*2*IF(HORIZONTAL,B3,B2)`; else `ROUNDUP(IF(HORIZONTAL,K9*B3,K10*B2)*2*102%/6,0)`.

Row 20–22: similar structure with more IFs (ZINC, DD011, etc.).

So in code you:
1. Compute **systemWidthM** and **systemHeightM** (from K9/K10).
2. Derive **layout** from orientation (e.g. landscape → HORIZONTAL, portrait → VERTICAL).
3. For each BOM line, implement the corresponding **K** formula to get **needed**.
4. Get **pack** from `data` (or your products list).
5. Set **quantity** = `Math.ceil(needed / pack) * pack` (or `Math.ceil(needed / pack)` for packs).

---

## 4. Layout vs orientation (Excel)

- **A13** = layout: HORIZONTAL or VERTICAL (profile direction).
- In your code you can map:  
  - `panelOrientation === "landscape"` → often HORIZONTAL  
  - `panelOrientation === "portrait"` → often VERTICAL  
  (Confirm from Excel which combination you use.)

---

## 5. Summary for code

1. **System dimensions**  
   Use existing `SystemWidth` / `SystemHeight`; ensure units (m vs mm) match the Excel formulas (K9/K10 are in meters).

2. **Per BOM line**  
   - **needed** = implement the K formula for that row (using systemWidthM, systemHeightM, rows, columns, layout, roofing, roofHook).  
   - **pack** = product’s pack size.  
   - **quantity** = `pack ? Math.ceil(needed / pack) * pack : needed`.

3. **ROUNDUP** in JS: `Math.ceil(x)`.

4. **102%** in Excel = 1.02 (waste factor).

Implementing these steps in `slanted.roof.ts` will align “needed” and “quantity” with the Excel BOM.
