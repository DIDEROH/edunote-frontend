/** Courbe « ease-out » douce (apparitions) */
export const EASE_OUT = [0.22, 1, 0.36, 1];

/** Ressort vif sans rebond excessif (menus, fenêtres) */
export const SPRING = { type: "spring", stiffness: 320, damping: 30 };

/** Apparition par le bas */
export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

/** Apparition simple */
export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

/** Fenêtre qui s'ouvre (léger zoom) */
export const popIn = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: EASE_OUT } },
  exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.18 } },
};

/** Conteneur qui fait apparaître ses enfants l'un après l'autre */
export function stagger(staggerChildren = 0.06, delayChildren = 0) {
  return {
    hidden: {},
    show: { transition: { staggerChildren, delayChildren } },
  };
}
