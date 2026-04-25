import "server-only";
// G5 year-end comprehensive review — largest pool, NUMERIC only.
// Per locked decision (2026-04-25): pull from EVERY sub-generator that emits
// NUMERIC. Excludes FRACTION/DECIMAL/MC subs until Phase 14 introduces
// mixed-format input adapter.
//
// Composition: G4 year-review-arithmetic subs + measurement/geometry NUMERIC.
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
import { lengthConversion } from "../measurement/length-conversion";
import { massConversion } from "../measurement/mass-conversion";
import { capacityConversion } from "../measurement/capacity-conversion";
import { areaUnitConversion } from "../measurement/area-unit-conversion";
import { volumeUnits } from "../measurement/volume-units";
import { rectangularPrismVolume } from "../measurement/rectangular-prism-volume";
import { timeMeasurement } from "../measurement/time-measurement";
import { makeCompositeReview } from "./composite-helper";

export const yearReviewComprehensive = makeCompositeReview<number>({
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
    { key: "length-conversion", gen: lengthConversion },
    { key: "mass-conversion", gen: massConversion },
    { key: "capacity-conversion", gen: capacityConversion },
    { key: "area-unit-conversion", gen: areaUnitConversion },
    { key: "volume-units", gen: volumeUnits },
    { key: "rectangular-prism-volume", gen: rectangularPrismVolume },
    { key: "time-measurement", gen: timeMeasurement },
  ],
  answerFormat: "numeric",
  time: { 1: 75, 2: 90, 3: 105 },
});
