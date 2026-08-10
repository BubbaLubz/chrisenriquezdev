<!-- Rewritten from the dark/cinematic v1 after user feedback: "too moody and dev-tool-coded... trying too hard to impress." Replaced with a near-monochrome, quiet system built around the real, literal data engineering lifecycle diagram (Reis & Housley) rather than an invented visual metaphor. Colors/typography verified (contrast measured in-browser, not asserted) — components section still pending a full /impeccable document scan once the rebuild settles. -->

---
name: "Christopher Enriquez — Data Engineering Portfolio"
description: "The data engineering lifecycle, rendered as the portfolio itself."
colors:
  bg: "oklch(1 0 0)"
  surface: "oklch(0.985 0 0)"
  border: "oklch(0.88 0 0)"
  ink: "oklch(0.18 0 0)"
  muted: "oklch(0.5 0 0)"
  accent: "oklch(0.45 0.06 240)"
typography:
  display:
    fontFamily: "General Sans, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "General Sans, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "General Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "General Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.7rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.03em"
rounded:
  sm: "4px"
  md: "8px"
---

# Design System: Christopher Enriquez — Data Engineering Portfolio

## Overview

**Creative North Star: "The Real Diagram"**

Not an invented metaphor — the actual data engineering lifecycle diagram, the one anyone in the field would recognize on sight (Generation → Ingestion/Transformation/Serving over Storage → Output, with an Undercurrents skills band beneath). Credibility comes from using the real thing plainly, not from dressing it up. The v1 of this system tried to earn attention through mood — dark atmosphere, glow effects, continuous motion, monospace on everything. It read as performance. This version earns attention by being unmistakably the correct diagram, rendered with total clarity and nothing else competing for the eye.

**Key Characteristics:**
- Near-monochrome: white, near-black, gray. Nothing else, except —
- One quiet accent (muted slate-blue), spent on exactly two things: the connector lines between stages, and the hover/active state of a stage
- Single type family (General Sans) for everything except tech-stack tags, which alone keep the monospace face — reserved, not a background texture
- Flat by default — no shadows, no glow, no blur anywhere in this version (the prior system's "one glass rule" is gone entirely; there's no floating panel left that needs it)
- Motion is minimal on purpose: a faint, slow pulse on the stage-to-stage connectors (barely perceptible, "a heartbeat, not a demo effect" — direct instruction), nothing else animates on its own

## Colors

Near-monochrome strategy, one step more restrained than "Restrained": white/black/gray carries the entire surface, and the single accent's rarity — not its saturation — is what makes it register at all.

### Primary
- **Signal Blue** (`oklch(0.45 0.06 240)`): the only color in the system beyond grayscale. Used for exactly two things — the stage-to-stage connector lines, and a stage box's border/label when hovered or active. Nowhere else. Measured 7.35:1 against Bg, so it's legible enough to double as link-style text if ever needed, but its job here is marking state, not carrying content.

### Neutral
- **Bg** (`oklch(1 0 0)`) — pure white, chroma 0. Not an off-white, not warm-tinted — per the "pure white" default, the mood lives in restraint and typography, not in a tinted surface.
- **Surface** (`oklch(0.985 0 0)`) — the barest lift off Bg, used only where a card needs to read as a distinct region without a border (rare; most separation is border-based).
- **Border** (`oklch(0.88 0 0)`) — the primary separator. Diagram boxes, cards, and dividers are mostly built from Border + Bg, not fills.
- **Ink** (`oklch(0.18 0 0)`) — body and heading text. Measured 18.7:1 against Bg.
- **Muted** (`oklch(0.5 0 0)`) — secondary text (dates, captions, byline context). Measured 6.0:1 against Bg — clears AA with margin.

### Named Rules
**The One Color Rule.** Signal Blue appears in exactly two places: connectors and hover/active state. If a third use case wants color, the answer is almost always "use weight or size instead," not "spend the accent again."

**The No-Glow Rule.** No box-shadow-as-glow, no blur, no atmospheric background. If a state needs emphasis, change border color/weight or background tint — never add a shadow that makes something look like it's lit from within. That was v1's tell.

## Typography

**Display Font:** General Sans (Fontshare) — the only family for identity, headings, and body.
**Body Font:** General Sans, same family, lighter weight.
**Label/Mono Font:** JetBrains Mono — tech-stack tags only. Not badges, not dates, not anything else.

**Character:** One voice, carried by weight and size rather than a second typeface — the "single well-chosen family with committed weight/size contrast" case, deliberately, because a display+mono system was part of what read as over-designed in v1.

### Hierarchy
- **Display** (General Sans 600, `clamp(1.75rem, 3.5vw, 2.5rem)`, line-height 1.15): project titles in the detail view.
- **Headline** (General Sans 600, 1.25rem): section headers ("Architecture", stage box titles at diagram scale).
- **Title** (General Sans 600, 1rem): diagram box labels, card titles.
- **Body** (General Sans 400, 1rem, line-height 1.6, max 65–75ch): descriptions.
- **Label** (JetBrains Mono 500, 0.7rem): tech-stack tags — the one remaining mono use in the whole system.

### Named Rules
**The Mono-Is-Rare Rule.** Monospace appears only on tech-stack tags. Everywhere v1 used it by reflex (dates, stage badges, metadata) now uses General Sans at a smaller size or lighter weight instead — mono stopped being "the technical voice" and started being wallpaper; pulling it back to one real use restores its meaning.

## Elevation

Flat. No shadows, no blur, anywhere in this version. Separation between elements comes entirely from Border and the rare Surface lift — never from a shadow implying depth or glow implying light.

### Named Rules
**The Flat-By-Default Rule.** If a component wants a shadow "to make it pop," that's a sign the layout or contrast is doing insufficient work, not a reason to add one.

## Do's and Don'ts

### Do:
- **Do** default to Border + Bg for separating regions; reach for Surface only when a border genuinely doesn't read.
- **Do** keep Signal Blue to its two jobs (connectors, hover/active state) — per the One Color Rule.
- **Do** use General Sans for every date, badge, and label that v1 put in mono — mono is earned only by tech-stack tags now.
- **Do** keep the connector animation faint and slow enough that a visitor has to look for it, not fast enough that it looks for them.
- **Do** provide a `prefers-reduced-motion` fallback for the connector pulse and any transitions, per PRODUCT.md's Accessibility section.

### Don't:
- **Don't** add box-shadow glow, blur, or an atmospheric background — the No-Glow Rule is a direct response to what didn't work in v1.
- **Don't** reintroduce a second display typeface or expand mono beyond tech-stack tags — that pairing is what read as "dev-tool-coded."
- **Don't** make the diagram draggable or let boxes leave their canonical position — the recognizability of the real lifecycle diagram is the entire point, and a scrambled diagram loses it.
- **Don't** add a floating chrome element (mini-map, persistent shortcut button) that isn't already part of the diagram itself — Resume/Contact/Links are now Output boxes in the diagram, not separate UI.
- **Don't** revert to the amber/dark-cinematic direction (v1) or the original light-editorial/indigo direction (v0) — both are documented in CLAUDE.md as historical only.
