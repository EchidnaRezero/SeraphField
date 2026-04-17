import { createRequire } from "module";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(
  path.resolve(import.meta.dirname, "..", "seraph-field-site", "package.json")
);
const Database = require("better-sqlite3");

const dbPath = path.resolve(import.meta.dirname, "math-kg.db");
const outputPath = path.resolve(
  import.meta.dirname,
  "..",
  "seraph-field-site",
  "src",
  "generated",
  "graph-data.json"
);

const REVERSE_LABELS = { strengthen: "완화" };

const db = new Database(dbPath, { readonly: true });

const edgeTypes = {};
for (const row of db.prepare("SELECT * FROM edge_types").all()) {
  edgeTypes[row.id] = {
    label: row.label,
    color: row.color,
    dash: row.dash,
    reverseLabel: REVERSE_LABELS[row.id] ?? null,
  };
}

const tagGroups = {};
for (const row of db.prepare("SELECT * FROM tag_groups").all()) {
  tagGroups[row.id] = { label: row.label, color: row.color };
}

const nodes = db
  .prepare("SELECT id, label, type, category, desc FROM nodes")
  .all();

const edgeRows = db
  .prepare(
    `SELECT e.id, e.source, e.target, e.type, e.label, e.detail
     FROM edges e`
  )
  .all();

const tagStmt = db.prepare(
  "SELECT tag_id FROM edge_tags WHERE edge_id = ?"
);

const edges = edgeRows.map((e) => ({
  id: e.id,
  source: e.source,
  target: e.target,
  type: e.type,
  tags: tagStmt.all(e.id).map((t) => t.tag_id),
  label: e.label,
  detail: e.detail,
}));

db.close();

const data = { edgeTypes, tagGroups, nodes, edges };

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2) + "\n", "utf8");

console.log(
  `Exported ${nodes.length} nodes, ${edges.length} edges → ${outputPath}`
);
