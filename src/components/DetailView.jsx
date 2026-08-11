import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import MiniArchitecture from './MiniArchitecture'
import { useReducedMotion } from '../hooks/useReducedMotion'

const LINK_LABELS = {
  website: 'View Website',
  repo: 'View Repository',
  demo: 'View Live Demo',
}

// Matches .animate-detail-in/.animate-detail-out's duration in index.css.
const EXIT_ANIMATION_MS = 130
// How long the description crossfade takes to fade out before swapping content.
const SWAP_FADE_MS = 180

export default function DetailView({ project }) {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const [isExiting, setIsExiting] = useState(false)
  // Once the architecture wrapper's entrance animation finishes, its class
  // is dropped entirely rather than left attached — animation-fill-mode:
  // both holds transform: translateY(0) forever otherwise, and even though
  // that's visually a no-op, a non-none transform on an ancestor of
  // MiniArchitecture's own independently-scrollable container is a known
  // class of browser bug that can corrupt how the descendant's scroll
  // bounds get computed (this is very likely why the diagram was
  // unscrollable in one direction until something else forced a reflow).
  // No other reveal-wrapped section here has a scrollable descendant, so
  // this only needs doing for the architecture wrapper.
  const [architectureSettled, setArchitectureSettled] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null) // what the diagram currently has picked
  const [displayedNode, setDisplayedNode] = useState(null) // what's actually rendered in the text area
  const [swapFading, setSwapFading] = useState(false)
  const linkEntries = Object.entries(project.links ?? {})
  const paragraphs = Array.isArray(project.description) ? project.description : [project.description]
  const screenshots = project.screenshots ?? []

  // Belt-and-suspenders alongside the onAnimationEnd handler below: a tab
  // that's backgrounded/not visible at the moment the animation would run
  // (verified this actually happens under automated testing — Chrome
  // pauses CSS animations in hidden tabs) never fires animationend, which
  // would otherwise leave architectureSettled stuck false, and the lingering
  // transform bug right along with it. 1500ms comfortably covers this page's
  // worst-case stagger delay plus the animation's own 600ms duration.
  useEffect(() => {
    if (reducedMotion || !project.architecture) return
    const t = setTimeout(() => setArchitectureSettled(true), 1500)
    return () => clearTimeout(t)
  }, [reducedMotion, project.architecture])

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

  // Reuses .animate-detail-in, staggered across this page's sections in
  // reading order — same pattern as AboutDetail.jsx's bio reveal. Indices
  // are assigned sequentially so an absent optional section (no
  // architecture diagram, no screenshots) doesn't leave a gap in the
  // sequence. Skipped entirely while exiting, same reasoning as AboutDetail.
  let staggerIndex = 0
  const reveal = () => {
    if (reducedMotion || isExiting) return { className: '', style: undefined }
    return { className: ' animate-detail-in stagger-delay', style: { '--i': staggerIndex++ } }
  }
  const headerReveal = reveal()
  const architectureReveal = project.architecture ? reveal() : null
  const descriptionReveal = reveal()
  const screenshotsReveal = screenshots.length > 0 ? reveal() : null
  const techStackReveal = project.techStack?.length > 0 ? reveal() : null
  const linksReveal = linkEntries.length > 0 ? reveal() : null

  return (
    <div className="min-h-screen bg-bg px-4 pb-10 pt-20 sm:py-16">
      <Link
        to="/"
        onClick={handleBack}
        aria-label="Back to the lifecycle diagram"
        className="fixed left-4 top-4 z-modal flex h-10 w-10 items-center justify-center rounded border border-border bg-bg text-ink no-underline transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:left-6 sm:top-6"
      >
        <span aria-hidden="true">&larr;</span>
      </Link>

      {/* pt-20 (vs. sm:py-16's plain 4rem) clears the fixed back button below
          it — button bottom edge sits at top-4 + h-10 = 3.5rem, and content
          starts flush at the container's left edge too, so without the extra
          clearance the byline/title's first line sat directly under the
          button on mobile. Only needed below sm: the button moves out to
          left-6/top-6 there and py-16 already clears it with room to spare. */}
      <article
        className={`mx-auto w-full max-w-7xl px-2 sm:px-0 ${
          !reducedMotion && isExiting ? 'animate-detail-out' : ''
        }`}
      >
        <div className={`mx-auto max-w-2xl${headerReveal.className}`} style={headerReveal.style}>
          {project.company && (
            <div className="mb-3 font-body text-caption text-muted">{project.company}</div>
          )}

          <h1 className="text-balance text-display font-display font-semibold text-ink">{project.title}</h1>
        </div>

        {project.architecture && (
          <div
            className={`mt-6 flex justify-center${architectureSettled ? '' : architectureReveal.className}`}
            style={architectureSettled ? undefined : architectureReveal.style}
            onAnimationEnd={() => setArchitectureSettled(true)}
          >
            <MiniArchitecture
              architecture={project.architecture}
              selectedId={selectedNode?.id ?? null}
              onSelectNode={handleSelectNode}
            />
          </div>
        )}

        <div className="mx-auto max-w-2xl">
          {/* Split in two: the outer div plays the one-shot mount entrance,
              the inner div owns the swapFading crossfade. Both controlled
              the same element's opacity in the same div before, and once the
              entrance's animation-fill-mode: both finished, it kept holding
              opacity at 1 as an animation effect — which sits ABOVE the
              cascade and silently overrode the inner opacity-0 class from
              ever taking visual effect. Separating them means the entrance
              animation only ever touches the outer wrapper, so it's done and
              out of the way well before a node click can trigger the inner
              crossfade. */}
          <div className={descriptionReveal.className.trim()} style={descriptionReveal.style}>
            <div
              className={`mt-6 max-w-[70ch] transition-opacity duration-200 ease-out-quart ${
                swapFading ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {displayedNode ? (
                <div>
                  <span className="block font-body text-caption uppercase tracking-wide text-muted">
                    {displayedNode.category ?? 'Component'}
                  </span>
                  <h2 className="mt-1 font-display text-headline font-semibold text-ink">{displayedNode.label}</h2>
                  <p className="mt-2 text-pretty font-body text-body text-ink">
                    {displayedNode.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paragraphs.map((paragraph, i) => (
                    <p key={i} className="text-pretty font-body text-body text-ink">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {screenshots.length > 0 && (
            <div
              className={`mt-6 grid gap-4 ${screenshots.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}${screenshotsReveal.className}`}
              style={screenshotsReveal.style}
            >
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
            <ul
              className={`mt-6 flex flex-wrap gap-2${techStackReveal.className}`}
              style={techStackReveal.style}
              aria-label="Tech stack"
            >
              {project.techStack.map((t) => (
                <li
                  key={t}
                  className="rounded-sm border border-border px-2 py-0.5 font-mono text-label text-muted"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}

          {linkEntries.length > 0 && (
            <div className={`mt-6 flex flex-wrap gap-x-6 gap-y-2${linksReveal.className}`} style={linksReveal.style}>
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
