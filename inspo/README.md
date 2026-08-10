# Design Inspiration

Paired screenshots and prompts, matched by number.

```
inspo/
  screenshots/
    001.png
    002.png
    ...
  prompts/
    001.md
    002.md
    ...
```

`screenshots/001.png` and `prompts/001.md` describe the same piece of inspiration — the number is the only link between them, so keep them in sync (drop a screenshot in, add its matching prompt file with the same number, same extension-less basename).

## Prompt file format

Each `prompts/NNN.md` has a tag line, then the prompt itself:

```markdown
tags: canvas, dag, node-card, hover-state

Prompt:
A light editorial-themed interactive DAG canvas with white rounded node
cards, indigo (#4f46e5) connecting edges, animated flow dots traveling
along each edge, subtle drop shadow on hover.
```

- **tags** — short, lowercase, comma-separated, no spec needed beyond being descriptive enough to scan/grep across all prompt files at once.
- **Prompt** — plain description of what the screenshot is showing / what to aim for when building the equivalent — written as if it were the prompt that generated or would generate this look. Doesn't need to be a literally reusable AI-image prompt, just descriptive enough that Claude (or you, months later) can read it without looking at the image and understand what it's inspiring.

## Usage note for Claude / scaffolding skills

Check `prompts/*.md` (grep tags first, cross-reference `screenshots/NNN.png` for the actual image) before making visual/interaction decisions not already pinned down in `../CLAUDE.md`. `CLAUDE.md` remains the source of truth if the two conflict — these are references for open details, not a spec override.
