import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Feuille de style d'impression commune à toutes les listes imprimables
 * (élèves, enseignants, utilisateurs, statistiques...).
 *
 * Objectif : regrouper un maximum d'informations sur une page —
 * police monospace très compacte, marges de 0,6 cm sur toutes les feuilles.
 */
const PRINT_PAGE_STYLE = `
  @page {
    size: auto;
    margin: 0.6cm;
  }

  @media print {
    html, body {
      background: #fff !important;
    }

    .print-only {
      display: block !important;
    }

    .print-only, .print-only * {
      font-family: 'JetBrains Mono', 'Courier New', monospace !important;
      color: #000 !important;
      box-sizing: border-box;
    }

    .print-only h1 {
      font-size: 11px;
      font-weight: 700;
      margin: 0 0 1mm 0;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .print-only .print-meta {
      font-size: 7.5px;
      margin: 0 0 2mm 0;
      display: flex;
      flex-wrap: wrap;
      gap: 0 4mm;
    }

    .print-only table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7px;
      line-height: 1.25;
    }

    .print-only th,
    .print-only td {
      border: 0.4pt solid #000;
      padding: 0.6mm 1.2mm;
      text-align: left;
      vertical-align: top;
    }

    .print-only th {
      font-weight: 700;
      background: #eee !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .print-only thead {
      display: table-header-group;
    }

    .print-only tr {
      page-break-inside: avoid;
    }

    .print-only .print-footer {
      margin-top: 2mm;
      font-size: 6.5px;
      text-align: right;
    }
  }
`;

/**
 * Hook générique : fournit une ref à attacher au composant imprimable
 * (ex: <PrintableTable ref={printRef} .../>) et une fonction print()
 * à brancher sur navbarActions.onPrint pour utiliser l'icône Imprimante
 * déjà présente dans l'entête de chaque page.
 */
export default function usePrintable(documentTitle = "Impression") {
  const printRef = useRef(null);

  const print = useReactToPrint({
    contentRef: printRef,
    documentTitle,
    pageStyle: PRINT_PAGE_STYLE,
  });

  return { printRef, print };
}
