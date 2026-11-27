/**
 * Pagination driven by the contract `meta` ({ page, pages, total, limit }).
 *   <Pagination meta={meta} onPageChange={setPage} />        // renders nothing when pages <= 1
 */
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

function range(page, pages) {
  const set = new Set([1, pages, page, page - 1, page + 1].filter((p) => p >= 1 && p <= pages))
  const sorted = [...set].sort((a, b) => a - b)
  const out = []
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push('gap')
    out.push(p)
  })
  return out
}

export function Pagination({ meta, onPageChange }) {
  const page = meta?.page ?? 1
  const pages = meta?.pages ?? 1
  if (pages <= 1) return null
  return (
    <nav className="ag-pager" aria-label="Pagination">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page"><LuChevronLeft aria-hidden="true" /></button>
      {range(page, pages).map((p, i) =>
        p === 'gap' ? <span key={`g${i}`} className="ag-pager__gap" aria-hidden="true">…</span> : (
          <button key={p} type="button" onClick={() => onPageChange(p)} aria-current={p === page ? 'page' : undefined} aria-label={`Page ${p}`}>{p}</button>
        ))}
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= pages} aria-label="Next page"><LuChevronRight aria-hidden="true" /></button>
    </nav>
  )
}
