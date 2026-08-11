import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

// Matches .animate-detail-in/.animate-detail-out's duration in index.css —
// same pattern as DetailView.jsx's back-navigation exit animation.
const EXIT_ANIMATION_MS = 130

export default function AboutDetail({ about }) {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const [isExiting, setIsExiting] = useState(false)
  const paragraphs = about.fullBio?.length > 0 ? about.fullBio : [about.bio]

  const handleBack = (e) => {
    if (reducedMotion) return
    e.preventDefault()
    setIsExiting(true)
    setTimeout(() => navigate('/'), EXIT_ANIMATION_MS)
  }

  // Reuses .animate-detail-in's exact fade+rise (see index.css) but staggers
  // it across the page's four content blocks instead of firing once on the
  // whole article — the one signature entrance this page gets, per
  // PRODUCT.md's "one well-rehearsed entrance beats scattered
  // micro-interactions." Order matches reading order: name/tagline first,
  // then experience, then the bio itself, then the exit links. Skipped
  // entirely while exiting, so the article's own animate-detail-out (a
  // single block-level fade) isn't fighting four children on their own
  // staggered timers.
  const reveal = (index) => ({
    style: reducedMotion || isExiting ? undefined : { '--i': index },
  })
  const revealClass = reducedMotion || isExiting ? '' : ' animate-detail-in stagger-delay'

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
        className={`mx-auto w-full max-w-2xl px-2 sm:px-0 ${
          !reducedMotion && isExiting ? 'animate-detail-out' : ''
        }`}
      >
        <div className={revealClass} {...reveal(0)}>
          <h1 className="text-balance font-display text-display font-semibold text-ink">{about.name}</h1>
          <p className="mt-1 font-body text-sm text-muted">{about.tagline}</p>
        </div>

        {about.experience?.length > 0 && (
          <ul className={`mt-6 space-y-4${revealClass}`} {...reveal(1)}>
            {about.experience.map((role) => (
              <li key={role.title} className="font-body text-sm">
                <span className="block leading-snug text-ink">{role.title}</span>
                <span className="text-muted">{role.dateRange}</span>
              </li>
            ))}
          </ul>
        )}

        <div className={`mt-8 max-w-[70ch] space-y-4 border-t border-border pt-4${revealClass}`} {...reveal(2)}>
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="text-pretty font-body text-body text-ink">
              {paragraph}
            </p>
          ))}
        </div>

        <div className={`mt-8 flex flex-wrap gap-x-6 gap-y-2${revealClass}`} {...reveal(3)}>
          {about.resume && (
            <a href={about.resume} className="font-body text-sm text-ink">
              Resume
            </a>
          )}
          {about.links?.linkedin && (
            <a href={about.links.linkedin} target="_blank" rel="noreferrer" className="font-body text-sm text-ink">
              LinkedIn
            </a>
          )}
          {about.links?.github && (
            <a href={about.links.github} target="_blank" rel="noreferrer" className="font-body text-sm text-ink">
              GitHub
            </a>
          )}
          {about.email && (
            <a href={about.email} className="font-body text-sm text-ink">
              {about.email.replace('mailto:', '')}
            </a>
          )}
        </div>
      </article>
    </div>
  )
}
