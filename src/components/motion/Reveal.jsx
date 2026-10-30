import { m } from "motion/react";
import { fadeUp, stagger } from "./variants";

/**
 * Bloc qui apparaît en douceur (montée légère) au montage.
 * `as` : balise rendue (div par défaut) ; `delay` en secondes.
 */
export function Reveal({ as = "div", delay = 0, className = "", children, ...props }) {
  const Component = m[as] ?? m.div;
  return (
    <Component
      initial="hidden"
      animate="show"
      variants={fadeUp}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Liste dont les éléments (RevealItem) apparaissent l'un après l'autre */
export function RevealList({ as = "div", gap = 0.05, className = "", children, ...props }) {
  const Component = m[as] ?? m.div;
  return (
    <Component initial="hidden" animate="show" variants={stagger(gap)} className={className} {...props}>
      {children}
    </Component>
  );
}

export function RevealItem({ as = "div", className = "", children, ...props }) {
  const Component = m[as] ?? m.div;
  return (
    <Component variants={fadeUp} className={className} {...props}>
      {children}
    </Component>
  );
}
