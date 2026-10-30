import { useId, useMemo, useState } from "react";
import { m } from "motion/react";
import { niceMax, smoothPath, useElementWidth } from "../../utils/chart";

const HEIGHT = 250;
const COMPACT_HEIGHT = 200;
const PADDING = { top: 18, right: 18, bottom: 30, left: 40 };

/** Couleurs du tracé : sur panneau clair, ou lumineuses sur fond sombre */
const TONES = {
  light: {
    lines: ["#4F46E5", "#0891B2", "#DB2777"],
    glow: [null, null, null],
    fillOpacity: 0.2,
    grid: "#E6E8F4",
    text: "fill-base-content/50",
    legend: "text-base-content/60",
    guide: "#141631",
    dot: "#FFFFFF",
    tooltip: "bg-neutral text-white",
  },
  dark: {
    lines: ["#22D3EE", "#A5B4FC", "#F472B6"],
    glow: [
      "drop-shadow(0 0 6px rgb(34 211 238 / 0.7))",
      "drop-shadow(0 0 6px rgb(165 180 252 / 0.6))",
      "drop-shadow(0 0 6px rgb(244 114 182 / 0.6))",
    ],
    fillOpacity: 0.28,
    grid: "rgb(255 255 255 / 0.07)",
    text: "fill-white/45",
    legend: "text-white/65",
    guide: "#FFFFFF",
    dot: "#0E0D33",
    tooltip: "bg-white text-night",
  },
};

// Libellé d'axe court (« Seconde A4 Espagnol » → « Seconde A4 E… »)
const short = (label, max = 12) => (label.length > max ? `${label.slice(0, max - 1)}…` : label);

/**
 * Graphique en aires lissées (SVG, sans bibliothèque) : une ou plusieurs séries,
 * légende, points sur chaque valeur, survol avec infobulle. Les courbes se
 * dessinent à l'apparition. Les valeurs sont aussi lues par les lecteurs d'écran.
 *
 * data : [{ label, [clé]: nombre }] ; series : [{ key, label }]
 */
