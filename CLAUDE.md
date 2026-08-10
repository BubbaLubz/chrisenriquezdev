# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read this first: where the last session left off

The repo is now real and pushed — `github.com/BubbaLubz/bubba-portfolio`, `main` branch, working tree clean as of commit `c1055cd`. The old "no `.git` of its own" issue below is resolved; don't re-run `git init` or re-add the remote.

What changed, in case it looks surprising in the code:

- **The per-project architecture diagrams (`MiniArchitecture.jsx`) went back and forth this session.** A progressive-disclosure version was built (spine visible by default, branch nodes file out on click) per an explicit request, then **explicitly reverted** back to "everything renders at once, always" per a follow-up request ("reverse back to original layout with everything open"). Don't reintroduce click-to-reveal/hidden-branch behavior unless asked again — the current always-open state is the deliberate final call, not an oversight.
- **Two real bugs were found and fixed in `MiniArchitecture.jsx`:**
  1. Dense diagrams (PFAS has 9 columns) were silently clipping off-screen on any viewport narrower than their natural width, with no way to scroll to the hidden part. Fixed: the diagram's own container now scrolls horizontally when content overflows (`overflow-x-auto`, only in the unzoomed state — zoomed state uses `overflow-x-hidden` because Chrome factors an element's own `transform` into its ancestor's scrollable-overflow calculation, which was surfacing a spurious scrollbar during the zoom-in animation). The scrollbar chrome itself is visually hidden via a reusable `.no-scrollbar` class in `index.css` (scroll still works via wheel/trackpad/touch/keyboard) — this trades away the visual affordance that the diagram is scrollable, worth knowing if legibility on mobile ever comes up again.
  2. Tailwind's color-opacity modifier syntax (`border-border/60`, `text-ink/80`) **silently fails** on this project's custom color tokens — they're plain `oklch(...)` strings in `tailwind.config.js`, not the `<alpha-value>`-placeholder pattern Tailwind needs to generate opacity variants. The classes compiled to nothing and elements fell back to Tailwind's unrelated built-in defaults (a border that *looked* right by coincidence, and text that wasn't dimmed at all — caught via `getComputedStyle`, not by eye). **Never use a `/opacity` modifier on `bg`/`surface`/`border`/`ink`/`muted`/`accent`** — use the standalone `opacity-*` utility on the whole element instead (that one always works, it's plain CSS `opacity`), or an existing token at full strength (e.g. `text-muted` instead of `text-ink/80`).
- **Spine vs. branch node styling added** to `MiniArchitecture.jsx`: whichever row has the most nodes is treated as the "spine" (detected from data, not authored); every other row gets a dashed border + `text-muted` label instead of the solid/`text-ink` spine treatment. Purely visual — nothing is hidden, it just gives dense diagrams (PFAS's 19 nodes) a scannable primary path instead of one undifferentiated wall of boxes.
- **Edge-label authoring rule**, documented inline as a comment above the `edges` array in `projects.js`: keep every individual token to ~7 characters or fewer. The connector cell wraps between words but never mid-word, so one long token — not the label's total word count — is what overflows the fixed-width cell and crowds neighboring nodes.
- **Stage mapping changed since this doc was first written**: it's currently **Ingestion** = Cloud Music Analytics Platform, **Transformation** = PFAS Analytic Pipeline (retitled from "PFAS Trend Analysis Reporting Layer"), **Storage** = AI Data Infrastructure Diagram Tool, **Serving** = StickSplit. (Transformation and Serving were swapped from an earlier mapping — check `projects.js`'s `stageBadge` fields directly if this ever looks stale again.)
- **Connector color diverges from `DESIGN.md`'s original spec on purpose.** An attempt to switch the connector pulse from neutral gray (`text-border`) to Signal Blue (`text-accent`) — which is what the design system originally specified — was explicitly reverted back to gray. `DESIGN.md` has been updated to document gray as the current, intentional state. If Signal Blue connectors are wanted later, that's a real ask to make again, not a bug to silently fix.
- **The page-level scrollbar is hidden site-wide** (`html { scrollbar-width: none }` + `::-webkit-scrollbar { display: none }` in `index.css`) — scrolling still works everywhere, it's purely a visual choice for a cleaner look.

