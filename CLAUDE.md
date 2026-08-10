# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**bubba-portfolio-web** is a personal portfolio site whose homepage renders the actual data engineering lifecycle diagram (Reis & Housley, *Fundamentals of Data Engineering*) — Generation → [Ingestion → Transformation → Serving] over a Storage layer → Output, with an Undercurrents skills band beneath. This is deliberately the *real, canonical* diagram, not an invented metaphor: recognizability is what does the credibility work. Each of the four inner stages (Ingestion/Transformation/Storage/Serving) represents exactly one real project — click a stage, see that project's detail. Generation is an About card; Output holds Resume/Contact/Links.

This project went through two prior directions before landing here, both documented as history, neither current:
- **v0**: light/editorial theme, indigo accent, no diagram concept yet.
- **v1**: an invented DAG-of-my-career canvas (ReactFlow + Dagre, free-drag, dark/cinematic/amber theme). Built and shipped, then reverted after user feedback: *"too moody and dev-tool-coded... trying too hard to impress."*
- **v2 (current)**: the real lifecycle diagram, fixed layout, near-monochrome, quiet. See `PRODUCT.md`'s Anti-references and Design Principles for what was learned from v1 and must not recur.

## Known repo issue to resolve before first commit

This directory currently has no `.git` of its own — it inherits a git repo rooted at the Windows user home directory (`C:\Users\Chris`), whose remote points to an unrelated project (`StudyUlt`). **Run `git init` inside `bubba-portfolio-web` itself before committing anything**, so work here doesn't land in the wrong repo or accidentally stage unrelated personal files from the home directory. (Still unresolved as of v2.)

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
  description: string,
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
- **Connectors**: thin lines between Ingestion → Transformation → Serving, and from the Storage layer up into all three, matching the reference diagram. Carry a faint, slow pulse animation (Signal Blue, low opacity) — "a heartbeat, not a demo effect," per direct user instruction. Everything else is static.

## Interaction Model

- **No drag, no pan, no zoom canvas.** This is a real change from v1. The diagram's recognizability as *the* DE lifecycle diagram is the entire point; a rearranged or draggable diagram undermines that. Layout is fixed CSS (flex/grid), responsive via breakpoints, not a graph engine.
- Clicking a stage box navigates to that project's detail view (`/project/:id`) — reusing the same detail-view component design from v1 (title, description, tech stack, links, optional embedded mini architecture diagram), now with a `company` byline instead of a parent-node link.
- Output cards (Resume/Contact/Links) are direct actions — download/mailto/external link — not routed detail pages.
- **No persistent mini-map, no floating corner shortcut.** Resume/Contact/Links are already first-class, always-visible boxes in the diagram itself — a separate floating chrome element would be redundant (v1 had both; v2 doesn't need either).
- **No onboarding hint.** A clearly-labeled, recognizable diagram with obviously clickable boxes doesn't need an instructional overlay explaining itself — needing one was itself a symptom of v1 being too clever for its own good.
- Each project is deep-linkable at `/project/:id`. `/` is the full diagram. Browser back/forward moves naturally between them.
- Keyboard navigation and visible focus states still apply throughout (see `PRODUCT.md` Accessibility) — simpler to get right now that there's no graph library's internal focus model to work around.

## Visual Design

**Superseded directions (history only, do not build against):**
- v0: light/editorial theme, `#fafafa` background, indigo `#4f46e5` accent.
- v1: dark/cinematic/atmospheric theme, amber/gold accent, glassmorphism mini-map, ReactFlow/Dagre DAG canvas.

**Current direction (v2)**: near-monochrome, quiet, flat. See `DESIGN.md` for full tokens and rationale — summary:

- **Palette**: pure white background, near-black text, gray for secondary text/borders, one muted slate-blue accent (Signal Blue) spent on exactly two things — stage-to-stage connectors, and a stage's hover/active border. Nothing else gets color.
- **No shadows, no glow, no blur, anywhere.** v1's "one glass rule" is gone — there's no floating panel left that needs glass. Separation between elements comes from borders and the rare surface-tone lift, never from implied depth or light.
- **Typography**: single family (General Sans) for everything, at varying weight/size for hierarchy. Monospace (JetBrains Mono) pulled back to exactly one use — tech-stack tags — instead of v1's every-badge-and-date treatment.
- **Motion**: minimal. A faint, slow pulse on the stage connectors; otherwise state-change-only (hover, click, focus). No continuous ambient animation beyond the one deliberately-faint connector pulse.

## Real Content (populated from resume)

`about.js`, `projects.js`, and `skills.js` now hold real content, sourced from the resume dropped at the project root (also copied to `public/resume.pdf`, referenced by `about.resume`) plus a lookup against the public GitHub repos at `github.com/BubbaLubz`. Stage mapping: **Ingestion** = Cloud Music Analytics Platform, **Transformation** = StickSplit, **Storage** = Data Infrastructure Diagram Tool, **Serving** = the EKI PFAS reporting-layer deliverable (from the one real work experience, not a separate listed "project" — see the resume's own Experience section). This was a deliberate choice, confirmed with the user, since the resume lists only 3 "Projects" against 4 stage slots.

**Known gaps to fill in**: StickSplit has no confirmed public repo (none of the 5 public repos under `BubbaLubz` matched it) and none of the three projects has a confirmed live demo URL (the resume lists "DEMO" as link text, but the PDF extraction doesn't expose the underlying href, and GitHub's `homepage` field was empty for both matched repos). Get the real URLs from the user before treating `projects.js`'s `links` fields as final.

## Open Decisions (deferred, revisit before or during build)

- **Deployment target**: static host not yet chosen (Vercel / Netlify / GitHub Pages all viable — no backend needed for the core site).
- **Contact mechanism**: not yet decided between a plain `mailto:`/link-out (simplest, no backend) vs. a real submitted form via a serverless function (e.g. Vercel Function, Formspree).

## Design Inspiration

Reference screenshots live in `inspo/screenshots/NNN.png`, each paired by number with a tagged prompt/description at `inspo/prompts/NNN.md` (see `inspo/README.md` for the format). Screenshots 1–4 (O2, EOSAI, EcoDream, "Perfect Home") drove the now-superseded v1 dark/cinematic pivot — kept for history, no longer the active direction. `inspo/screenshots/del.png` (the *Fundamentals of Data Engineering* lifecycle diagram) is what v2 is built from directly — treat its shape and labels as close to literal, not just mood reference. `PRODUCT.md` is the source of truth for strategy; this file for architecture; `DESIGN.md` for visual tokens.

## Scalability Principle

Content changes should stay data-only: swap `about.js`, `projects.js`, or `skills.js` and nothing else needs to change. The one exception to watch: if a stage ever needs more than one project, the stage-click behavior needs to branch from "navigate straight to the one project" to "open a short list" — build `getProjectsByStage()` to return an array from day one so that branch is a small conditional, not a rewrite.
