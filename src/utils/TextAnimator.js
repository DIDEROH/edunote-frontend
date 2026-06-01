import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import Splitting from 'splitting';
// Note: Assurez-vous d'importer le CSS de Splitting dans votre index.js ou App.jsx


/**
 * Composant TextAnimator
 * Utilise Splitting.js pour découper le texte et GSAP pour animer chaque lettre.
 * Cible les éléments avec la classe 'animation-title-duro'.
 */
export default function TextAnimator() {
  const location = useLocation();

  useEffect(() => {
    // On cible les titres à animer
    const targets = document.querySelectorAll('.animation-title-duro');
    
    if (targets.length > 0) {
      // 1. Splitting.js découpe le texte en spans (.char)
      const results = Splitting({
        target: targets,
        by: 'chars'
      });

      results.forEach((result) => {
        const chars = result.chars;

        // 2. Configuration de l'état initial des lettres
        gsap.set(chars, { 
          opacity: 0,
          y: 20,
          rotateX: -90,
          transformOrigin: "top center"
        });

        // 3. Animation d'apparition lettre par lettre
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.6,
          stagger: 0.03, // Délai entre chaque lettre
          ease: "back.out(1.7)",
          delay: 0.3,
          onComplete: () => {
            // Optionnel : on peut nettoyer les classes de Splitting ici si besoin
          }
        });
      });
    }
  }, [location]);

  return null;
}