Still open, unchanged from before: deployment target, contact mechanism, StickSplit's repo link, and live demo URLs for all three projects (see Open Decisions and Known gaps below).

## Project Overview

**bubba-portfolio-web** is a personal portfolio site whose homepage renders the actual data engineering lifecycle diagram (Reis & Housley, *Fundamentals of Data Engineering*) — Generation → [Ingestion → Transformation → Serving] over a Storage layer → Output, with an Undercurrents skills band beneath. This is deliberately the *real, canonical* diagram, not an invented metaphor: recognizability is what does the credibility work. Each of the four inner stages (Ingestion/Transformation/Storage/Serving) represents exactly one real project — click a stage, see that project's detail. Generation is an About card; Output holds Resume/Contact/Links.

This project went through two prior directions before landing here, both documented as history, neither current:
- **v0**: light/editorial theme, indigo accent, no diagram concept yet.
- **v1**: an invented DAG-of-my-career canvas (ReactFlow + Dagre, free-drag, dark/cinematic/amber theme). Built and shipped, then reverted after user feedback: *"too moody and dev-tool-coded... trying too hard to impress."*
- **v2 (current)**: the real lifecycle diagram, fixed layout, near-monochrome, quiet. See `PRODUCT.md`'s Anti-references and Design Principles for what was learned from v1 and must not recur.

## Repo