export default function AreaChart({
  data = [],
  title,
  series = [{ key: "value", label: title }],
  formatValue = (value) => String(value),
  tone = "light",
  max: fixedMax,
  emptyText = "Pas encore de données à afficher.",
}) {
  const [ref, width] = useElementWidth();
  const [hovered, setHovered] = useState(null);
  const gradientId = useId();
  const colors = TONES[tone];
  const hasLegend = series.length > 1;
  const height = width < 480 ? COMPACT_HEIGHT : HEIGHT;
  const plotWidth = width - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const max = niceMax(Math.max(0, ...data.flatMap((point) => series.map(({ key }) => Number(point[key]) || 0))), fixedMax);

  const lines = useMemo(
    () => series.map(({ key }) => data.map((point, index) => [
      PADDING.left + (data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth),
      PADDING.top + plotHeight - ((Number(point[key]) || 0) / max) * plotHeight,
    ])),
    [data, series, max, plotHeight, plotWidth],
  );

  if (data.length === 0) {
    return (
      <div ref={ref} className={`grid h-40 place-items-center text-sm ${tone === "dark" ? "text-white/45" : "text-base-content/45"}`}>
        {emptyText}
      </div>
    );
  }

  const baseline = PADDING.top + plotHeight;
  const xAt = (index) => lines[0][index][0];
  // Un libellé toutes les ~80 px au plus (jamais de chevauchement)
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(plotWidth / 80))));
  const hasLabel = (index) => (data.length - 1 - index) % labelEvery === 0;
  const showDots = data.length <= 24;

  function handlePointer(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * width;
    const ratio = (x - PADDING.left) / plotWidth;
    setHovered(Math.min(data.length - 1, Math.max(0, Math.round(ratio * (data.length - 1)))));
  }

  return (
    <div ref={ref} className="relative w-full">
      {hasLegend && (
        <ul aria-hidden="true" className={`flex flex-wrap justify-end gap-x-4 gap-y-1 px-2 pb-1 text-[11px] ${colors.legend}`}>
          {series.map(({ key, label }, index) => (
            <li key={key} className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: colors.lines[index], boxShadow: tone === "dark" ? `0 0 8px ${colors.lines[index]}` : undefined }} />
              {label}
            </li>
          ))}
        </ul>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={title}
        onPointerMove={handlePointer}
        onPointerLeave={() => setHovered(null)}
        className="block touch-pan-y"
      >
        <defs>
          {series.map(({ key }, index) => (
            <linearGradient key={key} id={`${gradientId}-${index}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={colors.lines[index]} stopOpacity={colors.fillOpacity} />
              <stop offset="100%" stopColor={colors.lines[index]} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((step) => {
          const y = PADDING.top + plotHeight - step * plotHeight;
          return (
            <g key={step}>
              <line x1={PADDING.left} x2={width - PADDING.right} y1={y} y2={y} stroke={colors.grid} strokeWidth="1" strokeDasharray={step === 0 ? undefined : "3 5"} />
              <text x={PADDING.left - 8} y={y + 4} textAnchor="end" className={`${colors.text} text-[11px] tabular-nums`}>
                {formatValue(Math.round(step * max))}
              </text>
            </g>
          );
        })}

        {lines.map((points, index) => {
          const line = smoothPath(points);
          if (!line || points.length < 2) return null;
          const area = `${line} L${points.at(-1)[0]},${baseline} L${points[0][0]},${baseline} Z`;
          return (
            <g key={series[index].key}>
              <m.path
                d={area}
                fill={`url(#${gradientId}-${index})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.15 }}
              />
              <m.path
                d={line}
                fill="none"
                stroke={colors.lines[index]}
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={colors.glow[index] ? { filter: colors.glow[index] } : undefined}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
              />
            </g>
          );
        })}

        {showDots && lines.map((points, index) => points.map(([x, y], i) => (
          <m.circle
            key={`${series[index].key}-${i}`}
            cx={x}
            cy={y}
            r={hovered === i ? 4.5 : 3}
            fill={colors.dot}
            stroke={colors.lines[index]}
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.03 }}
          />
        )))}

        {data.map((point, index) => (hasLabel(index) ? (
          <text
            key={`${point.label}-${index}`}
            x={xAt(index)}
            y={height - 8}
            textAnchor={data.length === 1 ? "middle" : index === 0 ? "start" : index === data.length - 1 ? "end" : "middle"}
            className={`${colors.text} text-[11px]`}
          >
            {short(String(point.label))}
          </text>
        ) : null))}

        {hovered !== null && (
          <line x1={xAt(hovered)} x2={xAt(hovered)} y1={PADDING.top} y2={baseline} stroke={colors.guide} strokeOpacity="0.2" strokeDasharray="3 3" />
        )}
      </svg>

      {hovered !== null && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute top-1 z-10 rounded-xl px-3 py-2 text-[11px] shadow-xl ${colors.tooltip}`}
          style={{
            left: `${(xAt(hovered) / width) * 100}%`,
            transform: `translateX(${xAt(hovered) > width / 2 ? "-105%" : "5%"})`,
          }}
        >
          <span className="block font-medium opacity-70">{data[hovered].label}</span>
          {series.map(({ key, label }, index) => (
            <span key={key} className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
              {hasLegend && <span className="size-1.5 rounded-full" style={{ background: colors.lines[index] }} />}
              <span className="font-semibold tabular-nums">{formatValue(data[hovered][key] ?? 0)}</span>
              {hasLegend && <span className="opacity-70">{label}</span>}
            </span>
          ))}
        </div>
      )}

      <div className="sr-only">
        <table>
          <caption>{title}</caption>
          {hasLegend && (
            <thead>
              <tr>
                <td />
                {series.map(({ key, label }) => <th key={key} scope="col">{label}</th>)}
              </tr>
            </thead>
          )}
          <tbody>
            {data.map((point, index) => (
              <tr key={`${point.label}-${index}`}>
                <th scope="row">{point.label}</th>
                {series.map(({ key }) => <td key={key}>{formatValue(point[key] ?? 0)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
