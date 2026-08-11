// Either a direct link (href) or, when onClick is passed instead, a real
// button that opens something in place (e.g. the contact overlay) rather
// than navigating away.
export default function OutputCard({ label, title, href, external, onClick }) {
  const className =
    'group block w-full rounded border border-border bg-bg px-4 py-3 text-left no-underline transition-colors duration-150 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

  const content = (
    <>
      <span className="block font-body text-caption uppercase tracking-wide text-muted group-hover:text-accent">
        {label}
      </span>
      <span className="mt-1 block font-body text-title font-semibold text-ink">{title}</span>
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    )
  }

  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className={className}>
      {content}
    </a>
  )
}