Standalone git repo rooted at `bubba-portfolio-web` itself (it used to inherit the home-directory repo — that's fixed). Remote: `https://github.com/BubbaLubz/bubba-portfolio.git`, branch `main`.

## Tech Stack

- React + Vite
- React Router for deep-linkable project routes
- Tailwind CSS — see `DESIGN.md` for tokens
- **No ReactFlow, no Dagre, no canvas/graph library.** v1 used both; v2 dropped them entirely. The layout is the fixed, literal lifecycle-diagram shape — nothing needs force-directed auto-layout, and the diagram must not be draggable (see Interaction Model). Plain flex/grid CSS is sufficient and lighter.

No backend is required. Fully static build, deployable to any static host (Vercel/Netlify/GitHub Pages — final choice still open, see Open Decisions).

## Core Data Model

Three plain data sources, no unified cross-type schema this time (v1's unified node schema doesn't apply — there's no graph of interchangeable node types anymore):

```js
// src/data/about.js — the Generation card
{
  name: string,
  tagline: string,
  bio: string,
  links: { linkedin?: string, github?: string },
  resume: string,           // path to resume file
  experience: [             // compact list, rendered inline, not separate detail pages
    { title: string, dateRange: string }
  ],
}

// src/data/projects.js — exactly one project per inner stage today
{
  id: string,
  title: string,
  company: string,          // byline context, e.g. "Company B, 2023–2024" — replaces v1's parentId/experience-node link
  stageBadge: 'ingestion' | 'transformation' | 'storage' | 'serving',
  description: string | string[],  // string[] renders as separate paragraphs
  techStack: string[],
  links: { repo?: string, demo?: string },
  architecture?: {          // optional — mini embedded diagram of THIS project's real system
    nodes: [...],
    edges: [...],
  },
}

// src/data/skills.js — the Undercurrents band
string[]   // e.g. ['Python & SQL', 'Cloud (AWS/GCP)', 'Orchestration', ...] — plain tags, not interactive today
```

**Scaffold with realistic placeholder content first** — real resume/project content gets swapped in later without touching component code.

**Scalability note:** today it's exactly one project per stage (4 projects, 4 stages) — a clean coincidence, not a hard assumption. If a stage ever needs to hold more than one project, `getProjectsByStage(stage)` should return a list, and the stage click should open a short list-panel instead of navigating straight to the one project's detail view. Build the lookup that way from the start so this doesn't require a redesign later — see Interaction Model.

## Lifecycle Diagram Structure

Fixed, non-draggable layout matching the real DE lifecycle diagram shape:

```
[Generation] → ⟦ [Ingestion] → [Transformation] → [Serving] ⟧   → [Output: Resume]
                ⟦----------------[Storage]----------------⟧   → [Output: Contact]
                                                                → [Output: Links]
        ------------------------ Undercurrents ------------------------
```

- **Generation** (left): the About card — name, tagline, short bio, compact experience list. Static content, no click-through needed (or an optional expand-in-place for the fuller bio — not a separate route).
- **Ingestion / Transformation / Storage / Serving** (center): the four project stages. Each is clickable — see Interaction Model.
- **Output** (right): three cards — Resume (download), Contact (email), Links (LinkedIn/GitHub). Direct actions, not detail pages.
- **Undercurrents** (bottom band): a quiet strip of skill/tool tags from `skills.js`. Static, not interactive, for now.
- **Connectors**: thin lines between Ingestion → Transformation → Serving, and from the Storage layer up into all three, matching the reference diagram. Carry a faint, slow pulse animation (neutral gray, low↔higher opacity) — "a heartbeat, not a demo effect," per direct user instruction. Everything else is static.

## Per-Project Architecture Diagrams (`MiniArchitecture.jsx`)

Two of the four projects (Cloud Music Analytics, PFAS Analytic Pipeline) have a real embedded architecture diagram on their detail page, via the optional `architecture` field on a project — a hand-placed CSS grid, not an auto-layout graph library, same philosophy as the main lifecycle diagram (fixed positions, no drag).

- **Data shape**: `nodes: [{ id, label, category?, description?, col, row }]` (1-indexed grid coordinates the author chooses by hand) and `edges: [{ from, to, label? }]` (from/to must be grid-adjacent — an authoring convention, not a general graph layout). A node needs `description` to be clickable.
- **Everything renders at once.** No hidden/revealed branches — this was tried and explicitly reverted, see the "Read this first" note above.
- **Spine vs. branch styling**: whichever row has the most nodes is the "spine" (detected from data). Spine nodes get the normal solid border/`text-ink` treatment; every other row (fallback paths, alternate sources) gets a dashed border + `text-muted` label, so a dense diagram still has a scannable primary path.
- **Click-to-zoom**: clicking a node zooms the whole diagram in on it (pure CSS `translate`+`scale`, fixed transform-origin so zoom-in/out are the same continuous interpolation) and crossfades the page's description text to that node's own description (state lives in the parent `DetailView`, not in `MiniArchitecture` itself — it's a controlled component). Clicking the selected node again, or anywhere that isn't a node button, zooms back out.
- **Overflow**: vertical overflow from the zoom is clipped with a vignette fade (`overflow-y-hidden`, per `DESIGN.md`'s no-blur rule — a soft gradient, not an actual blur). Horizontal overflow (a diagram wider than its container, e.g. PFAS's 9 columns on a narrow viewport) scrolls instead of clipping — `overflow-x-auto` when unzoomed, forced to `overflow-x-hidden` while zoomed (see the Chrome scrollable-overflow gotcha in the "Read this first" note). The scrollbar itself is visually hidden via `.no-scrollbar` in `index.css` but stays fully functional.
- **Edge labels**: keep every token to ~7 characters or fewer (documented inline in `projects.js`) — the connector cell wraps between words, never mid-word, so one long token is what actually crowds the layout.
- **Hint chip**: a small "Click any node to explore" caption fades in ~1s after landing on the unzoomed view (and again after deselecting), and disappears instantly on selection. It's a deliberate exception to the main diagram's "no onboarding hint" rule (see Interaction Model) — a sub-diagram's boxes aren't as obviously clickable as a labeled lifecycle stage.

## Interaction Model

- **No drag, no pan, no zoom canvas.** This is a real change from v1. The diagram's recognizability as *the* DE lifecycle diagram is the entire point; a rearranged or draggable diagram undermines that. Layout is fixed CSS (flex/grid), responsive via breakpoints, not a graph engine.
- Clicking a stage box navigates to that project's detail view (`/project/:id`) — reusing the same detail-view component design from v1 (title, description, tech stack, links, optional embedded mini architecture diagram), now with a `company` byline instead of a parent-node link.
- Output cards (Resume/Contact/Links) are direct actions — download/mailto/external link — not routed detail pages.
- **No persistent mini-map, no floating corner shortcut.** Resume/Contact/Links are already first-class, always-visible boxes in the diagram itself — a separate floating chrome element would be redundant (v1 had both; v2 doesn't need either).
- **No onboarding hint on the main diagram.** A clearly-labeled, recognizable diagram with obviously clickable boxes doesn't need an instructional overlay explaining itself — needing one was itself a symptom of v1 being too clever for its own good. (A per-project `MiniArchitecture` diagram is a different case: it *does* show a small "Click any node to explore" hint, since those boxes aren't obviously clickable the way a labeled lifecycle-stage box is.)
- Each project is deep-linkable at `/project/:id`. `/` is the full diagram. Browser back/forward moves naturally between them.
- Keyboard navigation and visible focus states still apply throughout (see `PRODUCT.md` Accessibility) — simpler to get right now that there's no graph library's internal focus model to work around.

## Visual Design

**Superseded directions (history only, do not build against):**
- v0: light/editorial theme, `#fafafa` background, indigo `#4f46e5` accent.
- v1: dark/cinematic/atmospheric theme, amber/gold accent, glassmorphism mini-map, ReactFlow/Dagre DAG canvas.

**Current direction (v2)**: near-monochrome, quiet, flat. See `DESIGN.md` for full tokens and rationale — summary:

- **Palette**: pure white background, near-black text, gray for secondary text/borders, one muted slate-blue accent (Signal Blue) spent on exactly one thing — a box's hover/active/selected border (main-diagram stages, and selected nodes in a per-project architecture diagram). Connector lines are neutral gray, not accent-colored. Nothing else gets color.
- **No shadows, no glow, no blur, anywhere.** v1's "one glass rule" is gone — there's no floating panel left that needs glass. Separation between elements comes from borders and the rare surface-tone lift, never from implied depth or light.
- **Typography**: single family (General Sans) for everything, at varying weight/size for hierarchy. Monospace (JetBrains Mono) pulled back to exactly one use — tech-stack tags — instead of v1's every-badge-and-date treatment.
- **Motion**: minimal. A faint, slow pulse on the stage connectors; otherwise state-change-only (hover, click, focus). No continuous ambient animation beyond the one deliberately-faint connector pulse.

## Real Content (populated from resume)

`about.js`, `projects.js`, and `skills.js` now hold real content, sourced from the resume dropped at the project root (also copied to `public/resume.pdf`, referenced by `about.resume`) plus a lookup against the public GitHub repos at `github.com/BubbaLubz`. Stage mapping (current — see the "Read this first" note at the top of this file if this ever drifts again): **Ingestion** = Cloud Music Analytics Platform, **Transformation** = PFAS Analytic Pipeline, **Storage** = AI Data Infrastructure Diagram Tool, **Serving** = StickSplit. The PFAS project is the one real work experience (EKI Environment and Water Inc.), not a separate listed "project" — see the resume's own Experience section. This was a deliberate choice, confirmed with the user, since the resume lists only 3 "Projects" against 4 stage slots.

**Known gaps to fill in**: StickSplit has no confirmed public repo (none of the 5 public repos under `BubbaLubz` matched it) and none of the three projects has a confirmed live demo URL (the resume lists "DEMO" as link text, but the PDF extraction doesn't expose the underlying href, and GitHub's `homepage` field was empty for both matched repos). Get the real URLs from the user before treating `projects.js`'s `links` fields as final.

## Open Decisions (deferred, revisit before or during build)

- **Deployment target**: static host not yet chosen (Vercel / Netlify / GitHub Pages all viable — no backend needed for the core site).
- **Contact mechanism**: not yet decided between a plain `mailto:`/link-out (simplest, no backend) vs. a real submitted form via a serverless function (e.g. Vercel Function, Formspree).

## Design Inspiration

Reference screenshots live in `inspo/screenshots/NNN.png`, each paired by number with a tagged prompt/description at `inspo/prompts/NNN.md` (see `inspo/README.md` for the format). Screenshots 1–4 (O2, EOSAI, EcoDream, "Perfect Home") drove the now-superseded v1 dark/cinematic pivot — kept for history, no longer the active direction. `inspo/screenshots/del.png` (the *Fundamentals of Data Engineering* lifecycle diagram) is what v2 is built from directly — treat its shape and labels as close to literal, not just mood reference. `PRODUCT.md` is the source of truth for strategy; this file for architecture; `DESIGN.md` for visual tokens.

## Scalability Principle

Content changes should stay data-only: swap `about.js`, `projects.js`, or `skills.js` and nothing else needs to change. The one exception to watch: if a stage ever needs more than one project, the stage-click behavior needs to branch from "navigate straight to the one project" to "open a short list" — build `getProjectsByStage()` to return an array from day one so that branch is a small conditional, not a rewrite.
