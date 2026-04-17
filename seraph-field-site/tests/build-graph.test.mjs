import { describe, it, expect } from "vitest";
import { scanKgTags } from "../scripts/build-graph.mjs";

describe("scanKgTags", () => {
  it("builds reverse index from kg_tags", () => {
    const docs = [
      { path: "a.md", title: "Doc A", date: "2026-01-01", kg_tags: ["Group", "Monoid"] },
      { path: "b.md", title: "Doc B", date: "2026-01-02", kg_tags: ["Group", "strengthen"] },
    ];

    const index = scanKgTags(docs);

    expect(index.Group).toHaveLength(2);
    expect(index.Group[0]).toEqual({ path: "a.md", title: "Doc A", date: "2026-01-01" });
    expect(index.Monoid).toHaveLength(1);
    expect(index.strengthen).toHaveLength(1);
  });

  it("returns empty for no docs", () => {
    expect(scanKgTags([])).toEqual({});
  });

  it("skips docs without kg_tags", () => {
    const docs = [
      { path: "a.md", title: "Doc A", date: "2026-01-01", kg_tags: [] },
      { path: "b.md", title: "Doc B", date: "2026-01-02" },
    ];

    const index = scanKgTags(docs);
    expect(Object.keys(index)).toHaveLength(0);
  });
});
