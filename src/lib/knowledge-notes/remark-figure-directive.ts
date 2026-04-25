// Remark plugin transforming `:::figure{kind=K param1=v1 param2=v2}:::` (and the
// inline / leaf variants `::figure{...}`) into a `<div data-figure="...">` HAST
// node carrying a JSON-encoded FigureSpec. NoteMarkdown's custom `div` component
// then renders it via FigureRenderer.
//
// Numeric attribute values are cast to numbers; non-numeric strings (e.g. "a", "h", "?")
// are kept as-is to support the symbolic theory figures used in knowledge notes.
import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root } from "mdast";

const NUMERIC_RE = /^-?\d+(?:\.\d+)?$/;

function castAttr(value: unknown): number | string {
  if (typeof value !== "string") return String(value ?? "");
  return NUMERIC_RE.test(value) ? Number(value) : value;
}

interface DirectiveNode {
  type: "leafDirective" | "containerDirective" | "textDirective";
  name: string;
  attributes?: Record<string, string | null | undefined>;
  data?: { hName?: string; hProperties?: Record<string, unknown> };
}

export const remarkFigureDirective: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, (node) => {
      const dn = node as unknown as DirectiveNode;
      if (
        (dn.type === "leafDirective" ||
          dn.type === "containerDirective" ||
          dn.type === "textDirective") &&
        dn.name === "figure"
      ) {
        const attrs = dn.attributes ?? {};
        const { kind, ...rest } = attrs;
        const params: Record<string, number | string> = {};
        for (const [k, v] of Object.entries(rest)) {
          params[k] = castAttr(v);
        }
        const spec = { kind: kind ?? "unknown", ...params };
        dn.data = {
          hName: "div",
          hProperties: { "data-figure": JSON.stringify(spec) },
        };
      }
    });
  };
};
