# Flat Roof BOM – test results to compare with Excel

Run the calculator and save output for comparison with your Excel sheet:

```bash
cd solarcalculator
npm run test:flat-roof
```

To save the output to a file:

```bash
npm run test:flat-roof > flat-roof-results.txt
```

Then open your Excel sheet **"Flat Roof"** and compare:

- **Excel columns:** Code (A), NEEDED (I), PACK (J), QUANTITY (K)
- **Our output:** Code | Needed | Pack | Quantity

## Expected match for 10×7 SOUTH (from Excel verification doc)

| Code        | NEEDED | PACK | QUANTITY |
|-------------|--------|------|----------|
| 1SSP19NZ020 | 77     | 1    | 77       |
| 1SSP99AC087 | 70     | 1    | 70       |
| 1SSP99AC084 | 70     | 1    | 70       |
| 1SSP99AC030 | 70     | 1    | 70       |
| 1SSP99AC038 | 11     | 1    | 11       |
| 1SSP99AC034 | 22     | 1    | 22       |
| 1HME46PL001 | 1162   | 100  | 1200     |
| 1HME32SR096 | 28     | 20   | 40       |
| 1HME32SR086 | 126    | 10   | 130      |
| 1HME10BT019 | 154    | 100  | 200      |

Set Excel to: **B2=10, B3=7, A2=SOUTH, B6=1500, E6=30, B7=BLACK** to get the same case.

## Reading values from Excel (optional)

If you have **"BOM calculator v2.Axxiom.xlsx"** in the folder above `solarcalculator` (i.e. in `solar_final`):

1. Install the Excel reader dependency: `npm install xlsx`
2. Run: `node read-flat-roof-sheet.js`
3. Compare the printed NEEDED/QUANTITY with the tables from `npm run test:flat-roof`
