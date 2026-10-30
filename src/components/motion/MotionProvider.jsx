import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

/**
 * Animations de l'application : fonctions chargées une seule fois (LazyMotion,
 * composants `m.*`), et désactivées si l'appareil demande moins d'animations.
 */
export default function MotionProvider({ children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
