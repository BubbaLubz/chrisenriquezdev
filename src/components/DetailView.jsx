import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { stageBadgeConfig } from '../data/projects'
import MiniArchitecture from './MiniArchitecture'
import { useReducedMotion } from '../hooks/useReducedMotion'

const LINK_LABELS = {
  repo: 'View repository',
  demo: 'View live demo',
}

// Matches .animate-detail-in/.animate-detail-out's duration in index.css.
const EXIT_ANIMATION_MS = 220
// How long the description crossfade takes to fade out before swapping content.
const SWAP_FADE_MS = 180

export default function DetailView({ project }) {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const [isExiting, setIsExiting] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null) // what the diagram currently has picked
  const [displayedNode, setDisplayedNode] = useState(null) // what's actually rendered in the text area
  const [swapFading, setSwapFading] = useState(false)
  const stage = stageBadgeConfig[project.stageBadge]
  const linkEntries = Object.entries(project.links ?? {})
  const paragraphs = Array.isArray(project.description) ? project.description : [project.description]
  const screenshots = project.screenshots ?? []

  const handleBack = (e) => {
    if (reducedMotion) return // let the Link navigate immediately, nothing to wait for
    e.preventDefault()
    setIsExiting(true)
    setTimeout(() => navigate('/'), EXIT_ANIMATION_MS)
  }

  // Fade the current text out, swap what's rendered, fade the new text in —
  // rather than an abrupt content swap. Drives both the paragraph <-> node
  // description swap and the node's own zoom (that part is pure CSS, keyed
  // off selectedNode in MiniArchitecture).
  const handleSelectNode = (node) => {
    setSelectedNode(node)
    if (reducedMotion) {
      setDisplayedNode(node)
      return
    }
    setSwapFading(true)
    setTimeout(() => {
      setDisplayedNode(node)
      setSwapFading(false)
    }, SWAP_FADE_MS)
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10 sm:py-16">
      <Link
        to="/"
        onClick={handleBack}
        aria-label="Back to the lifecycle diagram"
        className="fixed left-4 top-4 z-modal flex h-10 w-10 items-center justify-center rounded border border-border bg-bg text-ink no-underline transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:left-6 sm:top-6"
      >
        <span aria-hidden="true">&larr;</span>
      </Link>

      <article
        className={`mx-auto w-full max-w-7xl px-2 sm:px-0 ${
          reducedMotion ? '' : isExiting ? 'animate-detail-out' : 'animate-detail-in'
        }`}
      >
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex flex-wrap items-baseline gap-3 font-body text-xs">
            {stage && <span className="uppercase tracking-wide text-muted">{stage.label}</span>}
            {project.company && <span className="text-muted">{project.company}</span>}
          </div>

          <h1 className="text-balance text-display font-display font-semibold text-ink">{project.title}</h1>
        </div>

        {project.architecture && (
          <div className="mt-6 flex justify-center">
            <MiniArchitecture
              architecture={project.architecture}
              selectedId={selectedNode?.id ?? null}
              onSelectNode={handleSelectNode}
            />
          </div>
        )}

        <div className="mx-auto max-w-2xl">
          <div
            className={`mt-6 max-w-[70ch] transition-opacity duration-200 ease-out-quart ${
              swapFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {displayedNode ? (
              <div>
                <span className="block font-body text-[0.7rem] uppercase tracking-wide text-muted">
                  {displayedNode.category ?? 'Component'}
                </span>
                <h2 className="mt-1 font-display text-headline font-semibold text-ink">{displayedNode.label}</h2>
                <p className="mt-2 text-pretty font-body text-base leading-relaxed text-ink">
                  {displayedNode.description}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paragraphs.map((paragraph, i) => (
                  <p key={i} className="text-pretty font-body text-base leading-relaxed text-ink">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>

          {screenshots.length > 0 && (
            <div className={`mt-6 grid gap-4 ${screenshots.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
              {screenshots.map((shot) => (
                <img
                  key={shot.src}
                  src={shot.src}
                  alt={shot.alt}
                  loading="lazy"
                  className="w-full rounded border border-border"
                />
              ))}
            </div>
          )}

          {project.techStack?.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tech stack">
              {project.techStack.map((t) => (
                <li
                  key={t}
                  className="rounded-sm border border-border px-2 py-0.5 font-mono text-[0.7rem] text-muted"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}

          {linkEntries.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {linkEntries.map(([key, href]) => (
                <a key={key} href={href} target="_blank" rel="noreferrer" className="font-body text-sm text-ink">
                  {LINK_LABELS[key] ?? key}
                </a>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  )
}
