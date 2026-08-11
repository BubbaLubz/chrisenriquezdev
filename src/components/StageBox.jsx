import { Link } from 'react-router-dom'
import { stageBadgeConfig } from '../data/projects'

// A real <a> via react-router's Link — native keyboard activation (Enter/Space
// just work), no custom role/tabIndex/keydown plumbing needed. v1 got this
// wrong by building a fake button inside a graph library's own focusable
// wrapper; routing through a real link sidesteps that whole class of bug.
export default function StageBox({ project, fullWidth }) {
  const label = stageBadgeConfig[project.stageBadge]?.label ?? project.stageBadge

  return (
    <Link
      to={`/project/${project.id}`}
      className={`group flex h-full flex-col justify-start rounded border border-border bg-bg px-4 py-3 text-left no-underline transition-colors duration-150 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      <span className="block font-body text-caption uppercase tracking-wide text-muted group-hover:text-accent">
        {label}
      </span>
      <span className="mt-1 block font-body text-title font-semibold text-ink">{project.title}</span>
    </Link>
  )
}
