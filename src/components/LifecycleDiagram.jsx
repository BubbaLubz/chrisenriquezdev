import { about } from '../data/about'
import { projects, getProjectsByStage } from '../data/projects'
import { skills } from '../data/skills'
import GenerationCard from './GenerationCard'
import StageBox from './StageBox'
import OutputCard from './OutputCard'
import UndercurrentsBand from './UndercurrentsBand'
import Connector from './Connector'
import { useReducedMotion } from '../hooks/useReducedMotion'

// Fixed layout matching the real data engineering lifecycle diagram shape —
// no drag, no pan, no graph engine. See CLAUDE.md's "Lifecycle Diagram
// Structure" for why the shape itself is not up for rearrangement.
export default function LifecycleDiagram() {
  const reducedMotion = useReducedMotion()
  const ingestion = getProjectsByStage('ingestion')[0]
  const transformation = getProjectsByStage('transformation')[0]
  const storage = getProjectsByStage('storage')[0]
  const serving = getProjectsByStage('serving')[0]

  return (
    // This outer shell stays static (no transform) and pinned to exactly
    // min-h-screen — the entrance animation lives on the inner wrapper below
    // instead, so its transient translateY never pushes the page's bottom
    // edge past the viewport and flickers a scrollbar into existence.
    <div className="flex min-h-screen flex-col justify-center">
      <div
        className={`mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-8 ${
          reducedMotion ? '' : 'animate-detail-in'
        }`}
      >
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          <div className="md:w-64 md:shrink-0">
            <GenerationCard about={about} />
          </div>

          <div className="flex justify-center md:block">
            <Connector direction="vertical" />
          </div>
          <span className="hidden shrink-0 md:block">
            <Connector direction="horizontal" />
          </span>

          <div className="flex-1 rounded-lg border-2 border-ink p-3">
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch">
              <div className="sm:flex-1">{ingestion && <StageBox project={ingestion} />}</div>
              <div className="flex justify-center sm:hidden">
                <Connector direction="vertical" />
              </div>
              <div className="hidden items-center justify-center sm:flex">
                <Connector direction="horizontal" />
              </div>
              <div className="sm:flex-1">{transformation && <StageBox project={transformation} />}</div>
              <div className="flex justify-center sm:hidden">
                <Connector direction="vertical" />
              </div>
              <div className="hidden items-center justify-center sm:flex">
                <Connector direction="horizontal" />
              </div>
              <div className="sm:flex-1">{serving && <StageBox project={serving} />}</div>
            </div>

            <div className="mt-3 border-t border-border pt-3">
              {storage && <StageBox project={storage} fullWidth />}
            </div>
          </div>

          <div className="flex justify-center md:block">
            <Connector direction="vertical" />
          </div>
          <span className="hidden shrink-0 md:block">
            <Connector direction="horizontal" />
          </span>

          <div className="flex flex-col gap-2 md:w-56 md:shrink-0">
            <OutputCard label="Output" title="Resume" href={about.resume} />
            <OutputCard label="Output" title="Contact Information" href={about.email} />
            <OutputCard label="Output" title="Social Media" href={about.links.linkedin} external />
          </div>
        </div>

        <UndercurrentsBand skills={skills} />
      </div>
    </div>
  )
}
