# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read this first: where the last session left off

The repo moved — GitHub now redirects `bubba-portfolio` to its real name, **`github.com/BubbaLubz/chrisenriquezdev`**. `origin` has been repointed to the new URL directly (not relying on the redirect). `main` branch, working tree clean as of commit `4e29885`. Standing instruction from the user for this repo: **commit and push every change immediately, without being asked.** Don't wait for a batch of changes or an explicit "push this" — treat it as implicit after every edit.

This was a big session — a new route, several real bugs, and a site-wide entrance-animation system got added. In order:

- **Generation is now clickable, deep-linking to `/about`** (new `AboutDetail.jsx`, new route in `App.jsx`). This reverses what an earlier version of this doc said ("Generation... no click-through needed") — that was the deliberate call *at the time*; this session's ask explicitly reopened it. `about.js` grew a second bio field: `bio` (short, stays on the homepage Generation card) and `fullBio` (array of paragraphs, the About page's real content — a personal story about the CS/music-major background, the PFAS pipeline work, and the marching-arts hobby). Don't collapse these back into one field — the homepage card needs to stay compact.
- **Homepage layout bugs fixed**: the vertical connector arrow was rendering *alongside* the horizontal one at desktop widths (missing a `md:hidden`, so both showed — a doubled/misaligned "→ →"); Generation/Output column widths are now equal (`md:w-64` both, previously `w-64`/`w-56` — this turned out **not** to be why Transformation was off-center under Undercurrents, see below); Transformation is precisely re-centered under the Undercurrents divider via `md:-translate-x-[27.6px]` on the row — this value is empirically measured against current content (the stage badge labels can't wrap, so the middle flex block overflows its fair share by a content-dependent amount) and would need re-measuring if a stage title/badge label changes length or a connector is added/removed on the Generation side. See the comment above that row in `LifecycleDiagram.jsx` for the full derivation — it's non-obvious enough that re-deriving it from scratch is a mistake.
- **Site-wide entrance-animation system, reusing the existing `detail-in` keyframe** (fade + 12px rise) rather than inventing new motion — see DESIGN.md's Motion section for the full rundown. Two new CSS classes drive it: `.stagger-delay` (90ms/step, for a handful of large sections — detail pages) and `.stagger-delay-fast` (50ms/step, for a row of many small cards — the homepage). Homepage cards stagger left-to-right; detail-page sections stagger in reading order via a running index that skips absent optional sections (no gap in the sequence if a project has no architecture diagram, say). The Undercurrents band uses a fade-only variant (`.animate-fade-in`, opacity only, no rise) instead — a translateY there read as the dividing rule sliding upward into place, which looked wrong for a horizontal rule.
- **Two motion-related bugs found and fixed, both worth knowing about if this pattern gets reused elsewhere:**
  1. **A CSS animation with `fill-mode: both` on the same element as a runtime opacity toggle silently wins forever.** `DetailView.jsx`'s node-description crossfade (opacity-0/opacity-100 driven by React state) stopped visibly fading once the entrance animation on the *same div* finished — the finished animation kept holding `opacity: 1` as an active animation effect, which sits above the cascade and overrides a plain class-driven value indefinitely, not just while running. Fixed by splitting entrance and crossfade onto two nested divs. **Rule going forward: never put a one-shot entrance animation and an ongoing state-driven style toggle on the same element for the same CSS property.**
  2. **A non-`none` `transform` left on an ancestor of an independently-scrollable descendant corrupts that descendant's scroll bounds.** Same root cause as #1 (fill-mode: both holding `transform: translateY(0)` forever, even though visually a no-op) — this one manifested as `MiniArchitecture`'s diagram being unscrollable in one direction until something else (a node click) forced a reflow. Fixed in `DetailView.jsx` by dropping the entrance classes entirely once the animation settles (`onAnimationEnd`, **with a timeout fallback** — verified in testing that a backgrounded/hidden tab never fires `animationend` at all, since Chrome pauses CSS animations there, so the fallback isn't just belt-and-suspenders). If a future entrance-animated wrapper ever contains its own scrollable region, apply the same settle-and-strip pattern.
- **`MiniArchitecture.jsx`'s mobile story changed substantially — three passes in one session, each fixing what the previous one missed:**
  1. First pass: `.no-scrollbar` (previously hiding the scrollbar unconditionally) is now scoped to `sm:` and up only, so mobile gets its native auto-hiding scrollbar back as a real affordance. Added scroll-position-driven edge-fade gradients (reusing the existing zoom-vignette gradient technique, not a new material) that only show where there's genuinely more diagram to scroll to.
  2. Second pass: below `sm`, the diagram is now scrollable on **both axes in every state** (unzoomed and zoomed) — previously, zooming into a node clipped anything that scaled past the container vertically, with no way to reach it. Desktop's original clip + static vignette zoom treatment is unchanged; the fade system above was extended to all four directions and gated per-breakpoint (top/bottom fades are mobile-only; left/right suppress themselves on desktop specifically while zoomed, since that state uses the static vignette instead).
  3. Third pass: see the ancestor-transform bug above — the reason mobile scrolling was still broken in one direction *even after* pass 2's CSS was correct. Also added `-webkit-overflow-scrolling: touch` (iOS momentum scrolling) and a re-measure of scroll bounds once web fonts finish loading (a font swap can resize the grid after the browser already settled scroll bounds at first paint).
- **Mobile homepage**: the four vertical connector arrows between stacked cards (Generation→stages, Ingestion→Transformation, Transformation→Serving, stages→Output) are removed entirely — they only ever rendered below `sm`/`md` to begin with, and the user wants the mobile view to read as a clean list, not a diagram-with-arrows squeezed vertical. Desktop's horizontal arrows are untouched.
- **Mobile detail pages**: the fixed back button (`top-4`, 40px tall) was overlapping the byline/title's first line, since content only had `py-10` (40px) of top clearance — same edge, same size. Both `DetailView.jsx` and `AboutDetail.jsx` now use `pt-20` on mobile specifically (`sm:py-16` unchanged).
- **`getComputedStyle`/browser-verification note for future sessions**: this session's browser tooling could not get an actual sub-640px viewport to render (a `resize_window` call reports success but `window.innerWidth` stays at whatever the real window is) — all the mobile-specific CSS above was verified by inspecting compiled stylesheet rules and by directly forcing the relevant overflow/width values via JS to exercise the underlying logic, not by an actual rendered phone-width screenshot. If a future mobile bug report doesn't match what the code appears to do, distrust the "it's already handled" assumption and get real device confirmation before concluding it's fixed.

Still open, unchanged from before: StickSplit's repo link and live demo URLs for all three projects (see Known gaps below). Deployment target discussed (Render, static site + a `render.yaml` blueprint was offered but not yet added — ask before assuming one exists) but not confirmed as live/connected; contact mechanism is actually already resolved (a `ContactOverlay.jsx` modal exists and is wired to the Output "Contact Information" card) — this doc's Open Decisions section below is stale on that point specifically.

## Project Overview

**bubba-portfolio-web** is a personal portfolio site whose homepage renders the actual data engineering lifecycle diagram (Reis & Housley, *Fundamentals of Data Engineering*) — Generation → [Ingestion → Transformation → Serving] over a Storage layer → Output, with an Undercurrents skills band beneath. This is deliberately the *real, canonical* diagram, not an invented metaphor: recognizability is what does the credibility work. Each of the four inner stages (Ingestion/Transformation/Storage/Serving) represents exactly one real project — click a stage, see that project's detail. Generation is an About card; Output holds Resume/Contact/Links.

This project went through two prior directions before landing here, both documented as history, neither current:
- **v0**: light/editorial theme, indigo accent, no diagram concept yet.
- **v1**: an invented DAG-of-my-career canvas (ReactFlow + Dagre, free-drag, dark/cinematic/amber theme). Built and shipped, then reverted after user feedback: *"too moody and dev-tool-coded... trying too hard to impress."*
- **v2 (current)**: the real lifecycle diagram, fixed layout, near-monochrome, quiet. See `PRODUCT.md`'s Anti-references and Design Principles for what was learned from v1 and must not recur.

## Repo

Standalone git repo rooted at `bubba-portfolio-web` itself (it used to inherit the home-directory repo — that's fixed). Remote: `https://github.com/BubbaLubz/chrisenriquezdev.git`, branch `main` (renamed from `bubba-portfolio` — GitHub still redirects the old URL, but `origin` is repointed to the new one directly).

## Tech Stack

- React + Vite
- React Router for deep-linkable project routes
- Tailwind CSS — see `DESIGN.md` for tokens
- **No ReactFlow, no Dagre, no canvas/graph library.** v1 used both; v2 dropped them entirely. The layout is the fixed, literal lifecycle-diagram shape — nothing needs force-directed auto-layout, and the diagram must not be draggable (see Interaction Model). Plain flex/grid CSS is sufficient and lighter.

No backend is required. Fully static build, deployable to any static host — leaning Render (Static Site), see Open Decisions.

## Core Data Model

Three plain data sources, no unified cross-type schema this time (v1's unified node schema doesn't apply — there's no graph of interchangeable node types anymore):

```js
// src/data/about.js — the Generation card + its /about detail page
{
  name: string,
  tagline: string,
  bio: string,              // short — the homepage Generation card's compact teaser
  fullBio: string[],        // paragraphs — the /about page's real content, separate from bio on purpose
  links: { linkedin?: string, github?: string },
  resume: string,           // path to resume file
  email: string,            // 'mailto:...' — used by ContactOverlay and the /about page
  experience: [             // rendered on both the compact card and the /about page (reordered there — see below)
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

- **Generation** (left): the About card — name, tagline, short bio, compact experience list. **Clickable**, same treatment as a stage box (accent border on hover/focus) — deep-links to `/about` (`AboutDetail.jsx`), which reuses `DetailView.jsx`'s back-button/exit-animation pattern and shows the fuller bio (`about.fullBio`), experience (shown first there, above the bio — reordered from the card's bio-then-experience), and contact links. This reverses an earlier call in this doc ("no click-through needed") — a real, deliberate ask, not a bug fix.
- **Ingestion / Transformation / Storage / Serving** (center): the four project stages. Each is clickable — see Interaction Model.
- **Output** (right): three cards — Resume (download), Contact (email), Links (LinkedIn/GitHub). Direct actions, not detail pages.
- **Undercurrents** (bottom band): a quiet strip of skill/tool tags from `skills.js`. Static, not interactive, for now.
- **Connectors**: thin lines between Ingestion → Transformation → Serving, and from the Storage layer up into all three, matching the reference diagram. Carry a faint, slow pulse animation (neutral gray, low↔higher opacity) — "a heartbeat, not a demo effect," per direct user instruction. Everything else is static. **Desktop only** — below `md`/`sm` (where cards stack into a plain list) there are no connector arrows at all; they were removed rather than hidden, since the user wants the mobile view to read as a clean list, not a cramped vertical diagram.

## Per-Project Architecture Diagrams (`MiniArchitecture.jsx`)

Two of the four projects (Cloud Music Analytics, PFAS Analytic Pipeline) have a real embedded architecture diagram on their detail page, via the optional `architecture` field on a project — a hand-placed CSS grid, not an auto-layout graph library, same philosophy as the main lifecycle diagram (fixed positions, no drag).

- **Data shape**: `nodes: [{ id, label, category?, description?, col, row }]` (1-indexed grid coordinates the author chooses by hand) and `edges: [{ from, to, label? }]` (from/to must be grid-adjacent — an authoring convention, not a general graph layout). A node needs `description` to be clickable.
- **Everything renders at once.** No hidden/revealed branches — a progressive-disclosure version (spine visible by default, branch nodes filing out on click) was built in an earlier session and explicitly reverted back to "everything open" per direct follow-up request. Don't reintroduce click-to-reveal/hidden-branch behavior unless asked again.
- **Spine vs. branch styling**: whichever row has the most nodes is the "spine" (detected from data). Spine nodes get the normal solid border/`text-ink` treatment; every other row (fallback paths, alternate sources) gets a dashed border + `text-muted` label, so a dense diagram still has a scannable primary path.
- **Click-to-zoom**: clicking a node zooms the whole diagram in on it (pure CSS `translate`+`scale`, fixed transform-origin so zoom-in/out are the same continuous interpolation) and crossfades the page's description text to that node's own description (state lives in the parent `DetailView`, not in `MiniArchitecture` itself — it's a controlled component). Clicking the selected node again, or anywhere that isn't a node button, zooms back out.
- **Overflow — desktop (`sm:` and up) vs. mobile, genuinely different behavior**: on desktop, unchanged from earlier versions of this doc — horizontal overflow (a diagram wider than its container, e.g. PFAS's 9 columns) scrolls when unzoomed (`overflow-x-auto`) but is forced to `overflow-x-hidden` while zoomed, and vertical overflow from the zoom is *always* clipped with a vignette fade (`overflow-y-hidden`, per `DESIGN.md`'s no-blur rule — a soft gradient, not an actual blur) — Chrome factors an element's own `transform` into its ancestor's scrollable-overflow calculation, which is why the zoomed state can't just stay `overflow-x-auto` too (it'd surface a spurious scrollbar for the zoom's intentional overflow). Below `sm`, this is all different: the container is `overflow-auto` (both axes) in **every** state, zoomed or not — nothing is ever permanently out of reach on a phone; panning reaches every node regardless of screen size. The static desktop vignette is replaced there by real scroll-position-driven edge-fade gradients on all four sides (same gradient technique, `canScrollLeft/Right/Up/Down` measured from actual `scrollWidth`/`scrollHeight`, not a viewport guess). `.no-scrollbar` (in `index.css`) now only hides the scrollbar at `sm:` and up — mobile keeps its native auto-hiding scrollbar as a real affordance, on purpose. **Gotcha that cost real debugging time**: a CSS entrance animation with `fill-mode: both` on an *ancestor* of this scroll container held a no-op `transform: translateY(0)` on it forever after finishing, which corrupted the descendant's scroll-bounds computation — if a future entrance-animated wrapper ever contains its own scrollable region, strip the animation classes once settled (`onAnimationEnd` + a timeout fallback, since a backgrounded tab never fires `animationend` — see `DetailView.jsx`'s `architectureSettled` state) rather than leaving `fill-mode: both` attached indefinitely.
- **Edge labels**: keep every token to ~7 characters or fewer (documented inline in `projects.js`) — the connector cell wraps between words, never mid-word, so one long token is what actually crowds the layout.
- **Hint chip**: a small "Click any node to explore" caption fades in ~1s after landing on the unzoomed view (and again after deselecting), and disappears instantly on selection. It's a deliberate exception to the main diagram's "no onboarding hint" rule (see Interaction Model) — a sub-diagram's boxes aren't as obviously clickable as a labeled lifecycle stage.

## Interaction Model

- **No drag, no pan, no zoom canvas.** This is a real change from v1. The diagram's recognizability as *the* DE lifecycle diagram is the entire point; a rearranged or draggable diagram undermines that. Layout is fixed CSS (flex/grid), responsive via breakpoints, not a graph engine.
- Clicking a stage box navigates to that project's detail view (`/project/:id`) — reusing the same detail-view component design from v1 (title, description, tech stack, links, optional embedded mini architecture diagram), now with a `company` byline instead of a parent-node link.
- Output cards (Resume/Contact/Links) are direct actions — download/mailto/external link — not routed detail pages.
- **No persistent mini-map, no floating corner shortcut.** Resume/Contact/Links are already first-class, always-visible boxes in the diagram itself — a separate floating chrome element would be redundant (v1 had both; v2 doesn't need either).
- **No onboarding hint on the main diagram.** A clearly-labeled, recognizable diagram with obviously clickable boxes doesn't need an instructional overlay explaining itself — needing one was itself a symptom of v1 being too clever for its own good. (A per-project `MiniArchitecture` diagram is a different case: it *does* show a small "Click any node to explore" hint, since those boxes aren't obviously clickable the way a labeled lifecycle-stage box is.)
- Each project is deep-linkable at `/project/:id`; Generation is deep-linkable at `/about` (`AboutDetail.jsx`, same back-button/exit-animation pattern as `DetailView.jsx`). `/` is the full diagram. Browser back/forward moves naturally between all of them.
- **Stage badge/category captions are homepage-only.** The small "INGESTION"/"TRANSFORMATION"/etc. caption and the "GENERATION" caption were removed from the detail pages (`DetailView.jsx`, `AboutDetail.jsx`) — only the company/date byline remains there. The homepage cards still show them.
- Keyboard navigation and visible focus states still apply throughout (see `PRODUCT.md` Accessibility) — simpler to get right now that there's no graph library's internal focus model to work around.

## Visual Design

**Superseded directions (history only, do not build against):**
- v0: light/editorial theme, `#fafafa` background, indigo `#4f46e5` accent.
- v1: dark/cinematic/atmospheric theme, amber/gold accent, glassmorphism mini-map, ReactFlow/Dagre DAG canvas.

**Current direction (v2)**: near-monochrome, quiet, flat. See `DESIGN.md` for full tokens and rationale — summary:

- **Palette**: pure white background, near-black text, gray for secondary text/borders, one muted slate-blue accent (Signal Blue) spent on exactly one thing — a box's hover/active/selected border (main-diagram stages, and selected nodes in a per-project architecture diagram). Connector lines are neutral gray, not accent-colored. Nothing else gets color.
- **No shadows, no glow, no blur, anywhere.** v1's "one glass rule" is gone — there's no floating panel left that needs glass. Separation between elements comes from borders and the rare surface-tone lift, never from implied depth or light.
- **Typography**: single family (General Sans) for everything, at varying weight/size for hierarchy. Monospace (JetBrains Mono) pulled back to exactly one use — tech-stack tags — instead of v1's every-badge-and-date treatment.
- **Motion**: minimal, but not zero — see `DESIGN.md`'s Motion section for the full entrance-animation system (staggered card/section reveals reusing one shared keyframe). A faint, slow pulse on the stage connectors; otherwise state-change-only (hover, click, focus) plus the one-shot page-entrance choreography. No continuous ambient animation beyond the connector pulse.

## Real Content (populated from resume)

`about.js`, `projects.js`, and `skills.js` now hold real content, sourced from the resume dropped at the project root (also copied to `public/resume.pdf`, referenced by `about.resume`) plus a lookup against the public GitHub repos at `github.com/BubbaLubz`. Stage mapping (current — check `projects.js`'s `stageBadge` fields directly if this ever looks stale): **Ingestion** = Cloud Music Analytics Platform, **Transformation** = PFAS Analytic Pipeline, **Storage** = AI Data Infrastructure Diagram Tool, **Serving** = StickSplit. The PFAS project is the one real work experience (EKI Environment and Water Inc.), not a separate listed "project" — see the resume's own Experience section. This was a deliberate choice, confirmed with the user, since the resume lists only 3 "Projects" against 4 stage slots.

**Known gaps to fill in**: StickSplit has no confirmed public repo (none of the 5 public repos under `BubbaLubz` matched it) and none of the three projects has a confirmed live demo URL (the resume lists "DEMO" as link text, but the PDF extraction doesn't expose the underlying href, and GitHub's `homepage` field was empty for both matched repos). Get the real URLs from the user before treating `projects.js`'s `links` fields as final.

## Open Decisions (deferred, revisit before or during build)

- **Deployment target**: leaning Render (Static Site) — discussed with the user, standard config is `npm install && npm run build`, publish dir `dist`, plus a rewrite rule (`/*` → `/index.html`, Rewrite not Redirect) since React Router's client-side routes 404 on a hard refresh without it. Not yet confirmed as actually connected/live; a `render.yaml` blueprint was offered but not added — check before assuming one exists.
- **Contact mechanism**: resolved — `ContactOverlay.jsx` is a modal (email + LinkedIn/GitHub links), opened from the Output "Contact Information" card. Not a form/serverless function; just a direct-info overlay.

## Design Inspiration

Reference screenshots live in `inspo/screenshots/NNN.png`, each paired by number with a tagged prompt/description at `inspo/prompts/NNN.md` (see `inspo/README.md` for the format). Screenshots 1–4 (O2, EOSAI, EcoDream, "Perfect Home") drove the now-superseded v1 dark/cinematic pivot — kept for history, no longer the active direction. `inspo/screenshots/del.png` (the *Fundamentals of Data Engineering* lifecycle diagram) is what v2 is built from directly — treat its shape and labels as close to literal, not just mood reference. `PRODUCT.md` is the source of truth for strategy; this file for architecture; `DESIGN.md` for visual tokens.

## Scalability Principle

Content changes should stay data-only: swap `about.js`, `projects.js`, or `skills.js` and nothing else needs to change. The one exception to watch: if a stage ever needs more than one project, the stage-click behavior needs to branch from "navigate straight to the one project" to "open a short list" — build `getProjectsByStage()` to return an array from day one so that branch is a small conditional, not a rewrite.
