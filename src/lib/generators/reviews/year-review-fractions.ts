import "server-only";
// G4 year-end fractions review — pulls from all FRACTION subs.
// Excludes fraction-compare (MULTIPLE_CHOICE — format mismatch with FRACTION parent).
import { simplifyFraction } from "../fractions/simplify-fraction";
import { fractionCommonDenominator } from "../fractions/fraction-common-denominator";
import { fractionAdd } from "../fractions/fraction-add";
import { fractionSubtract } from "../fractions/fraction-subtract";
import { fractionMultiply } from "../fractions/fraction-multiply";
import { fractionDivide } from "../fractions/fraction-divide";
import { fractionConcept } from "../fractions/fraction-concept";
import { makeCompositeReview } from "./composite-helper";
import type { Fraction } from "../types";

export const yearReviewFractions = makeCompositeReview<Fraction>({
  subs: [
    { key: "simplify-fraction", gen: simplifyFraction },
    { key: "fraction-common-denominator", gen: fractionCommonDenominator },
    { key: "fraction-add", gen: fractionAdd },
    { key: "fraction-subtract", gen: fractionSubtract },
    { key: "fraction-multiply", gen: fractionMultiply },
    { key: "fraction-divide", gen: fractionDivide },
    { key: "fraction-concept", gen: fractionConcept },
  ],
  answerFormat: "fraction",
  time: { 1: 60, 2: 75, 3: 90 },
});
