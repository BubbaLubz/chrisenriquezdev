export default function UndercurrentsBand({ skills }) {
  return (
    <div className="border-t border-border pt-4">
      <span className="block text-center font-body text-caption uppercase tracking-wide text-muted">
        Undercurrents
      </span>
      <ul className="mt-3 flex flex-wrap justify-center gap-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className="rounded-sm border border-border px-2.5 py-1 font-body text-xs text-muted"
          >
            {skill}
          </li>
        ))}
      </ul>
    </div>
  )
}
