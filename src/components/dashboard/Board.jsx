import { useId } from "react";
import { Link } from "react-router-dom";
import { m } from "motion/react";
import CountUp from "../ui/CountUp";
import { fadeUp, stagger } from "../motion/variants";

/**
 * Grand bloc de chiffres (modèle AllumaPro) : panneau de verre sombre, la
 * courbe en haut, puis tous les chiffres clés alignés en colonnes, sans cartes.
 */
export function ActivityBoard({ title, subtitle, action, chart, children, columns = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" }) {
  const titleId = useId();

  return (
    <m.section
      aria-labelledby={titleId}
      initial="hidden"
      animate="show"
      variants={fadeUp}
      className="glass-panel glow-top relative isolate overflow-hidden"
    >
      {/* Grille fine qui s'efface vers le bas */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [background-image:linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(180deg,#000,transparent_70%)]"
      />
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-7 sm:pt-6">
        <div className="flex min-w-0 items-start gap-3">
          <span aria-hidden="true" className="pulse-dot mt-1.5 shrink-0" />
          <div className="min-w-0">
            <h2 id={titleId} className="text-sm font-semibold text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-white/50">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      {chart && <div className="px-1 pt-3 sm:px-4">{chart}</div>}
      <m.ul
        variants={stagger(0.06, 0.2)}
        className={`grid gap-x-2 gap-y-1 border-t border-white/8 bg-linear-to-b from-night/20 to-night/50 px-3 pt-4 pb-4 sm:px-5 sm:pb-5 ${columns}`}
      >
        {children}
      </m.ul>
    </m.section>
  );
}

/**
 * Chiffre du bloc sombre : libellé en petites capitales, nombre qui défile,
 * précision. `tone="attention"` en ambre (ce qui demande une action).
 */
export function Metric({ label, value, hint, icon: Icon, tone = "default", to, format, decimals }) {
  const attention = tone === "attention";
  const content = (
    <>
      <p className="flex items-start gap-1.5 text-[10px] leading-tight font-semibold tracking-[0.1em] text-white/45 uppercase">
        {Icon && <Icon aria-hidden="true" size={12} className={`shrink-0 ${attention ? "text-amber-300" : "text-glow-cyan"}`} />}
        {label}
      </p>
      <p className={`mt-2 text-xl leading-none font-semibold tracking-tight tabular-nums sm:text-[1.4rem] ${attention ? "text-amber-300" : "text-white"}`}>
        {typeof value === "number" ? <CountUp value={value} format={format} decimals={decimals} /> : value ?? "—"}
      </p>
      {hint && <p className="mt-1.5 text-[11px] leading-snug text-white/45">{hint}</p>}
    </>
  );
  const className = "block min-w-0 rounded-xl px-2.5 py-2";

  return (
    <m.li variants={fadeUp} className="min-w-0">
      {to ? (
        <Link to={to} className={`${className} transition-colors hover:bg-white/6`}>{content}</Link>
      ) : (
        <div className={className}>{content}</div>
      )}
    </m.li>
  );
}

/** Panneau clair avec un titre, une précision et une action à droite */
export function Panel({ title, subtitle, icon: Icon, action, children, className = "", bodyClassName = "p-5" }) {
  return (
    <m.section initial="hidden" animate="show" variants={fadeUp} className={`surface ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 pb-1">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/10">
                <Icon size={17} />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
              {subtitle && <p className="mt-0.5 text-xs text-base-content/55">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </m.section>
  );
}

/** Barre de progression fine (taux de réussite, avancement) */
export function MiniBar({ value = 0, tone = "primary" }) {
  const colors = {
    primary: "from-primary to-glow-indigo",
    success: "from-emerald-500 to-teal-400",
    warning: "from-amber-500 to-yellow-400",
    error: "from-rose-500 to-pink-400",
  };
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-base-300">
      <m.span
        className={`block h-full rounded-full bg-linear-to-r ${colors[tone] ?? colors.primary}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </span>
  );
}
