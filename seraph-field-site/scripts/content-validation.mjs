export function validateFrontmatterContract(frontmatter, content, relativePath) {
  const errors = [];
  const normalizedCategory = normalizeCategory(frontmatter.category);
  const trackedVersionIds = resolveTrackedVersionIds(frontmatter.trackedVersions ?? frontmatter.tracked_versions);

  if (typeof frontmatter.title !== 'string' || !frontmatter.title.trim()) {
    errors.push('title is required');
  }

  if (
    !(
      (frontmatter.date instanceof Date && !Number.isNaN(frontmatter.date.getTime())) ||
      (typeof frontmatter.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(frontmatter.date.trim()))
    )
  ) {
    errors.push('date must use YYYY-MM-DD');
  }

  if (!normalizedCategory) {
    errors.push('category must be one of THEORY, PAPER, REPO, IMPLEMENT');
  }

  if (!Array.isArray(frontmatter.tags) || frontmatter.tags.some((tag) => typeof tag !== 'string' || !tag.trim())) {
    errors.push('tags must be a non-empty YAML string array');
  }

  if (typeof frontmatter.summary !== 'string' || !frontmatter.summary.trim()) {
    errors.push('summary is required');
  }

  const firstContentLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  if (!firstContentLine || !firstContentLine.startsWith('# ')) {
    errors.push('body must start with a single # heading');
  }

  if (normalizedCategory !== 'REPO' && trackedVersionIds.length > 0) {
    errors.push('tracked_versions is only allowed for REPO documents');
  }

  const localPathPattern = /(?:[A-Za-z]:\\|file:\/\/)/;
  if (localPathPattern.test(JSON.stringify(frontmatter)) || localPathPattern.test(content)) {
    errors.push('absolute local paths are not allowed in public RAW content');
  }

  if (errors.length > 0) {
    throw new Error(`[${relativePath}] ${errors.join('; ')}`);
  }
}

function normalizeCategory(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return ['THEORY', 'PAPER', 'REPO', 'IMPLEMENT'].includes(normalized) ? normalized : null;
}

function resolveTrackedVersionIds(value) {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => typeof entry === 'string')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}
