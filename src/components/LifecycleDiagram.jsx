import { useState } from 'react'
import { about } from '../data/about'
import { projects, getProjectsByStage } from '../data/projects'
import { skills } from '../data/skills'
import GenerationCard from './GenerationCard'
import StageBox from './StageBox'
import OutputCard from './OutputCard'
import ContactOverlay from './ContactOverlay'
import UndercurrentsBand from './UndercurrentsBand'
import Connector from './Connector'
import { useReducedMotion } from '../hooks/useReducedMotion'

// Fixed layout matching the real data engineering lifecycle diagram shape —
// no drag, no pan, no graph engine. See CLAUDE.md's "Lifecycle Diagram
// Structure" for why the shape itself is not up for rearrangement.
export default function LifecycleDiagram() {
  const reducedMotion = useReducedMotion()
  const [contactOpen, setContactOpen] = useState(false)
  const ingestion = getProjectsByStage('ingestion')[0]
  const transformation = getProjectsByStage('transformation')[0]
  const storage = getProjectsByStage('storage')[0]
  const serving = getProjectsByStage('serving')[0]

  // Cards stagger in left-to-right, matching their on-screen order (see
  // .stagger-delay-fast in index.css — the "list rhythm" cadence for a row
  // of many small cards, vs. the slower .stagger-delay used on detail
  // pages' handful of larger sections).
  const reveal = (i) => (reducedMotion ? '' : ' animate-detail-in stagger-delay-fast')
  const revealStyle = (i) => (reducedMotion ? undefined : { '--i': i })
  // Undercurrents' entrance is its dividing rule (border-t) fading in above
  // the tag row — a translateY rise there reads as the line sliding upward
  // into place, so this one block gets the opacity-only variant instead of
  // the shared fade+rise every other card uses.
  const revealFade = (i) => (reducedMotion ? '' : ' animate-fade-in stagger-delay-fast')

  return (
    // This outer shell stays static (no transform) and pinned to exactly
    // min-h-screen — the entrance animation lives on the inner wrapper below
    // instead, so its transient translateY never pushes the page's bottom
    // edge past the viewport and flickers a scrollbar into existence.
    <div className="flex min-h-screen flex-col justify-center">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-8">
        {/* The translate re-centers Transformation under the Undercurrents
            line, at this row's actual rendered width (max-w-6xl's full
            1152px, the common case on real desktop viewports). Cause: the
            three stage boxes' badge labels (e.g. "TRANSFORMATION") can't
            wrap, so the middle flex-1 block renders wider than its fair
            share and overflows — which pushes its own center right of
            true-center by an amount driven entirely by what's to its LEFT
            (the Generation column + its connector), not by Output's width.
            27.6px is that offset, measured empirically against the current
            project titles/badge labels — re-check it if either changes
            length, or if a connector is added/removed on the Generation
            side. Deliberately decouples Generation's left edge from lining
            up with the Undercurrents rule below it. */}
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:-translate-x-[27.6px]">
          <div className={`md:w-64 md:shrink-0${reveal(0)}`} style={revealStyle(0)}>
            <GenerationCard about={about} />
          </div>

          <div className="flex justify-center md:hidden">
            <Connector direction="vertical" />
          </div>
          <span className="hidden shrink-0 md:block">
            <Connector direction="horizontal" />
          </span>

          <div className="flex-1 rounded-lg p-3">
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch">
              <div className={`sm:flex-1${reveal(1)}`} style={revealStyle(1)}>
                {ingestion && <StageBox project={ingestion} />}
              </div>
              <div className="flex justify-center sm:hidden">
                <Connector direction="vertical" />
              </div>
              <div className="hidden items-center justify-center sm:flex">
                <Connector direction="horizontal" />
              </div>
              <div className={`sm:flex-1${reveal(2)}`} style={revealStyle(2)}>
                {transformation && <StageBox project={transformation} />}
              </div>
              <div className="flex justify-center sm:hidden">
                <Connector direction="vertical" />
              </div>
              <div className="hidden items-center justify-center sm:flex">
                <Connector direction="horizontal" />
              </div>
              <div className={`sm:flex-1${reveal(3)}`} style={revealStyle(3)}>
                {serving && <StageBox project={serving} />}
              </div>
            </div>

            <div className={`mt-3 border-t border-border pt-3${reveal(4)}`} style={revealStyle(4)}>
              {storage && <StageBox project={storage} fullWidth />}
            </div>
          </div>

          <div className="flex justify-center md:hidden">
            <Connector direction="vertical" />
          </div>
          <span className="hidden shrink-0 md:block">
            <Connector direction="horizontal" />
          </span>

          <div className="flex flex-col gap-2 md:w-64 md:shrink-0">
            <div className={reveal(5).trim()} style={revealStyle(5)}>
              <OutputCard label="Output" title="Resume" href={about.resume} />
            </div>
            <div className={reveal(6).trim()} style={revealStyle(6)}>
              <OutputCard label="Output" title="Contact Information" onClick={() => setContactOpen(true)} />
            </div>
            <div className={reveal(7).trim()} style={revealStyle(7)}>
              <OutputCard label="Output" title="GitHub" href={about.links.github} external />
            </div>
          </div>
        </div>

        <div className={revealFade(8).trim()} style={revealStyle(8)}>
          <UndercurrentsBand skills={skills} />
        </div>
      </div>

      <ContactOverlay open={contactOpen} onClose={() => setContactOpen(false)} about={about} />
    </div>
  )
}
