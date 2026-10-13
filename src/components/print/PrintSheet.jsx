/**
 * Feuille imprimée avec une marge de 0,7 cm sur TOUTES ses pages, y compris
 * quand le contenu (un long bulletin) déborde sur la page suivante.
 *
 * Le navigateur répète l'en-tête et le pied d'un tableau sur chaque page
 * imprimée : ils portent ici la marge du haut et du bas (styles .print-sheet
 * dans index.css). À l'écran, la feuille n'ajoute aucun espace.
 */
export default function PrintSheet({ children }) {
  return (
    <table className="print-sheet">
      <thead>
        <tr><td><div className="print-sheet-margin" /></td></tr>
      </thead>
      <tbody>
        <tr><td>{children}</td></tr>
      </tbody>
      <tfoot>
        <tr><td><div className="print-sheet-margin" /></td></tr>
      </tfoot>
    </table>
  );
}
