# Documentation Style Guide — Eagle-Fusion

How to write project documentation so every contributor produces uniform, on-brand docs.

## Where docs live
- All project docs go in **`docs/`** at the repo root.
- Release notes go in **`RELEASE_NOTES/`** (see [Release Process in CLAUDE.md](../CLAUDE.md#release-process)).
- Keep one topic per file; name files in `kebab-case` (e.g. `recommendation-api-migration.md`).

## Two formats — always ship both for substantial docs
1. **Markdown (`.md`)** — the source of truth; previews in VS Code (`Ctrl+Shift+V`) and renders on GitHub.
2. **Word-compatible HTML (`.html`)** — for stakeholders who open docs in Word/browser. Use the inline-CSS template below so the file is self-contained and on-brand.

For short internal notes, Markdown alone is fine. For anything shared outside the dev team (API references, migration write-ups, runbooks), provide the HTML companion too. See `docs/recommendation-api-migration.{md,html}` as the reference example.

## Brand colors (use these exact values)
| Role | Hex | Use |
|---|---|---|
| Navy (primary) | `#17283C` | Headings, table header background, borders |
| Teal (accent) | `#1E8F8E` / `#186E6E` | Links, left-border accents on callouts/code |
| Gold (highlight) | `#F0A500` | Warnings / "note" callouts |
| Body text | `#0D1218` | Paragraph text |
| Muted | `#7C8696` | Meta lines, captions |
| Light fill | `#F6F7F9` | Code/`pre` backgrounds, zebra table rows |

## Word-compatible HTML template
Start every HTML doc from this skeleton (Calibri/Open Sans body, navy headings, teal links, bordered tables, `info`/`note` callouts):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><!-- Doc title --></title>
  <style>
    body { font-family: 'Open Sans', Calibri, Arial, sans-serif; font-size: 11pt; color: #0D1218; margin: 72pt; line-height: 1.5; }
    h1 { font-size: 18pt; font-weight: 700; color: #17283C; border-bottom: 2pt solid #17283C; padding-bottom: 4pt; margin-top: 24pt; }
    h2 { font-size: 14pt; font-weight: 600; color: #17283C; margin-top: 20pt; margin-bottom: 6pt; }
    h3 { font-size: 12pt; font-weight: 600; color: #18293D; margin-top: 14pt; margin-bottom: 4pt; }
    p  { margin: 6pt 0; }
    a  { color: #186E6E; text-decoration: underline; }
    code { font-family: 'JetBrains Mono', Consolas, monospace; font-size: 9pt; background: #F6F7F9; padding: 1pt 3pt; border-radius: 2pt; }
    pre  { font-family: 'JetBrains Mono', Consolas, monospace; font-size: 8.5pt; background: #F6F7F9; border: 1pt solid #D8DEE5; border-left: 3pt solid #1E8F8E; padding: 10pt 12pt; white-space: pre-wrap; word-wrap: break-word; }
    table { border-collapse: collapse; width: 100%; margin: 10pt 0; font-size: 10pt; }
    th { background: #17283C; color: #fff; padding: 6pt 8pt; text-align: left; font-weight: 600; }
    td { border: 0.5pt solid #D8DEE5; padding: 5pt 8pt; vertical-align: top; }
    tr:nth-child(even) td { background: #F6F7F9; }
    .meta { color: #7C8696; font-size: 10pt; }
    .info { background: #E3F7F6; border-left: 4pt solid #1E8F8E; padding: 8pt 12pt; margin: 10pt 0; font-size: 10pt; }
    .note { background: #FEF6E0; border-left: 4pt solid #F0A500; padding: 8pt 12pt; margin: 10pt 0; font-size: 10pt; }
    .section-divider { border: none; border-top: 1pt solid #D8DEE5; margin: 20pt 0; }
  </style>
</head>
<body>
  <h1><!-- Title --></h1>
  <p class="meta">Scope / date / branch</p>
  <!-- content -->
</body>
</html>
```

## Content conventions
- Open with a one-paragraph **Summary** (a non-engineer should understand the "what" and "why").
- Use tables for mappings/comparisons; use `info` (teal) for key takeaways and `note` (gold) for warnings/risks.
- Reference code with repo-relative links, e.g. `[apiConstants.ts](../src/app/constants/apiConstants.ts)`.
- When documenting commits/releases, include the short SHA in parentheses.
- No "Generated with Claude Code" / AI attribution anywhere in docs (matches commit policy).
