import { forwardRef } from "react";

/**
 * Tableau imprimable générique et dense (police monospace, très petite).
 * Rendu invisible à l'écran (.print-only), n'apparaît que via window.print()
 * déclenché par usePrintable().
 *
 * columns: [{ key, label, render?(row) }]
 * meta:    [{ label, value }] — ligne d'informations sous le titre
 *          (date, établissement, nombre total...)
 */
const PrintableTable = forwardRef(function PrintableTable(
  { title, meta = [], columns, rows = [] },
  ref
) {
  const now = new Date().toLocaleString("fr-FR");

  return (
    <div ref={ref} className="print-only">
      <h1>{title}</h1>

      {meta.length > 0 && (
        <div className="print-meta">
          {meta.map((m, i) => (
            <span key={i}>{m.label} : {m.value}</span>
          ))}
        </div>
      )}

      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : (row[c.key] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="print-footer">
        {rows.length} ligne(s) — Édité le {now} — EDUNOTE
      </div>
    </div>
  );
});

export default PrintableTable;
