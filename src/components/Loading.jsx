/** Petit anneau de chargement (dans un bouton, une ligne…) */
export default function Loading({ load, className = "" }) {
  return load ? <span className={`ui-spinner ${className}`} role="status" aria-label="Chargement" /> : null;
}
