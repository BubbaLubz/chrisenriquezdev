export default function GenerationCard({ about }) {
  return (
    <div className="rounded border border-border bg-bg px-5 py-4">
      <span className="block font-body text-[0.7rem] uppercase tracking-wide text-muted">Generation</span>
      <h1 className="mt-1 font-display text-headline font-semibold text-ink">{about.name}</h1>
      <p className="mt-1 font-body text-sm text-muted">{about.tagline}</p>
      <p className="mt-3 max-w-[42ch] font-body text-sm leading-relaxed text-ink">{about.bio}</p>

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
    </div>
  )
}
