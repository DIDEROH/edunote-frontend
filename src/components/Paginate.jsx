import React, { useMemo } from 'react'

export default function Paginate({
  currentPage = 1,
  lastPage = 1,
  onPageChange = () => {},
  siblingCount = 1,
}) {
  if (lastPage <= 1) return null // Sécurité si 0 ou 1 page

  // OPTIMISATION : Calcul mémorisé. Ne s'exécute que si nécessaire.
  const pages = useMemo(() => {
    const pageArray = []
    const startPage = Math.max(2, currentPage - siblingCount)
    const endPage = Math.min(lastPage - 1, currentPage + siblingCount)

    pageArray.push(1)

    if (startPage > 2) pageArray.push('..._left') // Identifiant unique pour le map

    for (let i = startPage; i <= endPage; i++) {
      pageArray.push(i)
    }

    if (endPage < lastPage - 1) pageArray.push('..._right') // Identifiant unique

    if (lastPage > 1) pageArray.push(lastPage)

    return pageArray
  }, [currentPage, lastPage, siblingCount])

  const handlePageChange = (page) => {
    if (typeof page === 'string' || page === currentPage) return
    onPageChange(page)
  }

  return (
    <div className="join">
      {/* Bouton Page Précédente */}
      <button
        className="join-item btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ‹
      </button>

      {/* Liste des pages */}
      {pages.map((page) => {
        const isEllipsis = typeof page === 'string';
        const pageNumber = isEllipsis ? '...' : page;
        const isActive = page === currentPage;

        return (
          <button
            key={page.toString()} // Clé unique garantie
            className={`join-item btn ${isActive ? 'btn-active' : ''} ${
              isEllipsis ? 'btn-disabled pointer-events-none' : ''
            }`}
            onClick={() => handlePageChange(page)}
          >
            {pageNumber}
          </button>
        )
      })}

      {/* Bouton Page Suivante */}
      <button
        className="join-item btn"
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        ›
      </button>
    </div>
  )
}
