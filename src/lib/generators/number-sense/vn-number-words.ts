// Vietnamese number-to-words helper for integers 1–100 000.
// Used by numbers-to-100k.ts and 6-digit-numbers.ts.
// Edge-case coverage: avoids "mốt" (1 in ones after non-zero tens), "lăm" (5 in ones after tens),
// "linh/lẻ" (zero tens with non-zero ones). These forms are linguistically valid but
// generate() callers in D1/D2 avoid them by range constraints — D3 includes them.

const ONES = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

/** Render tens + ones (0-99), given a flag for whether this is inside a larger number. */
function renderTensOnes(tens: number, ones: number, insideLarger: boolean): string {
  if (tens === 0 && ones === 0) return insideLarger ? "không trăm" : "không";
  if (tens === 0) {
    // zero tens with non-zero ones — "linh X" pattern
    return insideLarger ? `linh ${ONES[ones]}` : ONES[ones];
  }
  if (tens === 1) {
    const onesWord = ones === 0 ? "" : ones === 5 ? " lăm" : ` ${ONES[ones]}`;
    return `mười${onesWord}`;
  }
  const tensWord = `${ONES[tens]} mươi`;
  if (ones === 0) return tensWord;
  if (ones === 1) return `${tensWord} mốt`;
  if (ones === 5) return `${tensWord} lăm`;
  return `${tensWord} ${ONES[ones]}`;
}

/** Render hundreds component (0-999). insideLarger = part of a bigger number (adds "không trăm" for zero hundreds). */
function renderHundreds(n: number, insideLarger: boolean): string {
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  const tens = Math.floor(remainder / 10);
  const ones = remainder % 10;

  if (hundreds === 0) {
    if (!insideLarger) return renderTensOnes(tens, ones, false);
    return renderTensOnes(tens, ones, true);
  }
  const hundredsWord = `${ONES[hundreds]} trăm`;
  if (tens === 0 && ones === 0) return hundredsWord;
  return `${hundredsWord} ${renderTensOnes(tens, ones, true)}`;
}

/**
 * Convert integer n (1 – 100 000) to Vietnamese words.
 * 100 000 → "một trăm nghìn"
 */
export function numberToVietnameseWords(n: number): string {
  if (n === 100_000) return "một trăm nghìn";
  if (n <= 0) return ONES[0];

  const thousands = Math.floor(n / 1000);
  const remainder = n % 1000;

  if (thousands === 0) return renderHundreds(n, false);

  const thousandsWord = thousands === 1 ? "một nghìn" : `${renderHundreds(thousands, false)} nghìn`;
  if (remainder === 0) return thousandsWord;
  return `${thousandsWord} ${renderHundreds(remainder, true)}`;
}
