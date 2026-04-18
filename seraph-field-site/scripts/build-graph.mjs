import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const projectRoot = path.resolve(import.meta.dirname, "..");
const rawRoot = path.resolve(
  process.env.RAW_CONTENT_PATH ?? path.join(projectRoot, "..", "RAW")
);
const graphDataPath = path.join(
  projectRoot,
  "src",
  "generated",
  "graph-data.json"
);
const outputPath = path.join(projectRoot, "src", "generated", "kg-docs.json");

/**
 * Pure function: build reverse index from docs with kg_tags.
 * @param {Array<{path: string, title: string, date: string, kg_tags: string[]}>} docs
 * @returns {Record<string, Array<{path: string, title: string, date: string}>>}
 */
export function scanKgTags(docs) {
  const index = {};

  for (const doc of docs) {
    if (!Array.isArray(doc.kg_tags) || doc.kg_tags.length === 0) continue;

    const entry = { path: doc.path, title: doc.title, date: doc.date };

    for (const tag of doc.kg_tags) {
      if (!index[tag]) index[tag] = [];
      index[tag].push(entry);
    }
  }

  return index;
}

async function collectMarkdownFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "_meta") continue;
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  // Load known node IDs from graph-data.json
  let knownIds = new Set();
  try {
    const graphData = JSON.parse(await fs.readFile(graphDataPath, "utf8"));
    for (const node of graphData.nodes ?? []) {
      knownIds.add(node.id);
    }
  } catch {
    console.warn("Warning: graph-data.json not found, skipping ID validation");
  }

  // Scan RAW docs
  const markdownFiles = await collectMarkdownFiles(rawRoot);
  const docs = [];

  for (const filePath of markdownFiles) {
    const source = await fs.readFile(filePath, "utf8");
    const parsed = matter(source);
    const kg_tags = parsed.data.kg_tags;
    if (!Array.isArray(kg_tags) || kg_tags.length === 0) continue;

    const relativePath = path.relative(rawRoot, filePath).replaceAll("\\", "/");
    docs.push({
      path: relativePath,
      title: parsed.data.title ?? path.basename(filePath, ".md"),
      date: resolveDate(parsed.data.date),
      kg_tags,
    });
  }

  // Validate tags against known node IDs
  for (const doc of docs) {
    for (const tag of doc.kg_tags) {
      // Tags that look like PascalCase node IDs but aren't known
      if (/^[A-Z][a-zA-Z]+$/.test(tag) && knownIds.size > 0 && !knownIds.has(tag)) {
        console.warn(
          `Warning: "${tag}" in ${doc.path} looks like a node ID but is not in graph-data`
        );
      }
    }
  }

  const index = scanKgTags(docs);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(index, null, 2) + "\n", "utf8");

  const tagCount = Object.keys(index).length;
  const docCount = docs.length;
  console.log(
    `Built kg-docs index: ${tagCount} tags from ${docCount} documents → ${outputPath}`
  );
}

function resolveDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  return new Date().toISOString().slice(0, 10);
}

main().catch((error) => {
  console.error("Failed to build graph index:", error);
  process.exit(1);
});
