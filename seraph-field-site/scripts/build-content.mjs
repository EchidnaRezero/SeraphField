import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { validateFrontmatterContract } from "./content-validation.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const rawRoot = path.resolve(process.env.RAW_CONTENT_PATH ?? path.join(projectRoot, "..", "RAW"));
const outputDir = path.join(projectRoot, "src", "generated");
const postsOutputPath = path.join(outputDir, "posts.json");
const searchIndexOutputPath = path.join(outputDir, "search-index.json");
const versionRegistryPath = path.join(rawRoot, "_meta", "version-registry.json");

const categoryMap = new Map([
  ["theory", "THEORY"],
  ["paper", "PAPER"],
  ["repo", "REPO"],
  ["implement", "IMPLEMENT"],
  ["implementation", "IMPLEMENT"],
  ["math", "THEORY"],
  ["physics", "THEORY"],
  ["수학", "THEORY"],
  ["물리", "THEORY"],
  ["논문", "PAPER"],
  ["레포", "REPO"],
  ["구현", "IMPLEMENT"],
  ["개발", "IMPLEMENT"],
  ["코드", "IMPLEMENT"],
]);

async function main() {
  const markdownFiles = await collectMarkdownFiles(rawRoot);
  const versionRegistry = await loadVersionRegistry(versionRegistryPath);
  const draftPosts = [];

  for (const filePath of markdownFiles) {
    const source = await fs.readFile(filePath, "utf8");
    const stats = await fs.stat(filePath);
    const relativePath = path.relative(rawRoot, filePath).replaceAll("\\", "/");
    const parsed = matter(source);
    validateFrontmatterContract(parsed.data, parsed.content, relativePath);

    draftPosts.push({
      filePath,
      relativePath,
      parsed,
      title: resolveTitle(parsed.data.title, parsed.content, filePath),
      category: resolveCategory(parsed.data.category, relativePath),
      date: resolveDate(parsed.data.date, stats.mtime),
      slug: resolveSlug(parsed.data.slug, relativePath),
      trackedVersionIds: resolveTrackedVersionIds(parsed.data.trackedVersions ?? parsed.data.tracked_versions),
    });
  }

  const linkRegistry = buildLinkRegistry(draftPosts);
  const posts = [];
  const searchIndex = [];

  for (const draftPost of draftPosts) {
    const normalizedContent = transformInternalLinks(draftPost.parsed.content.trim(), draftPost.relativePath, linkRegistry);
    const title = draftPost.title;
    const category = draftPost.category;
    const tags = resolveTags(draftPost.parsed.data.tags, normalizedContent);
    const date = draftPost.date;
    const summary = resolveSummary(draftPost.parsed.data.summary, normalizedContent);
    const slug = draftPost.slug;
    const id = slug;
    const versions = resolveVersions(draftPost.trackedVersionIds, versionRegistry);
    const rawText = toSearchText(title, normalizedContent, tags, category, versions);

    const post = {
      id,
      slug,
      title,
      date,
      category,
      tags,
      summary,
      content: normalizedContent,
      sourcePath: draftPost.relativePath,
      ...(versions.length > 0 ? { versions } : {}),
    };

    posts.push(post);
    searchIndex.push({
      id,
      slug,
      title,
      date,
      category,
      tags,
      summary,
      rawText,
      sourcePath: draftPost.relativePath,
    });
  }

  posts.sort((left, right) => {
    const dateDiff = new Date(right.date).getTime() - new Date(left.date).getTime();
    return dateDiff !== 0 ? dateDiff : left.title.localeCompare(right.title, "ko");
  });

  searchIndex.sort((left, right) => posts.findIndex((post) => post.id === left.id) - posts.findIndex((post) => post.id === right.id));

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(postsOutputPath, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
  await fs.writeFile(searchIndexOutputPath, `${JSON.stringify(searchIndex, null, 2)}\n`, "utf8");

  console.log(`Generated ${posts.length} posts from ${rawRoot}`);
}

async function collectMarkdownFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "_meta") {
      continue;
    }

    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function loadVersionRegistry(filePath) {
  try {
    const source = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(source);
    const entries = parsed?.versions && typeof parsed.versions === "object" ? parsed.versions : parsed;
    const registry = new Map();

    for (const [id, value] of Object.entries(entries ?? {})) {
      if (!value || typeof value !== "object") {
        continue;
      }

      const library = typeof value.library === "string" && value.library.trim() ? value.library.trim() : id;
      const version = typeof value.version === "string" && value.version.trim() ? value.version.trim() : "unknown";
      const date = typeof value.date === "string" && value.date.trim() ? value.date.trim() : "";
      const url = typeof value.url === "string" && value.url.trim() ? value.url.trim() : undefined;

      registry.set(id, { library, version, date, ...(url ? { url } : {}) });
    }

    return registry;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return new Map();
    }

    throw error;
  }
}

function buildLinkRegistry(posts) {
  const registry = new Map();

  for (const post of posts) {
    const relativeNoExt = post.relativePath.replace(/\.md$/i, "");
    const fileName = path.basename(post.relativePath, ".md");

    addLinkKey(registry, post.slug, post.slug);
    addLinkKey(registry, post.title, post.slug);
    addLinkKey(registry, fileName, post.slug);
    addLinkKey(registry, relativeNoExt, post.slug);
  }

  return registry;
}

function addLinkKey(registry, key, slug) {
  const normalized = normalizeLinkTarget(key);
  if (normalized && !registry.has(normalized)) {
    registry.set(normalized, slug);
  }
}

