import { Link } from 'react-router-dom'

// A real <a> via react-router's Link, matching StageBox's pattern — see
// StageBox.jsx for why (native keyboard activation, no fake-button plumbing).
export default function GenerationCard({ about }) {
  return (
    <Link
      to="/about"
      className="group block rounded border border-border bg-bg px-5 py-4 text-left no-underline transition-colors duration-150 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="block font-body text-caption uppercase tracking-wide text-muted group-hover:text-accent">
        Generation
      </span>
      <h1 className="mt-1 font-display text-headline font-semibold text-ink">{about.name}</h1>
      <p className="mt-1 font-body text-sm text-muted">{about.tagline}</p>
      <p className="mt-3 max-w-[42ch] font-body text-body text-ink">{about.bio}</p>

      {about.experience?.length > 0 && (
        <ul className="mt-4 space-y-3 border-t border-border pt-3">
          {about.experience.map((role) => (
            <li key={role.title} className="font-body text-xs">
              <span className="block leading-snug text-ink">{role.title}</span>
              <span className="text-muted">{role.dateRange}</span>
            </li>
          ))}
        </ul>
      )}
    </Link>
  )
}
