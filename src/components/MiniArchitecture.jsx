import { useEffect, useRef, useState } from 'react'

// A small, read-only rendering of a project's real architecture — a hand-placed
// CSS grid, not an auto-layout graph engine (same philosophy as the main
// lifecycle diagram: fixed positions, no drag, no measuring/refs).
//
// Data shape:
//   nodes: [{ id, label, category?, description?, col, row }]  — col/row are
//     1-indexed grid coordinates the author chooses. A node with
//     `description` is clickable.
//   edges: [{ from, to, label? }]                 — from/to must be *adjacent*
//     nodes (same row, neighboring col — or same col, neighboring row). This
//     is an authoring convention, not a general-purpose graph layout.
//
// Controlled component: selection lives in the parent (DetailView), which
// swaps the page's description text when a node is picked — so the parent
// needs to know what's selected, not just this component.
//
// Everything renders at once — no hidden branches, nothing to reveal.
// Clicking any node zooms the whole diagram in on it (and reports the
// selection up to the parent for the description crossfade); clicking it
// again, or clicking anywhere that isn't a node button, zooms back out.
//
// The outer wrapper clips vertically (overflow-y-hidden) at its natural
// size, so a zoomed neighbor running off the top/bottom edge is intentional
// — the vignette fades it out rather than showing a hard cut. Horizontally
// it's scrollable (overflow-x-auto) in the unzoomed state only: a dense
// diagram (PFAS's 9 columns) is wider than a narrow viewport can show at a
// readable size, and shrinking node/font size to force-fit a phone screen
// would make it unreadable rather than solving anything — scrolling to a
// fixed, legible size is the better trade. Chrome includes an element's own
// transform in its ancestor's scrollable-overflow calculation, so leaving
// overflow-x: auto on during the zoomed (scaled) state would surface a
// scrollbar for the zoom's intentional overflow too — that's switched to
// hidden while a node is selected, restoring the plain clip-and-vignette
// zoom behavior, and scroll position resets to 0 on zoom-in so it's always
// centered regardless of where the unzoomed view had been scrolled.
const ZOOM_SCALE = 2.1

