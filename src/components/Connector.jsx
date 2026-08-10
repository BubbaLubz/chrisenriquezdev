// Faint, slow pulse — "a heartbeat, not a demo effect" (direct user instruction
// after v1's continuous edge-flow animation read as trying too hard). Reduced
// motion is handled globally in index.css (all animation-durations collapse).
export default function Connector({ direction = 'horizontal' }) {
  return (
    <span
      aria-hidden="true"
      className={`connector-pulse shrink-0 text-border ${direction === 'horizontal' ? 'px-1' : 'py-1'}`}
    >
      {direction === 'horizontal' ? '→' : '↓'}
    </span>
  )
}
