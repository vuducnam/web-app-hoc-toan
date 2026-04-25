import "server-only";
// G5 semester 1 review — pulls from G5 decimal operations + concept/rounding/powers-10.
// Excludes decimal-compare (MULTIPLE_CHOICE — format mismatch with DECIMAL parent).
import { decimalAdd } from "../decimals/decimal-add";
import { decimalSubtract } from "../decimals/decimal-subtract";
import { decimalMultiply } from "../decimals/decimal-multiply";
import { decimalDivide } from "../decimals/decimal-divide";
import { decimalConcept } from "../decimals/decimal-concept";
import { decimalRounding } from "../decimals/decimal-rounding";
import { decimalPowers10 } from "../decimals/decimal-powers-10";
import { makeCompositeReview } from "./composite-helper";

export const semester1ReviewDecimals = makeCompositeReview<number>({
  subs: [
    { key: "decimal-add", gen: decimalAdd },
    { key: "decimal-subtract", gen: decimalSubtract },
    { key: "decimal-multiply", gen: decimalMultiply },
    { key: "decimal-divide", gen: decimalDivide },
    { key: "decimal-concept", gen: decimalConcept },
    { key: "decimal-rounding", gen: decimalRounding },
    { key: "decimal-powers-10", gen: decimalPowers10 },
  ],
  answerFormat: "decimal",
  time: { 1: 60, 2: 75, 3: 90 },
});
