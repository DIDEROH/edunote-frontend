import React from 'react'

export default function Paginate({
  currentPage = 1,
  lastPage = 1,
  onPageChange = () => {},
  siblingCount = 1, // nombre de pages autour de la page active
}) {
  if (lastPage === 1) return null // pas besoin de pagination si une seule page

  const createPageArray = () => {
    const pages = []
    const startPage = Math.max(2, currentPage - siblingCount)
    const endPage = Math.min(lastPage - 1, currentPage + siblingCount)

    // première page
    pages.push(1)

    // pointillés avant si nécessaire
    if (startPage > 2) pages.push('...')

    // pages du milieu
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // pointillés après si nécessaire
    if (endPage < lastPage - 1) pages.push('...')

    // dernière page
    if (lastPage > 1) pages.push(lastPage)

    return pages
  }

  const pages = createPageArray()

  const handlePageChange = (page) => {
    if (page === '...' || page === currentPage) return
    onPageChange(page)
  }

  return (
    <div className="join">
      <button
        className="join-item btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
      >
        «
      </button>

      {pages.map((page, idx) => (
        <button
          key={idx}
          className={`join-item btn ${
            page === currentPage ? 'btn-active' : ''
          } ${page === '...' ? 'btn-disabled' : ''}`}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className="join-item btn"
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(lastPage)}
      >
        »
      </button>
    </div>
  )
}
