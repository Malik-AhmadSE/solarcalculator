/**
 * Run verification matrix: for each case, compute BOM and compare to expected.
 * Run from solarcalculator: npx tsx scripts/run-verification.ts
 * (Or exclude scripts from tsconfig and run with ts-node.)
 */

import { calculateBOM } from "../lib/calculateBOM";
import { VERIFICATION_CASES } from "../lib/verificationMatrix";

let failed = 0;
for (const vc of VERIFICATION_CASES) {
  const actual = calculateBOM(vc.roofType, vc.props);
  const byCode = Object.fromEntries(actual.map((i) => [i.code, i]));
  let ok = true;
  for (const [code, exp] of Object.entries(vc.expectedByCode)) {
    const item = byCode[code];
    const actNeed = item?.needed ?? -1;
    const actQty = item?.quantity ?? -1;
    const needOk = actNeed === exp.needed;
    const qtyOk = exp.quantity == null || actQty === exp.quantity;
    if (!needOk || !qtyOk) {
      ok = false;
      console.log(
        `FAIL ${vc.id} ${code}: expected needed=${exp.needed}${exp.quantity != null ? ` quantity=${exp.quantity}` : ""}, got needed=${actNeed} quantity=${actQty}`
      );
    }
  }
  if (ok) {
    console.log(`OK   ${vc.id} ${vc.label}`);
  } else {
    failed++;
  }
}
console.log(failed === 0 ? "\nAll verification cases passed." : `\n${failed} case(s) failed.`);
process.exit(failed > 0 ? 1 : 0);
