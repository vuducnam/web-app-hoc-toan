import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";
import { remarkFigureDirective } from "@/lib/knowledge-notes/remark-figure-directive";

interface HastDataNode {
  type: string;
  data?: { hName?: string; hProperties?: Record<string, unknown> };
}

function parseAndTransform(md: string): HastDataNode[] {
  const tree = unified().use(remarkParse).use(remarkDirective).use(remarkFigureDirective).parse(md);
  // unified.parse returns a Root, but the plugin runs on the transformer chain — call .runSync to apply.
  const ran = unified().use(remarkParse).use(remarkDirective).use(remarkFigureDirective).runSync(tree);
  const collected: HastDataNode[] = [];
  visit(ran as Parameters<typeof visit>[0], (node: unknown) => {
    const n = node as HastDataNode;
    if (n.data?.hName === "div" && n.data.hProperties && "data-figure" in n.data.hProperties) {
      collected.push(n);
    }
  });
  return collected;
}

describe("remark-figure-directive", () => {
  it("transforms ::figure leaf directive into a div with data-figure JSON", () => {
    const nodes = parseAndTransform("::figure{kind=triangle base=5 height=4 unit=cm}");
    expect(nodes).toHaveLength(1);
    const spec = JSON.parse(nodes[0].data!.hProperties!["data-figure"] as string);
    expect(spec).toEqual({ kind: "triangle", base: 5, height: 4, unit: "cm" });
  });

  it("keeps non-numeric attributes as strings (symbolic dims)", () => {
    const nodes = parseAndTransform("::figure{kind=triangle base=a height=h}");
    expect(nodes).toHaveLength(1);
    const spec = JSON.parse(nodes[0].data!.hProperties!["data-figure"] as string);
    expect(spec).toEqual({ kind: "triangle", base: "a", height: "h" });
  });

  it("handles the ? unknown-side marker as a string", () => {
    const nodes = parseAndTransform("::figure{kind=rectangle width=10 height=?}");
    expect(nodes).toHaveLength(1);
    const spec = JSON.parse(nodes[0].data!.hProperties!["data-figure"] as string);
    expect(spec.height).toBe("?");
  });

  it("ignores non-figure directives", () => {
    const nodes = parseAndTransform("::warning{message=hello}");
    expect(nodes).toHaveLength(0);
  });

  it("supports multiple figures in one document", () => {
    const md = [
      "::figure{kind=triangle base=a height=h}",
      "",
      "Some prose.",
      "",
      "::figure{kind=circle radius=r}",
    ].join("\n");
    const nodes = parseAndTransform(md);
    expect(nodes).toHaveLength(2);
  });
});