export default function MiniArchitecture({ architecture, selectedId, onSelectNode }) {
  const containerRef = useRef(null)
  const scrollRef = useRef(null)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    if (selectedId && scrollRef.current) scrollRef.current.scrollLeft = 0
  }, [selectedId])

  useEffect(() => {
    if (!selectedId) return

    function handlePointerDown(e) {
      const clickedButton = e.target.closest('button')
      const isNodeButton = clickedButton && containerRef.current?.contains(clickedButton)
      if (!isNodeButton) onSelectNode(null)
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [selectedId, onSelectNode])

  // Hint fades in a second after landing on the unzoomed overview (on mount,
  // and again each time a node is deselected) — never while something is
  // already zoomed in, and it disappears the instant a node is picked rather
  // than waiting for its own timer.
  useEffect(() => {
    if (selectedId) {
      setShowHint(false)
      return
    }
    const timer = setTimeout(() => setShowHint(true), 1000)
    return () => clearTimeout(timer)
  }, [selectedId])

  if (!architecture?.nodes?.length) return null

  const { nodes, edges = [] } = architecture
  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const maxCol = Math.max(...nodes.map((n) => n.col))
  const maxRow = Math.max(...nodes.map((n) => n.row))
  const totalCols = 2 * maxCol - 1
  const totalRows = 2 * maxRow - 1
  const toTrack = (n) => 2 * n - 1

  // The spine is whichever row has the most nodes — detected from the data,
  // not authored, so there's nothing to keep in sync. Used only to give
  // branch/fallback nodes (anything off that row) a visually lighter,
  // dashed treatment — everything still renders, this just makes the main
  // pipeline path readable at a glance on denser diagrams instead of every
  // node carrying identical weight.
  const countsByRow = new Map()
  nodes.forEach((n) => countsByRow.set(n.row, (countsByRow.get(n.row) ?? 0) + 1))
  const spineRow = [...countsByRow.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]

  const selectedNode = selectedId ? nodeById[selectedId] : null
  const originX = selectedNode ? ((toTrack(selectedNode.col) - 0.5) / totalCols) * 100 : 50
  const originY = selectedNode ? ((toTrack(selectedNode.row) - 0.5) / totalRows) * 100 : 50
  const scale = selectedNode ? ZOOM_SCALE : 1

  // transform-origin is fixed at the box's own center for *both* states — it
  // never changes, so there's nothing discontinuous for the browser to snap.
  // Scaling around a fixed center moves a point at (originX, originY) to
  // 50 + scale*(originX - 50); folding the zoom's own scale into the
  // translate (rather than relying on a moving transform-origin) means the
  // zoom-in and zoom-out are the same continuous translate+scale
  // interpolation, just running in opposite directions.
  const translateX = scale * (50 - originX)
  const translateY = scale * (50 - originY)

  return (
    <div ref={containerRef}>
      <div
        ref={scrollRef}
        className={`no-scrollbar relative overflow-y-hidden overscroll-x-contain ${
          selectedNode ? 'overflow-x-hidden' : 'overflow-x-auto'
        }`}
      >
        <div
          className="grid w-max origin-center gap-x-1 gap-y-1 py-3 transition-transform duration-300 ease-out-quart"
          style={{
            gridTemplateColumns: `repeat(${totalCols}, minmax(0, auto))`,
            gridTemplateRows: `repeat(${totalRows}, auto)`,
            transform: `translate(${translateX}%, ${translateY}%) scale(${scale})`,
          }}
        >
          {/* Node category/label and edge labels run below the page's caption
              scale (0.55–0.65rem vs. text-caption's 0.7rem) on purpose — this
              is the diagram's own dense micro-type, not page chrome, and
              nodes are ~80px wide (w-20) with no room to grow into 0.7rem
              without breaking the grid on PFAS's 9-column layout. */}
          {nodes.map((n) => {
            const isSelected = n.id === selectedId
            const isBranch = n.row !== spineRow
            const clickable = Boolean(n.description)
            const Tag = clickable ? 'button' : 'div'

            return (
              <Tag
                key={n.id}
                type={clickable ? 'button' : undefined}
                aria-pressed={clickable ? isSelected : undefined}
                onClick={clickable ? () => onSelectNode(isSelected ? null : n) : undefined}
                style={{
                  gridColumn: toTrack(n.col),
                  gridRow: toTrack(n.row),
                }}
                className={`flex w-20 flex-col items-center justify-center gap-1 rounded-sm border px-1.5 py-1.5 text-center transition-colors duration-150 ${
                  isSelected ? 'border-accent' : 'border-border'
                } ${!isSelected && isBranch ? 'border-dashed' : ''} ${
                  clickable
                    ? 'bg-bg hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                    : 'bg-bg'
                }`}
              >
                {n.category && (
                  <span className="font-body text-[0.55rem] font-semibold uppercase tracking-wide text-muted">
                    {n.category}
                  </span>
                )}
                <span className={`text-[0.65rem] font-medium leading-snug ${isBranch ? 'text-muted' : 'text-ink'}`}>
                  {n.label}
                </span>
              </Tag>
            )
          })}

          {edges.map((e) => {
            const from = nodeById[e.from]
            const to = nodeById[e.to]
            if (!from || !to) return null
            const horizontal = from.row === to.row
            const gridColumn = horizontal ? 2 * Math.min(from.col, to.col) : toTrack(from.col)
            const gridRow = horizontal ? toTrack(from.row) : 2 * Math.min(from.row, to.row)
            const glyph = horizontal ? '→' : to.row > from.row ? '↓' : '↑'
            const isBranch = from.row !== spineRow || to.row !== spineRow

            return (
              <div
                key={`${e.from}->${e.to}`}
                style={{ gridColumn, gridRow }}
                className={`flex w-10 flex-col items-center justify-center justify-self-center px-0.5 text-muted ${
                  isBranch ? 'opacity-60' : ''
                }`}
              >
                <span aria-hidden="true">{glyph}</span>
                {e.label && <span className="text-center font-mono text-[0.55rem] leading-tight">{e.label}</span>}
              </div>
            )
          })}
        </div>

        {/* Vignette over whatever the zoom clips at the edges — fades to the
            page background rather than a hard cut, per DESIGN.md's flat/no-blur
            rule (a soft opacity gradient, not an actual blur). Only shown while
            zoomed; in the default 1x view nothing is cut off, so there's
            nothing to soften. */}
        {selectedNode && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-bg to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-bg to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-bg to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-bg to-transparent" />
          </>
        )}
      </div>

      {/* In normal flow below the scrollable diagram, not overlaid on top of
          it — an absolutely-positioned hint centered on the diagram's own
          bounding box would collide with real content whenever a diagram's
          bottom row doesn't span the full width (PFAS's orchestration/loader
          nodes sit narrower than the row above them), reading as a stray
          extra node instead of a caption. */}
      <div
        aria-hidden="true"
        className={`mt-2 flex justify-center font-body text-caption uppercase tracking-wide text-muted transition-opacity duration-200 ease-out-quart ${
          showHint ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="whitespace-nowrap rounded-sm border border-border bg-bg px-3 py-1.5">
          Click any node to explore
        </span>
      </div>
    </div>
  )
}
