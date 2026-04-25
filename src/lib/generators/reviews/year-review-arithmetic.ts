import "server-only";
// G4 year-end arithmetic review — broader pool than semester1.
// Includes all G4 NUMERIC arithmetic + number-sense generators.
import { addSub100kCarry } from "../arithmetic/add-sub-100k-carry";
import { addLargeNumbers } from "../arithmetic/add-large-numbers";
import { subLargeNumbers } from "../arithmetic/sub-large-numbers";
import { multiply1Digit } from "../arithmetic/multiply-1-digit";
import { multiply2Digit } from "../arithmetic/multiply-2-digit";
import { divide1Digit } from "../arithmetic/divide-1-digit";
import { divide2Digit } from "../arithmetic/divide-2-digit";
import { multiplyDividePowers10 } from "../arithmetic/multiply-divide-powers-10";
import { numbersTo100k } from "../number-sense/numbers-to-100k";
import { placeValue6digit } from "../number-sense/place-value-6digit";
import { rounding } from "../number-sense/rounding";
import { makeCompositeReview } from "./composite-helper";

export const yearReviewArithmetic = makeCompositeReview<number>({
  subs: [
    { key: "add-sub-100k-carry", gen: addSub100kCarry },
    { key: "add-large-numbers", gen: addLargeNumbers },
    { key: "sub-large-numbers", gen: subLargeNumbers },
    { key: "multiply-1-digit", gen: multiply1Digit },
    { key: "multiply-2-digit", gen: multiply2Digit },
    { key: "divide-1-digit", gen: divide1Digit },
    { key: "divide-2-digit", gen: divide2Digit },
    { key: "multiply-divide-powers-10", gen: multiplyDividePowers10 },
    { key: "numbers-to-100k", gen: numbersTo100k },
    { key: "place-value-6digit", gen: placeValue6digit },
    { key: "rounding", gen: rounding },
  ],
  answerFormat: "numeric",
  time: { 1: 60, 2: 75, 3: 90 },
});
