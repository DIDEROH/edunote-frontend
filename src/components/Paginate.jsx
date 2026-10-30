import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Pagination en pilules : précédent, pages (avec « … »), suivant */
export default function Paginate({
  currentPage = 1,
  lastPage = 1,
  onPageChange = () => {},
  siblingCount = 1,
}) {
  const pages = useMemo(() => {
    const pageArray = []
    const startPage = Math.max(2, currentPage - siblingCount)
    const endPage = Math.min(lastPage - 1, currentPage + siblingCount)

    pageArray.push(1)
    if (startPage > 2) pageArray.push('..._left')
    for (let i = startPage; i <= endPage; i++) pageArray.push(i)
    if (endPage < lastPage - 1) pageArray.push('..._right')
    if (lastPage > 1) pageArray.push(lastPage)

    return pageArray
  }, [currentPage, lastPage, siblingCount])

  if (lastPage <= 1) return null

  const handlePageChange = (page) => {
    if (typeof page === 'string' || page === currentPage) return
    onPageChange(page)
  }

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button
        type="button"
        className="ui-icon-btn ui-icon-btn-sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Page précédente"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page) => {
        const isEllipsis = typeof page === 'string'
        const isActive = page === currentPage
        return isEllipsis ? (
          <span key={page} className="px-1 text-xs text-base-content/40">…</span>
        ) : (
          <button
            type="button"
            key={page}
            onClick={() => handlePageChange(page)}
            aria-current={isActive ? 'page' : undefined}
            className={`grid h-8 min-w-8 place-items-center rounded-full px-2 text-xs font-semibold transition-colors ${
              isActive ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-base-content/70 hover:bg-base-300'
            }`}
          >
            {page}
          </button>
        )
      })}

      <button
        type="button"
        className="ui-icon-btn ui-icon-btn-sm"
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Page suivante"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
