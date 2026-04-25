// Shared SVG style constants for geometry figures — keeps SGK Kết nối tri thức
// look consistent across all 8 components (stroke colour, dash pattern, label font).

export const FIG_STROKE = "#1a1a1a"; // ink-900
export const FIG_STROKE_WIDTH = 2;
export const FIG_HIDDEN_DASH = "4 3";
export const FIG_LABEL_FONT = "14";
export const FIG_LABEL_COLOUR = "#1a1a1a";
export const FIG_SHADE_FILL = "#a7f3d0"; // pastel mint (≈ bubble-mint-300)
export const FIG_SHADE_OPACITY = 0.4;

/** Convert a Dim (number | string) to a label string with optional unit. */
export function fmtDim(value: number | string, unit?: string): string {
  if (typeof value === "number") {
    return unit ? `${value} ${unit}` : `${value}`;
  }
  return unit ? `${value} ${unit}` : value;
}
