import { useEffect, useRef, useState } from "react";

/** Largeur réelle de l'élément, suivie au redimensionnement (tracé net à toute taille) */
export function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(640);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

/**
 * Haut de l'axe : quatre graduations « rondes » qui couvrent le maximum au plus
 * près (37 → 40, 230 → 240). `fixed` impose un maximum (ex. 100 pour des pourcentages).
 */
export function niceMax(value, fixed) {
  if (fixed) return fixed;
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value / 4));
  const factor = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((f) => f * magnitude >= value / 4);
  return factor * magnitude * 4;
}

/** Courbe lissée sans dépassement (interpolation monotone) */
export function smoothPath(points) {
  if (points.length < 2) return points.length ? `M${points[0][0]},${points[0][1]}` : "";

  const slopes = points.slice(0, -1).map(([x, y], index) => {
    const [nextX, nextY] = points[index + 1];
    return (nextY - y) / (nextX - x);
  });
  const tangents = points.map((_, index) => {
    if (index === 0) return slopes[0];
    if (index === points.length - 1) return slopes[slopes.length - 1];
    const before = slopes[index - 1];
    const after = slopes[index];
    return before * after <= 0 ? 0 : (before + after) / 2;
  });

  let path = `M${points[0][0]},${points[0][1]}`;
  for (let index = 0; index < points.length - 1; index++) {
    const [x0, y0] = points[index];
    const [x1, y1] = points[index + 1];
    const third = (x1 - x0) / 3;
    path += ` C${x0 + third},${y0 + tangents[index] * third} ${x1 - third},${y1 - tangents[index + 1] * third} ${x1},${y1}`;
  }
  return path;
}

/** Nombre au format français (1 234) */
export const formatNumber = (value) => (value == null || Number.isNaN(Number(value)) ? "—" : Number(value).toLocaleString("fr-FR"));
