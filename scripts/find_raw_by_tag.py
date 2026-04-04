from __future__ import annotations

import argparse
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
RAW_ROOT = ROOT / "RAW"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Find RAW markdown files by frontmatter tags."
    )
    parser.add_argument(
        "tags",
        nargs="+",
        help="One or more tag names to search for.",
    )
    parser.add_argument(
        "--match",
        choices=("any", "all"),
        default="any",
        help="Match files containing any tag or all tags. Default: any.",
    )
    parser.add_argument(
        "--show-tags",
        action="store_true",
        help="Print the matched tag list for each file.",
    )
    return parser.parse_args()


def extract_frontmatter_tags(text: str) -> list[str]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return []

    tags: list[str] = []
    in_tags = False

    for line in lines[1:]:
        stripped = line.strip()

        if stripped == "---":
            break

        if in_tags:
            if line.startswith("  - ") or line.startswith("\t- "):
                value = stripped[2:].strip()
                if value:
                    tags.append(value)
                continue

            if line.startswith("- "):
                value = stripped[2:].strip()
                if value:
                    tags.append(value)
                continue

            if line.startswith(" ") or line.startswith("\t"):
                continue

            in_tags = False

        if stripped == "tags:":
            in_tags = True

    return tags


def normalize_tags(tags: Iterable[str]) -> set[str]:
    return {tag.casefold() for tag in tags}


def matches(file_tags: list[str], query_tags: set[str], mode: str) -> bool:
    normalized = normalize_tags(file_tags)
    if mode == "all":
        return query_tags.issubset(normalized)
    return bool(normalized & query_tags)


def main() -> int:
    args = parse_args()
    query_tags = normalize_tags(args.tags)

    matches_found: list[tuple[Path, list[str]]] = []

    for path in sorted(RAW_ROOT.rglob("*.md")):
        text = path.read_text(encoding="utf-8")
        file_tags = extract_frontmatter_tags(text)
        if matches(file_tags, query_tags, args.match):
            matches_found.append((path, file_tags))

    if not matches_found:
        print("No files matched.")
        return 1

    for path, file_tags in matches_found:
        relative_path = path.relative_to(ROOT)
        if args.show_tags:
            print(f"{relative_path} :: {', '.join(file_tags)}")
        else:
            print(relative_path)

    print(f"\nMatched {len(matches_found)} file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