function transformInternalLinks(content, relativePath, linkRegistry) {
  let transformed = content.replace(/\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_match, rawTarget, rawLabel) => {
    const target = String(rawTarget).trim();
    const label = typeof rawLabel === "string" && rawLabel.trim() ? rawLabel.trim() : target;
    const slug = resolveInternalTarget(target, relativePath, linkRegistry);

    if (!slug) {
      return label;
    }

    return `[${label}](post://${slug})`;
  });

  transformed = transformed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, rawLabel, rawHref) => {
    const href = String(rawHref).trim();

    if (/^(https?:|mailto:|#|post:\/\/)/i.test(href)) {
      return match;
    }

    const slug = resolveInternalTarget(href, relativePath, linkRegistry);
    if (!slug) {
      return match;
    }

    return `[${rawLabel}](post://${slug})`;
  });

  return transformed;
}

function resolveInternalTarget(target, relativePath, linkRegistry) {
  const cleanedTarget = String(target).split("#")[0].trim();
  if (!cleanedTarget) {
    return null;
  }

  const direct = linkRegistry.get(normalizeLinkTarget(cleanedTarget));
  if (direct) {
    return direct;
  }

  if (cleanedTarget.includes("/") || cleanedTarget.includes("\\") || cleanedTarget.endsWith(".md")) {
    const baseDir = path.posix.dirname(relativePath.replaceAll("\\", "/"));
    const resolved = path.posix.normalize(path.posix.join(baseDir, cleanedTarget)).replace(/\.md$/i, "");
    return linkRegistry.get(normalizeLinkTarget(resolved)) ?? null;
  }

  return null;
}

function normalizeLinkTarget(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replaceAll("\\", "/")
    .replace(/\.md$/i, "")
    .replace(/^\.\/+/, "")
    .replace(/^\/+/, "")
    .toLowerCase();
}

function resolveTitle(frontmatterTitle, content, filePath) {
  if (typeof frontmatterTitle === "string" && frontmatterTitle.trim()) {
    return frontmatterTitle.trim();
  }

  const heading = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith("# "));

  if (heading) {
    return heading.replace(/^#\s+/, "").trim();
  }

  return path.basename(filePath, ".md");
}

function resolveCategory(frontmatterCategory, relativePath) {
  const normalizedFrontmatter = normalizeCategory(frontmatterCategory);
  if (normalizedFrontmatter) {
    return normalizedFrontmatter;
  }

  const topLevelDir = relativePath.split("/")[0]?.toLowerCase();
  return categoryMap.get(topLevelDir) ?? "THEORY";
}

function normalizeCategory(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return ["THEORY", "PAPER", "REPO", "IMPLEMENT"].includes(normalized) ? normalized : null;
}

function resolveTags(frontmatterTags, content) {
  const tags = new Set();

  if (Array.isArray(frontmatterTags)) {
    for (const tag of frontmatterTags) {
      if (typeof tag === "string" && tag.trim()) {
        tags.add(tag.trim());
      }
    }
  }

  const hashtagMatches = content.matchAll(/(^|\s)#([A-Za-z0-9_가-힣/-]+)/gu);
  for (const match of hashtagMatches) {
    if (match[2]) {
      tags.add(match[2]);
    }
  }

  return Array.from(tags);
}

function resolveDate(frontmatterDate, modifiedAt) {
  if (frontmatterDate instanceof Date && !Number.isNaN(frontmatterDate.getTime())) {
    return frontmatterDate.toISOString().slice(0, 10);
  }

  if (typeof frontmatterDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(frontmatterDate.trim())) {
    return frontmatterDate.trim();
  }

  return modifiedAt.toISOString().slice(0, 10);
}

function resolveSummary(frontmatterSummary, content) {
  if (typeof frontmatterSummary === "string" && frontmatterSummary.trim()) {
    return frontmatterSummary.trim();
  }

  const paragraphs = content
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => !block.startsWith("#"))
    .filter((block) => !block.startsWith("$$"))
    .map((block) => stripMarkdown(block));

  const firstParagraph = paragraphs.find(Boolean);
  if (!firstParagraph) {
    return "";
  }

  return firstParagraph.length > 140 ? `${firstParagraph.slice(0, 137).trim()}...` : firstParagraph;
}

function resolveSlug(frontmatterSlug, relativePath) {
  if (typeof frontmatterSlug === "string" && frontmatterSlug.trim()) {
    return frontmatterSlug.trim();
  }

  return relativePath
    .replace(/\.md$/i, "")
    .replaceAll("\\", "/")
    .split("/")
    .map((segment) => segment.trim().toLowerCase().replace(/\s+/g, "-"))
    .join("--");
}

function resolveTrackedVersionIds(value) {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function resolveVersions(trackedVersionIds, versionRegistry) {
  return trackedVersionIds
    .map((id) => versionRegistry.get(id))
    .filter(Boolean);
}

function toSearchText(title, content, tags, category, versions) {
  const versionText = versions.map((entry) => `${entry.library} ${entry.version} ${entry.date}`.trim()).join(" ");

  return [title, stripMarkdown(content), tags.join(" "), category, versionText]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMarkdown(content) {
  return content
    .replace(/^```[\s\S]*?^```$/gmu, " ")
    .replace(/\$\$[\s\S]*?\$\$/gmu, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "$1")
    .replace(/^>\s?/gmu, "")
    .replace(/^#+\s+/gmu, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

main().catch((error) => {
  console.error("Failed to build content:", error);
  process.exit(1);
});
