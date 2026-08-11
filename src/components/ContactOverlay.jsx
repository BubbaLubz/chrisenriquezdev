import { useEffect, useRef, useState } from 'react'

// Longer of the two transition durations below — how long to keep the node
// mounted after close so the exit transition can actually finish playing.
const TRANSITION_MS = 700

// A centered overlay for contact info + social links, opened from the
// Output section instead of navigating away immediately. Backdrop dims with
// the whole-element opacity-* utility (not a bg-ink/opacity modifier — that
// silently fails on this project's plain-oklch color tokens, see CLAUDE.md).
//
// Entrance and exit both animate via a single `visible` class toggle driving
// a CSS transition, rather than a pair of @keyframes animations. That matters:
// this component previously used mirrored @keyframes for in/out, but swapping
// animation-name on an element already resting at the new animation's exact
// "from" value (via the previous animation's fill-mode: both) doesn't
// reliably restart in Chrome — the exit silently no-op'd and the node just
// vanished when the unmount timer fired. A transition instead reacts to any
// real value change, so it can't hit that no-op case in either direction.
export default function ContactOverlay({ open, onClose, about }) {
  const [rendered, setRendered] = useState(false)
  const [visible, setVisible] = useState(false)
  const closeButtonRef = useRef(null)

  // Mount immediately on open; delay unmount on close until the exit
  // transition has had time to finish.
  useEffect(() => {
    if (open) {
      setRendered(true)
    } else if (rendered) {
      const t = setTimeout(() => setRendered(false), TRANSITION_MS)
      return () => clearTimeout(t)
    }
  }, [open, rendered])

  // Mount hidden, then flip to visible a frame later so there's a real
  // "from" value for the transition to interpolate away from. Closing flips
  // it back right away.
  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }
    if (!rendered) return
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [open, rendered])

  useEffect(() => {
    if (!rendered || !visible) return
    closeButtonRef.current?.focus()
  }, [rendered, visible])

  useEffect(() => {
    if (!rendered) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [rendered, onClose])

  if (!rendered) return null

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-ink transition-opacity duration-[550ms] ease-out-expo ${
          visible ? 'opacity-60' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Contact and social links"
        className={`relative w-full max-w-sm rounded-md border border-border bg-bg p-6 transition-[opacity,transform] duration-700 ease-out-expo ${
          visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-[0.98]'
        }`}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <h2 className="font-display text-headline font-semibold text-ink">Get in touch</h2>

        <div className="mt-4 space-y-4">
          <div>
            <span className="block font-body text-caption uppercase tracking-wide text-muted">Email</span>
            <a href={about.email} className="mt-1 block font-body text-sm text-ink">
              {about.email.replace('mailto:', '')}
            </a>
          </div>

          <div>
            <span className="block font-body text-caption uppercase tracking-wide text-muted">Social</span>
            <div className="mt-1 flex flex-col gap-1">
              {about.links.linkedin && (
                <a href={about.links.linkedin} target="_blank" rel="noreferrer" className="font-body text-sm text-ink">
                  LinkedIn
                </a>
              )}
              {about.links.github && (
                <a href={about.links.github} target="_blank" rel="noreferrer" className="font-body text-sm text-ink">
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
