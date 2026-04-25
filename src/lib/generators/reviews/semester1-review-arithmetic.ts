import "server-only";
// G4 semester 1 review — pulls from G4 number-sense + arithmetic NUMERIC subs.
import { addSub100kCarry } from "../arithmetic/add-sub-100k-carry";
import { addLargeNumbers } from "../arithmetic/add-large-numbers";
import { subLargeNumbers } from "../arithmetic/sub-large-numbers";
import { numbersTo100k } from "../number-sense/numbers-to-100k";
import { placeValue6digit } from "../number-sense/place-value-6digit";
import { rounding } from "../number-sense/rounding";
import { makeCompositeReview } from "./composite-helper";

export const semester1ReviewArithmetic = makeCompositeReview<number>({
  subs: [
    { key: "add-sub-100k-carry", gen: addSub100kCarry },
    { key: "add-large-numbers", gen: addLargeNumbers },
    { key: "sub-large-numbers", gen: subLargeNumbers },
    { key: "numbers-to-100k", gen: numbersTo100k },
    { key: "place-value-6digit", gen: placeValue6digit },
    { key: "rounding", gen: rounding },
  ],
  answerFormat: "numeric",
  time: { 1: 60, 2: 75, 3: 90 },
});
