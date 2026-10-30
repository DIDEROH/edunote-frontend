import { useEffect, useRef, useState } from "react";

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Nombre qui défile jusqu'à sa valeur (ease-out), au format français.
 * `format` permet un suffixe (ex. « 62 % »). Valeur absente : « — ».
 */
export default function CountUp({ value, duration = 900, format = (n) => n.toLocaleString("fr-FR"), decimals = 0 }) {
  const target = Number(value);
  const valid = value !== null && value !== undefined && !Number.isNaN(target);
  const [display, setDisplay] = useState(valid && reducedMotion() ? target : 0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!valid) return undefined;
    if (reducedMotion()) {
      const id = requestAnimationFrame(() => setDisplay(target));
      return () => cancelAnimationFrame(id);
    }
    const from = fromRef.current;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const current = from + (target - from) * eased;
      setDisplay(current);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, valid, duration]);

  if (!valid) return "—";
  const factor = 10 ** decimals;
  return format(Math.round(display * factor) / factor);
}
