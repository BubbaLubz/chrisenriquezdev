export default function OutputCard({ label, title, href, external }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="group block rounded border border-border bg-bg px-4 py-3 no-underline transition-colors duration-150 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="block font-body text-[0.7rem] uppercase tracking-wide text-muted group-hover:text-accent">
        {label}
      </span>
      <span className="mt-1 block font-body text-sm font-semibold text-ink">{title}</span>
    </a>
  )
}
