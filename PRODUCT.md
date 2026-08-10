# Product

## Register

brand

## Platform

web

## Users

Recruiters, hiring managers, and technical visitors evaluating this person's data engineering ability — typically arriving from a resume link, LinkedIn post, or direct share rather than organic browsing. Their context is quick evaluation: they're deciding whether to take a closer look or move on, often on a first pass of many candidates.

## Product Purpose

A portfolio site that proves data engineering competence through its own structure, not just through descriptions of it. The homepage renders the actual data engineering lifecycle diagram (Generation → Ingestion/Transformation/Serving over Storage → Output, with an Undercurrents skills band) — the same diagram any data engineer would recognize on sight. Each of the four inner stages is one real project; clicking it opens that project's real detail. Success looks like a visitor recognizing the framework immediately, clicking into a project or two, and coming away convinced this person can build real production data systems — without the site ever feeling like it's performing for them.

## Positioning

The portfolio itself is architected like the real data engineering lifecycle — the interface is the proof, not a decoration wrapped around a resume. Recognizability does the convincing; the interface doesn't need to work hard to seem impressive.

## Conversion & proof

- Primary CTA: explore the four project stages — clicking a stage is the main action, no competing "click here" button pulling attention away from the diagram.
- Secondary, always-visible: Resume, Contact, and Links render as their own Output cards directly on the page — reachable in one click, present by default rather than requiring a click to reveal, but never visually competing with the four stages for primary attention.
- The line a visitor remembers after 10 seconds: "This is the data engineering lifecycle — and every stage is real work."
- Belief ladder: recognizes the diagram shape immediately (it's the real framework, not an invented metaphor) → trusts the site's technical credibility before reading a word of copy → clicks a stage → finds a real project with a real tech stack and (where relevant) a real embedded architecture diagram → believes this person can build production data systems → downloads the resume or reaches out.
- Proof on hand: the project content itself (real work, real architectures) — no separate testimonials, press, or client logos at this stage.

## Brand Personality

Quiet, precise, credible. Confidence comes from the diagram being real and the projects being real — not from dramatic visual effects arguing on the interface's behalf. If a visitor can tell the site is trying to impress them, that's a failure of this personality, not a stylistic preference.

## Anti-references

Generic SaaS templates and the bootcamp-grad "card grid of projects" portfolio look. Also, learned directly from this project's first pass: glow effects, atmospheric/cinematic backgrounds, continuous ambient animation, and monospace-for-everything all read as "trying too hard to impress" rather than confident — even when individually defensible, stacked together they tip into performance. The bar going forward: if a visual choice exists to make the site feel more impressive rather than to make the content clearer, cut it.

## Design Principles

Show, don't tell: the interface itself is the evidence of skill, not a claim printed over it — this now extends to the interface *design* too, not just its content. Recognizability over invention: using the real, canonical DE lifecycle diagram does more credibility work than any original visual metaphor could. Quiet over theatrical: near-monochrome by default, one accent color spent in exactly one place, motion only where it clarifies rather than decorates. Content-driven scalability: the four stages map to four projects today; if a stage ever needs more than one project, it becomes a short list rather than requiring a redesign. Restraint is the point, not a phase before "the real design."

## Accessibility & Inclusion

WCAG 2.1 AA contrast throughout (4.5:1 body text, 3:1 large text/UI). Full keyboard navigation with visible focus states. `prefers-reduced-motion` fallback required for the faint connector animation and any transitions — crossfade or instant transition in place of motion.
